import { Order } from '../models/Order.js';
import { Visit } from '../models/Visit.js';
import { Driver } from '../models/Driver.js';
import { Supplier } from '../models/Supplier.js';
import { Site } from '../models/Site.js';
import { CreditNote } from '../models/CreditNote.js';
import { AuditLog } from '../models/AuditLog.js';
import { broadcastEvent } from '../socket/index.js';
export async function getSupplierIncoming(req, res) {
    const supplierKey = req.query.supplierKey || req.user?.supplierId || 'sup-cemex';
    const orders = await Order.find({ supplierKey, status: 'pending' }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
}
export async function getSupplierActive(req, res) {
    const supplierKey = req.query.supplierKey || req.user?.supplierId || 'sup-cemex';
    const orders = await Order.find({
        supplierKey,
        status: { $in: ['accepted', 'dispatched', 'on_site'] },
    }).sort({ updatedAt: -1 });
    const orderNumbers = orders.map((o) => o.orderNumber);
    const visits = await Visit.find({ orderNumber: { $in: orderNumbers } });
    res.json({ success: true, orders, visits });
}
export async function getSupplierHistory(req, res) {
    const supplierKey = req.query.supplierKey || req.user?.supplierId || 'sup-cemex';
    const orders = await Order.find({
        supplierKey,
        status: { $in: ['verified', 'completed', 'disputed'] },
    }).sort({ updatedAt: -1 });
    const orderNumbers = orders.map((o) => o.orderNumber);
    const [visits, creditNotes] = await Promise.all([
        Visit.find({ orderNumber: { $in: orderNumbers } }),
        CreditNote.find({ supplierKey }),
    ]);
    res.json({ success: true, orders, visits, creditNotes });
}
export async function acceptAndAssignDriver(req, res) {
    const { orderId } = req.params;
    const { driverKey, vehicleReg, eta } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
        res.status(404).json({ success: false, message: 'Order not found' });
        return;
    }
    const driver = await Driver.findOne({ driverKey });
    if (!driver) {
        res.status(404).json({ success: false, message: 'Driver not found' });
        return;
    }
    const site = await Site.findOne({ siteKey: order.siteKey });
    const primaryGate = site?.gates.find((g) => g.isPrimary) || site?.gates[0];
    const gateId = primaryGate ? primaryGate.gateId : 'gate-1';
    const gateName = primaryGate ? primaryGate.name : 'Main Gate 1';
    const reg = vehicleReg || driver.defaultVehicleReg;
    // Update order
    order.status = 'dispatched';
    order.assignedDriverKey = driver.driverKey;
    order.assignedDriverName = driver.name;
    order.assignedVehicleReg = reg;
    await order.save();
    // Create or update Visit
    const count = await Visit.countDocuments();
    const visitNumber = `VIS-2026-${String(810 + count + 1).padStart(4, '0')}`;
    // Cryptographically structured QR payload
    const qrPayload = `DJ-SITEFLOW://${order.orderNumber}/${gateId}/${Date.now()}`;
    let visit = await Visit.findOne({ orderNumber: order.orderNumber });
    if (!visit) {
        visit = new Visit({
            visitNumber,
            orderId: order._id,
            orderNumber: order.orderNumber,
            siteKey: order.siteKey,
            siteName: order.siteName,
            gateId,
            gateName,
            destinationId: order.destinationId,
            destinationName: order.destinationName,
            supplierKey: order.supplierKey,
            supplierName: order.supplierName,
            driverKey: driver.driverKey,
            driverName: driver.name,
            vehicleReg: reg,
            dispatchedQty: order.orderedQty,
            unit: order.unit,
            status: 'dispatched',
            eta: eta || '25 mins (10:45 AM)',
            distanceRemainingMiles: 8.4,
            journeyStartedAt: new Date(),
            qrPayload,
        });
    }
    else {
        visit.driverKey = driver.driverKey;
        visit.driverName = driver.name;
        visit.vehicleReg = reg;
        visit.status = 'dispatched';
        visit.eta = eta || visit.eta || '25 mins';
        visit.qrPayload = qrPayload;
    }
    await visit.save();
    // Update driver status
    driver.currentStatus = 'in_transit';
    await driver.save();
    // Audit Log
    await AuditLog.create({
        action: 'driver_assigned',
        entityType: 'visit',
        entityId: visit._id.toString(),
        actorId: req.user?.id,
        actorRole: req.user?.role || 'supplier',
        actorName: req.user?.name || 'Supplier Dispatcher',
        siteKey: order.siteKey,
        details: {
            orderNumber: order.orderNumber,
            driverName: driver.name,
            vehicleReg: reg,
            eta,
        },
    });
    // Cross-role Broadcasts
    broadcastEvent('driver:assigned', {
        order,
        visit,
        driver,
        message: `Driver ${driver.name} (${reg}) assigned to ${order.orderNumber}`,
    });
    res.json({ success: true, order, visit });
}
export async function declineOrder(req, res) {
    const { orderId } = req.params;
    const { reason } = req.body;
    const order = await Order.findById(orderId);
    if (!order) {
        res.status(404).json({ success: false, message: 'Order not found' });
        return;
    }
    order.status = 'declined';
    order.declineReason = reason || 'Batching plant capacity reached';
    await order.save();
    await AuditLog.create({
        action: 'order_declined',
        entityType: 'order',
        entityId: order._id.toString(),
        actorId: req.user?.id,
        actorRole: req.user?.role || 'supplier',
        actorName: req.user?.name || 'Supplier Dispatcher',
        siteKey: order.siteKey,
        details: {
            orderNumber: order.orderNumber,
            reason: order.declineReason,
        },
    });
    broadcastEvent('order:declined', {
        order,
        message: `Order ${order.orderNumber} was declined: ${order.declineReason}`,
    });
    res.json({ success: true, order });
}
export async function getSupplierDrivers(req, res) {
    const supplierKey = req.query.supplierKey || req.user?.supplierId || 'sup-cemex';
    const drivers = await Driver.find({ supplierKey, active: true });
    res.json({ success: true, drivers });
}
export async function getSuppliersList(req, res) {
    const suppliers = await Supplier.find({ active: true });
    res.json({ success: true, suppliers });
}
