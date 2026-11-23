import { Response } from 'express';
import { Order, IOrder } from '../models/Order.js';
import { Visit } from '../models/Visit.js';
import { Verification } from '../models/Verification.js';
import { Site } from '../models/Site.js';
import { Supplier } from '../models/Supplier.js';
import { AuditLog } from '../models/AuditLog.js';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { broadcastEvent } from '../socket/index.js';

export async function createOrder(req: AuthenticatedRequest, res: Response): Promise<void> {
  const {
    type,
    category,
    description,
    orderedQty,
    unit,
    siteKey,
    destinationId,
    supplierKey,
    timeSlot,
    unitPrice,
    commercialTerms,
  } = req.body;

  if (!category || !orderedQty || !siteKey || !destinationId || !supplierKey) {
    res.status(400).json({ success: false, message: 'Missing required order fields' });
    return;
  }

  const site = await Site.findOne({ siteKey });
  if (!site) {
    res.status(404).json({ success: false, message: 'Specified site not found' });
    return;
  }

  const destination = site.destinations.find((d) => d.destId === destinationId);
  const destinationName = destination ? destination.name : destinationId;

  const supplier = await Supplier.findOne({ supplierKey });
  if (!supplier) {
    res.status(404).json({ success: false, message: 'Specified supplier not found' });
    return;
  }

  // Generate unique order number (e.g. DJ-2026-XXXX)
  const count = await Order.countDocuments();
  const orderNumber = `DJ-2026-${String(810 + count + 1).padStart(4, '0')}`;
  const price = Number(unitPrice) || 0;
  const totalPrice = price * Number(orderedQty);

  const order = new Order({
    orderNumber,
    siteKey,
    siteName: site.name,
    destinationId,
    destinationName,
    supplierKey,
    supplierName: supplier.name,
    type: type || 'material',
    category,
    description: description || '',
    orderedQty: Number(orderedQty),
    unit,
    timeSlot: timeSlot || '08:00 - 10:00',
    deliveryDate: new Date(),
    unitPrice: price,
    totalPrice,
    commercialTerms: commercialTerms || 'Standard Net 30, demurrage £95/hr after 45m',
    status: 'pending',
  });

  await order.save();

  // Audit log
  await AuditLog.create({
    action: 'order_created',
    entityType: 'order',
    entityId: order._id.toString(),
    actorId: req.user?.id,
    actorRole: req.user?.role || 'ordering',
    actorName: req.user?.name || 'Ordering Team',
    siteKey,
    details: {
      orderNumber,
      supplierName: supplier.name,
      category,
      orderedQty,
      unit,
      totalPrice,
    },
  });

  // Real-time broadcast to all clients & specifically supplier room
  broadcastEvent('order:created', {
    order,
    message: `New purchase order ${orderNumber} submitted to ${supplier.name}`,
  });

  res.status(201).json({ success: true, order });
}

export async function getOrders(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { status, siteKey, supplierKey, search } = req.query;

  const query: any = {};
  if (status && status !== 'all') query.status = status;
  if (siteKey && siteKey !== 'all') query.siteKey = siteKey;
  if (supplierKey && supplierKey !== 'all') query.supplierKey = supplierKey;

  // Role scoping: if supplier user, restrict to their supplierKey
  if (req.user?.role === 'supplier' && req.user.supplierId) {
    query.supplierKey = req.user.supplierId;
  }

  if (search) {
    query.$or = [
      { orderNumber: { $regex: search, $options: 'i' } },
      { category: { $regex: search, $options: 'i' } },
      { supplierName: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
    ];
  }

  // Driver Privacy: if driver, explicitly omit commercial fields
  const projection = req.user?.role === 'driver'
    ? '-unitPrice -totalPrice -commercialTerms'
    : '';

  const orders = await Order.find(query).select(projection).sort({ createdAt: -1 });
  res.json({ success: true, orders });
}

export async function getOrderById(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { id } = req.params;

  const projection = req.user?.role === 'driver'
    ? '-unitPrice -totalPrice -commercialTerms'
    : '';

  const order = await Order.findOne({
    $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { orderNumber: id }],
  }).select(projection);

  if (!order) {
    res.status(404).json({ success: false, message: 'Order not found' });
    return;
  }

  // Get associated visit and verification
  const visit = await Visit.findOne({ orderNumber: order.orderNumber });
  const verification = visit ? await Verification.findOne({ visitId: visit._id }) : null;

  res.json({ success: true, order, visit, verification });
}

export async function getOrderStats(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { siteKey } = req.query;
  const match: any = {};
  if (siteKey && siteKey !== 'all') match.siteKey = siteKey;

  const [totalOrders, pendingOrders, activeOrders, onSiteOrders, disputedOrders] = await Promise.all([
    Order.countDocuments(match),
    Order.countDocuments({ ...match, status: 'pending' }),
    Order.countDocuments({ ...match, status: { $in: ['accepted', 'dispatched'] } }),
    Order.countDocuments({ ...match, status: 'on_site' }),
    Order.countDocuments({ ...match, status: 'disputed' }),
  ]);

  res.json({
    success: true,
    stats: {
      totalOrders,
      pendingOrders,
      activeOrders,
      onSiteOrders,
      disputedOrders,
    },
  });
}

