import mongoose from 'mongoose';
import { Visit } from '../models/Visit.js';
import { Order } from '../models/Order.js';
import { Site } from '../models/Site.js';
import { Driver } from '../models/Driver.js';
import { AuditLog } from '../models/AuditLog.js';
import { broadcastEvent } from '../socket/index.js';
export async function scanOut(req, res) {
    const { visitId, orderNumber } = req.body;
    let visit = null;
    if (visitId && mongoose.Types.ObjectId.isValid(visitId)) {
        visit = await Visit.findById(visitId);
    }
    if (!visit && (orderNumber || visitId)) {
        visit = await Visit.findOne({
            $or: [
                { orderNumber: orderNumber || visitId },
                { visitNumber: visitId },
            ],
        });
    }
    if (!visit) {
        res.status(404).json({ success: false, message: 'Active on-site visit not found' });
        return;
    }
    const exitAt = new Date();
    const entryAt = visit.entryAt || new Date(Date.now() - 42 * 60 * 1000); // fallback 42 mins
    const durationMinutes = Math.max(1, Math.round((exitAt.getTime() - entryAt.getTime()) / 60000));
    visit.exitAt = exitAt;
    visit.durationMinutes = durationMinutes;
    visit.status = 'completed';
    await visit.save();
    // Update order status if not disputed
    let order = null;
    if (visit.orderId && mongoose.Types.ObjectId.isValid(String(visit.orderId))) {
        order = await Order.findById(visit.orderId);
    }
    if (!order && visit.orderNumber) {
        order = await Order.findOne({ orderNumber: visit.orderNumber });
    }
    if (order && order.status !== 'disputed') {
        // Check if this order has multiple visits, mark complete only when all visits are completed
        const remainingVisits = await Visit.countDocuments({
            orderId: order._id,
            _id: { $ne: visit._id },
            status: { $ne: 'completed' },
        });
        if (remainingVisits === 0) {
            order.status = 'completed';
            await order.save();
        }
    }
    // Update site active headcount
    const site = await Site.findOne({ siteKey: visit.siteKey });
    if (site && site.activeHeadcount > 0) {
        site.activeHeadcount = Math.max(0, site.activeHeadcount - 1);
        await site.save();
    }
    // Free driver
    await Driver.findOneAndUpdate({ driverKey: visit.driverKey }, { currentStatus: 'completed' });
    // Audit Log
    await AuditLog.create({
        action: 'gate_exit_scanned',
        entityType: 'gate',
        entityId: visit.gateId,
        actorId: req.user?.id,
        actorRole: req.user?.role || 'driver',
        actorName: req.user?.name || 'Driver / Marshal',
        siteKey: visit.siteKey,
        details: {
            orderNumber: visit.orderNumber,
            driverName: visit.driverName,
            vehicleReg: visit.vehicleReg,
            entryAt,
            exitAt,
            durationMinutes,
        },
    });
    // Cross-role Broadcast
    broadcastEvent('gate:exit_scanned', {
        visit,
        order,
        siteHeadcount: site?.activeHeadcount,
        message: `${visit.vehicleReg} scanned out. Site turnaround: ${durationMinutes} mins`,
    });
    res.json({
        success: true,
        message: 'Gate exit completed. Turnaround duration recorded.',
        visit,
        durationMinutes,
    });
}
