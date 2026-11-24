import { Response } from 'express';
import { Visit } from '../models/Visit.js';
import { Order } from '../models/Order.js';
import { Verification, DiscrepancyReason } from '../models/Verification.js';
import { CreditNote } from '../models/CreditNote.js';
import { AuditLog } from '../models/AuditLog.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { broadcastEvent } from '../socket/index.js';

export async function verifyDelivery(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { visitId } = req.params;
  const { actualReceivedQty, reasonCode, proofNotes, isDisputed } = req.body;

  const visit = await Visit.findById(visitId);
  if (!visit) {
    res.status(404).json({ success: false, message: 'Visit record not found' });
    return;
  }

  const order = await Order.findById(visit.orderId);
  if (!order) {
    res.status(404).json({ success: false, message: 'Linked order not found' });
    return;
  }

  const actualQty = Number(actualReceivedQty);
  if (isNaN(actualQty) || actualQty < 0) {
    res.status(400).json({ success: false, message: 'Invalid actual received quantity' });
    return;
  }

  const varianceQty = actualQty - visit.dispatchedQty;
  const hasShortage = varianceQty < 0;
  const hasOverage = varianceQty > 0;
  const hasDiscrepancy = hasShortage || hasOverage || Boolean(isDisputed);

  let verificationStatus: 'verified_exact' | 'verified_shortage' | 'verified_overage' | 'disputed' =
    'verified_exact';

  if (isDisputed === true || isDisputed === 'true') {
    verificationStatus = 'disputed';
  } else if (hasShortage) {
    verificationStatus = 'verified_shortage';
  } else if (hasOverage) {
    verificationStatus = 'verified_overage';
  }

  // Handle uploaded proof photo if present
  let photoUrl: string | undefined = undefined;
  if (req.file) {
    photoUrl = `/uploads/${req.file.filename}`;
  }

  // Calculate credit note amount if shortage
  const unitPrice = order.unitPrice || 0;
  const creditNoteAmount = hasShortage ? Math.abs(varianceQty) * unitPrice : 0;

  // Create Verification record
  const verification = new Verification({
    visitId: visit._id,
    orderId: order._id,
    orderNumber: order.orderNumber,
    supervisorName: req.user?.name || 'Gate Marshal',
    orderedQty: order.orderedQty,
    dispatchedQty: visit.dispatchedQty,
    actualReceivedQty: actualQty,
    varianceQty,
    unit: visit.unit,
    status: verificationStatus,
    reasonCode: hasDiscrepancy ? (reasonCode as DiscrepancyReason) : undefined,
    proofNotes: proofNotes || '',
    photoUrl,
    hasDiscrepancy,
    creditNoteGenerated: hasShortage,
    creditNoteAmount,
    verifiedAt: new Date(),
  });

  await verification.save();

  // If shortage, generate Credit Note
  let creditNote = null;
  if (hasShortage) {
    const count = await CreditNote.countDocuments();
    const creditNoteNumber = `CN-2026-${String(810 + count + 1).padStart(4, '0')}`;

    creditNote = new CreditNote({
      creditNoteNumber,
      orderId: order._id,
      orderNumber: order.orderNumber,
      visitId: visit._id,
      supplierKey: order.supplierKey,
      supplierName: order.supplierName,
      amount: creditNoteAmount,
      varianceQty: Math.abs(varianceQty),
      unit: visit.unit,
      unitPrice,
      reason: proofNotes || `Short delivery of ${Math.abs(varianceQty)} ${visit.unit}`,
      status: 'issued',
    });

    await creditNote.save();
  }

  // Update Visit & Order states
  visit.status = 'verified';
  visit.verifiedAt = new Date();
  await visit.save();

  order.status = verificationStatus === 'disputed' ? 'disputed' : 'verified';
  await order.save();

  // Audit Log
  await AuditLog.create({
    action: 'delivery_verified',
    entityType: 'verification',
    entityId: verification._id.toString(),
    actorId: req.user?.id,
    actorRole: req.user?.role || 'marshal',
    actorName: req.user?.name || 'Gate Marshal',
    siteKey: visit.siteKey,
    details: {
      orderNumber: order.orderNumber,
      dispatchedQty: visit.dispatchedQty,
      actualReceivedQty: actualQty,
      varianceQty,
      status: verificationStatus,
      creditNoteAmount,
    },
  });

  // Cross-role Broadcast
  broadcastEvent('delivery:verified', {
    visit,
    order,
    verification,
    creditNote,
    message: `Delivery ${order.orderNumber} verified by ${verification.supervisorName}: ${actualQty}/${visit.dispatchedQty} ${visit.unit}`,
  });

  res.json({ success: true, verification, creditNote, visit, order });
}

export async function getDiscrepancies(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { siteKey } = req.query;
  const match: any = { hasDiscrepancy: true };

  const discrepancies = await Verification.find(match).sort({ verifiedAt: -1 });
  res.json({ success: true, discrepancies });
}

