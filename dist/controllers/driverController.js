import { Visit } from '../models/Visit.js';
import { Order } from '../models/Order.js';
import { Driver } from '../models/Driver.js';
import { Site } from '../models/Site.js';
import { broadcastEvent } from '../socket/index.js';
export async function getDriverJobs(req, res) {
    const driverKey = req.query.driverKey || req.user?.driverId || 'drv-dave';
    const visits = await Visit.find({ driverKey }).sort({ createdAt: -1 });
    // Map to clean Driver Job View with STRICT ZERO PRICING
    const jobs = await Promise.all(visits.map(async (v) => {
        // Query order without commercial fields
        const order = await Order.findById(v.orderId).select('category description timeSlot deliveryDate');
        const site = await Site.findOne({ siteKey: v.siteKey });
        const dest = site?.destinations.find((d) => d.destId === v.destinationId);
        return {
            visitId: v._id,
            visitNumber: v.visitNumber,
            orderId: v.orderId,
            orderNumber: v.orderNumber,
            category: order?.category || 'Ready-Mix Concrete',
            description: order?.description || '',
            dispatchedQty: v.dispatchedQty,
            unit: v.unit,
            siteKey: v.siteKey,
            siteName: v.siteName,
            gateId: v.gateId,
            gateName: v.gateName,
            destinationId: v.destinationId,
            destinationName: v.destinationName,
            destinationCategory: dest?.category || 'Laydown',
            routeSvgPath: dest?.routeSvgPath || '',
            supplierKey: v.supplierKey,
            supplierName: v.supplierName,
            vehicleReg: v.vehicleReg,
            timeSlot: order?.timeSlot || '08:00 - 10:00',
            status: v.status,
            flagReason: v.flagReason,
            eta: v.eta,
            distanceRemainingMiles: v.distanceRemainingMiles,
            entryAt: v.entryAt,
            verifiedAt: v.verifiedAt,
            exitAt: v.exitAt,
            qrPayload: v.qrPayload,
        };
    }));
    res.json({ success: true, jobs });
}
export async function toggleDriverConsent(req, res) {
    const { driverKey, consent } = req.body;
    const targetDriverKey = driverKey || req.user?.driverId || 'drv-dave';
    const driver = await Driver.findOne({ driverKey: targetDriverKey });
    if (!driver) {
        res.status(404).json({ success: false, message: 'Driver not found' });
        return;
    }
    driver.consentTracking = Boolean(consent);
    await driver.save();
    broadcastEvent('driver:consent_toggled', {
        driverKey: targetDriverKey,
        consentTracking: driver.consentTracking,
    });
    res.json({ success: true, consentTracking: driver.consentTracking });
}
export async function updateDriverLocation(req, res) {
    const { driverKey, lat, lng, speed, heading, distanceRemainingMiles, eta } = req.body;
    const targetKey = driverKey || req.user?.driverId || 'drv-dave';
    const driver = await Driver.findOne({ driverKey: targetKey });
    if (!driver) {
        res.status(404).json({ success: false, message: 'Driver not found' });
        return;
    }
    driver.currentLocation = {
        lat: Number(lat),
        lng: Number(lng),
        speed: speed ? Number(speed) : undefined,
        heading: heading ? Number(heading) : undefined,
        updatedAt: new Date(),
    };
    await driver.save();
    // Also update active visit if any
    const activeVisit = await Visit.findOne({
        driverKey: targetKey,
        status: { $in: ['scheduled', 'dispatched'] },
    });
    if (activeVisit) {
        if (distanceRemainingMiles !== undefined)
            activeVisit.distanceRemainingMiles = Number(distanceRemainingMiles);
        if (eta)
            activeVisit.eta = eta;
        await activeVisit.save();
    }
    broadcastEvent('driver:location_updated', {
        driverKey: targetKey,
        location: driver.currentLocation,
        distanceRemainingMiles: activeVisit?.distanceRemainingMiles,
        eta: activeVisit?.eta,
    });
    res.json({ success: true, location: driver.currentLocation });
}
