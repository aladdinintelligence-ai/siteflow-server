import { Response } from 'express';
import { Visit } from '../models/Visit.js';
import { Order } from '../models/Order.js';
import { Site } from '../models/Site.js';
import { AuditLog } from '../models/AuditLog.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { broadcastEvent } from '../socket/index.js';

export async function scanIn(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { qrPayload, visitId, orderNumber, gateId } = req.body;

  let visit = null;

  if (visitId) {
    visit = await Visit.findById(visitId);
  } else if (orderNumber) {
    visit = await Visit.findOne({ orderNumber });
  } else if (qrPayload) {
    // Parse QR string (e.g. DJ-SITEFLOW://DJ-2026-0812/gate-1)
    const parts = qrPayload.replace('DJ-SITEFLOW://', '').split('/');
    const parsedOrderNum = parts[0];
    visit = await Visit.findOne({ orderNumber: parsedOrderNum });
  }

  if (!visit) {
    res.status(404).json({ success: false, message: 'Valid booking not found for scanned gate code' });
    return;
  }

  // Update site & gate details if provided
  if (gateId) {
    visit.gateId = gateId;
  }

  visit.status = 'on_site';
  visit.entryAt = new Date();
  await visit.save();

  // Update linked order
  await Order.findByIdAndUpdate(visit.orderId, { status: 'on_site' });

  // Update site active headcount
  const site = await Site.findOne({ siteKey: visit.siteKey });
  if (site) {
    site.activeHeadcount = (site.activeHeadcount || 0) + 1;
    await site.save();
  }

  // Fetch approved navigation route
  const destination = site?.destinations.find((d) => d.destId === visit.destinationId);

  // Audit Log
  await AuditLog.create({
    action: 'gate_entry_scanned',
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
      destinationName: visit.destinationName,
      entryAt: visit.entryAt,
    },
  });

  // Cross-role Broadcast
  broadcastEvent('gate:entry_scanned', {
    visit,
    orderNumber: visit.orderNumber,
    siteHeadcount: site?.activeHeadcount,
    destination,
    message: `Entry cleared for ${visit.vehicleReg} (${visit.supplierName}) at ${visit.gateName}`,
  });

  res.json({
    success: true,
    message: 'Gate entry authorised',
    visit,
    destination,
    routeSvgPath: destination?.routeSvgPath || '',
  });
}

export async function getExpectedVisits(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { siteKey } = req.query;
  const match: any = {
    status: { $in: ['scheduled', 'dispatched'] },
  };
  if (siteKey && siteKey !== 'all') match.siteKey = siteKey;

  const visits = await Visit.find(match).sort({ journeyStartedAt: -1, createdAt: -1 });
  res.json({ success: true, visits });
}

export async function getOnSiteVisits(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { siteKey } = req.query;
  const match: any = {
    status: { $in: ['on_site', 'verified', 'flagged'] },
  };
  if (siteKey && siteKey !== 'all') match.siteKey = siteKey;

  const visits = await Visit.find(match).sort({ entryAt: -1 });
  res.json({ success: true, visits });
}

export async function getExitLogs(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { siteKey } = req.query;
  const match: any = {
    status: 'completed',
    exitAt: { $exists: true },
  };
  if (siteKey && siteKey !== 'all') match.siteKey = siteKey;

  const visits = await Visit.find(match).sort({ exitAt: -1 }).limit(50);
  res.json({ success: true, visits });
}

export async function marshalFlagException(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { visitId } = req.params;
  const { reason } = req.body;

  const visit = await Visit.findById(visitId);
  if (!visit) {
    res.status(404).json({ success: false, message: 'Visit not found' });
    return;
  }

  visit.status = 'flagged';
  visit.flagReason = reason || 'Safety induction expired / unapproved delivery route';
  await visit.save();

  await AuditLog.create({
    action: 'marshal_flagged',
    entityType: 'visit',
    entityId: visit._id.toString(),
    actorId: req.user?.id,
    actorRole: req.user?.role || 'marshal',
    actorName: req.user?.name || 'Gate Marshal',
    siteKey: visit.siteKey,
    details: {
      orderNumber: visit.orderNumber,
      vehicleReg: visit.vehicleReg,
      reason: visit.flagReason,
    },
  });

  broadcastEvent('gate:marshal_flagged', {
    visit,
    message: `SAFETY EXCEPTION on ${visit.vehicleReg}: ${visit.flagReason}`,
  });

  res.json({ success: true, visit });
}

export async function marshalManualEntry(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { visitId, gateId } = req.body;

  const visit = await Visit.findById(visitId);
  if (!visit) {
    res.status(404).json({ success: false, message: 'Visit booking not found' });
    return;
  }

  visit.status = 'on_site';
  visit.entryAt = new Date();
  if (gateId) visit.gateId = gateId;
  await visit.save();

  await Order.findByIdAndUpdate(visit.orderId, { status: 'on_site' });

  const site = await Site.findOne({ siteKey: visit.siteKey });
  if (site) {
    site.activeHeadcount = (site.activeHeadcount || 0) + 1;
    await site.save();
  }

  await AuditLog.create({
    action: 'marshal_manual_entry',
    entityType: 'visit',
    entityId: visit._id.toString(),
    actorId: req.user?.id,
    actorRole: req.user?.role || 'marshal',
    actorName: req.user?.name || 'Gate Marshal',
    siteKey: visit.siteKey,
    details: {
      orderNumber: visit.orderNumber,
      vehicleReg: visit.vehicleReg,
    },
  });

  broadcastEvent('gate:entry_scanned', {
    visit,
    orderNumber: visit.orderNumber,
    siteHeadcount: site?.activeHeadcount,
    message: `Manual check-in granted for ${visit.vehicleReg} by Marshal`,
  });

  res.json({ success: true, visit });
}

