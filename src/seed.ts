import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { User } from './models/User.js';
import { Site } from './models/Site.js';
import { Supplier } from './models/Supplier.js';
import { Driver } from './models/Driver.js';
import { Order } from './models/Order.js';
import { Visit } from './models/Visit.js';
import { Verification } from './models/Verification.js';
import { CreditNote } from './models/CreditNote.js';
import { AuditLog } from './models/AuditLog.js';

dotenv.config();

export async function runSeed(): Promise<void> {
  console.log('[Seed] Starting database seed...');
  await connectDB();

  // Clear existing collections
  await Promise.all([
    User.deleteMany({}),
    Site.deleteMany({}),
    Supplier.deleteMany({}),
    Driver.deleteMany({}),
    Order.deleteMany({}),
    Visit.deleteMany({}),
    Verification.deleteMany({}),
    CreditNote.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);
  console.log('[Seed] Cleared existing collections.');

  const defaultPasswordHash = await bcrypt.hash('SiteFlow2026!', 10);

  // 1. Seed Users (Site Manager Chris Jones, Supplier, Driver, Marshal, Analyst)
  const users = await User.create([
    {
      name: 'Chris Jones',
      email: 'chris.jones@djcivil.co.uk',
      passwordHash: defaultPasswordHash,
      role: 'manager',
      organization: 'DJ Civil Engineering Ltd',
      siteId: 'site-chatham',
    },
    {
      name: 'Chris Jones',
      email: 'director@djcivil.co.uk',
      passwordHash: defaultPasswordHash,
      role: 'manager',
      organization: 'DJ Civil Engineering Ltd',
      siteId: 'site-chatham',
    },
    {
      name: 'Chris Jones',
      email: 'ordering@djcivil.co.uk',
      passwordHash: defaultPasswordHash,
      role: 'manager',
      organization: 'DJ Civil Engineering Ltd',
      siteId: 'site-chatham',
    },
    {
      name: 'Marcus Bell',
      email: 'dispatch@cemex.co.uk',
      passwordHash: defaultPasswordHash,
      role: 'supplier',
      organization: 'CEMEX UK',
      supplierId: 'sup-cemex',
    },
    {
      name: 'Dave Miller',
      email: 'dave.miller@cemex.co.uk',
      passwordHash: defaultPasswordHash,
      role: 'driver',
      organization: 'CEMEX UK Haulage',
      supplierId: 'sup-cemex',
      driverId: 'drv-dave',
    },
    {
      name: 'Gary O\'Connor',
      email: 'gate1.marshal@djcivil.co.uk',
      passwordHash: defaultPasswordHash,
      role: 'marshal',
      organization: 'DJ Civil Engineering Ltd',
      siteId: 'site-chatham',
    },
    {
      name: 'Emma Richardson',
      email: 'analyst@djcivil.co.uk',
      passwordHash: defaultPasswordHash,
      role: 'analyst',
      organization: 'DJ Civil Engineering Ltd',
      siteId: 'site-chatham',
    },
  ]);
  console.log(`[Seed] Created ${users.length} persona user accounts.`);

  // 2. Seed Sites: Chatham and Rochester
  const sites = await Site.create([
    {
      siteKey: 'site-chatham',
      name: 'Chatham Capstone',
      code: 'CHATHAM-01',
      address: 'Capstone Road, Chatham, Medway (Official address TBC)',
      city: 'Chatham',
      postcode: 'ME4 4LL',
      coordinates: { lat: 51.3972, lng: 0.5348 },
      activeHeadcount: 4,
      gates: [
        { gateId: 'gate-1', name: 'Gate 1 (Leviathan In-Gate & Security)', code: 'CH-G1', isPrimary: true, status: 'open' },
        { gateId: 'gate-2', name: 'Gate 2 (Dockside Heavy Haul Gate)', code: 'CH-G2', isPrimary: false, status: 'open' },
      ],
      destinations: [
        {
          destId: 'dest-chatham-dock',
          name: 'North Quay Dry Dock Pour Zone',
          description: 'Concrete pump station 2. Hard hat, high-vis and eye protection mandatory.',
          category: 'Zone 1 Marine Concrete',
          gateId: 'gate-1',
          routeSvgPath: 'M 12 82 L 12 56 L 22 56 L 28 32',
        },
        {
          destId: 'dest-chatham-berth',
          name: 'Basin 3 Sheet Piling Berth',
          description: 'Crane offload only. Certify sling inspection before removing trailer lashing straps.',
          category: 'Zone 2 Quayside Steel',
          gateId: 'gate-1',
          routeSvgPath: 'M 12 82 L 12 56 L 50 56 L 50 42 L 72 30',
        },
        {
          destId: 'dest-chatham-rebar',
          name: 'St Mary\'s Island Rebar Laydown Yard',
          description: 'Deliver fabricated rebar bundles into Bay C. Forklift & telehandler crossing.',
          category: 'Zone 3 Island Logistics',
          gateId: 'gate-1',
          routeSvgPath: 'M 12 82 L 12 56 L 22 56',
        },
        {
          destId: 'dest-chatham-agg',
          name: 'East Basin Aggregate Storage Bays',
          description: 'Tipping into aggregate bay 2. Wheel wash mandatory before leaving bay.',
          category: 'Zone 4 Bulk Materials',
          gateId: 'gate-2',
          routeSvgPath: 'M 12 82 L 12 56 L 50 56 L 68 64',
        },
      ],
    },
    {
      siteKey: 'site-rochester',
      name: 'Rochester Capstone',
      code: 'ROCHESTER-02',
      address: 'Capstone Road, Rochester, Medway (Official address TBC)',
      city: 'Rochester',
      postcode: 'ME1 1QN',
      coordinates: { lat: 51.3887, lng: 0.5019 },
      activeHeadcount: 3,
      gates: [
        { gateId: 'gate-1', name: 'Gate 1 (Esplanade North Gate)', code: 'ROCH-G1', isPrimary: true, status: 'open' },
        { gateId: 'gate-2', name: 'Gate 2 (River Haul Road Gate)', code: 'ROCH-G2', isPrimary: false, status: 'open' },
      ],
      destinations: [
        {
          destId: 'dest-rochester-pier',
          name: 'Pier 4 River Embankment Foundation',
          description: 'Deliver marine concrete directly to Tremie pour hopper. Reversing assistant mandatory.',
          category: 'Zone 1 Foundation Works',
          gateId: 'gate-1',
          routeSvgPath: 'M 12 82 L 12 56 L 26 56 L 26 40 L 30 34',
        },
        {
          destId: 'dest-rochester-viaduct',
          name: 'North Viaduct Superstructure Segment Yard',
          description: 'Position precast segments on timber dunnage. Verify lift plan.',
          category: 'Zone 2 Superstructure Laydown',
          gateId: 'gate-1',
          routeSvgPath: 'M 12 82 L 12 56 L 50 56 L 50 42 L 74 32',
        },
        {
          destId: 'dest-rochester-sub',
          name: 'Riverside Substation Utilities Trench',
          description: 'Deliver ducting and bedding aggregate. Buried 33kV high voltage services.',
          category: 'Zone 3 Utilities Infrastructure',
          gateId: 'gate-1',
          routeSvgPath: 'M 12 82 L 12 56 L 44 56 L 64 62',
        },
        {
          destId: 'dest-rochester-muck',
          name: 'Medway Spoil & Muck Away Holding Cell',
          description: '8-wheel tippers load non-hazardous excavated material. Automatic sheeting before weigh-out.',
          category: 'Zone 4 Earthworks & Remediation',
          gateId: 'gate-2',
          routeSvgPath: 'M 12 82 L 12 56 L 24 58',
        },
      ],
    },
  ]);
  console.log(`[Seed] Created ${sites.length} construction sites.`);

  // 3. Seed Suppliers
  const suppliers = await Supplier.create([
    {
      supplierKey: 'sup-cemex',
      name: 'CEMEX UK',
      contactName: 'Marcus Bell',
      email: 'dispatch@cemex.co.uk',
      phone: '+44 800 667 827',
      categories: ['Ready-Mix Concrete', 'Screed', 'Aggregates'],
      slaRating: 'A+',
      onTimeRate: 97.2,
      shortDeliveryRate: 2.1,
      totalOrdersThisMonth: 18,
      totalSalesValueThisMonth: 48500,
    },
    {
      supplierKey: 'sup-tarmac',
      name: 'Tarmac Trading Ltd',
      contactName: 'Alan Croft',
      email: 'orders@tarmac.com',
      phone: '+44 845 030 4000',
      categories: ['Asphalt', 'Aggregates', 'Cement'],
      slaRating: 'A',
      onTimeRate: 94.6,
      shortDeliveryRate: 3.4,
      totalOrdersThisMonth: 14,
      totalSalesValueThisMonth: 36200,
    },
    {
      supplierKey: 'sup-hanson',
      name: 'Hanson UK',
      contactName: 'Fiona Gallagher',
      email: 'dispatch@hanson.biz',
      phone: '+44 330 123 4520',
      categories: ['Ready-Mix Concrete', 'Precast Blocks'],
      slaRating: 'B',
      onTimeRate: 89.1,
      shortDeliveryRate: 5.8,
      totalOrdersThisMonth: 9,
      totalSalesValueThisMonth: 21900,
    },
    {
      supplierKey: 'sup-aggregate',
      name: 'Aggregate Industries',
      contactName: 'David Ward',
      email: 'orders@aggregate.com',
      phone: '+44 1530 510066',
      categories: ['Sub-Base Type 1', 'Clean Stone', 'Crushed Concrete'],
      slaRating: 'A',
      onTimeRate: 95.8,
      shortDeliveryRate: 1.8,
      totalOrdersThisMonth: 11,
      totalSalesValueThisMonth: 19800,
    },
  ]);
  console.log(`[Seed] Created ${suppliers.length} suppliers.`);

  // 4. Seed Drivers
  const drivers = await Driver.create([
    {
      driverKey: 'drv-dave',
      name: 'Dave Miller',
      phone: '+44 7700 900142',
      supplierKey: 'sup-cemex',
      supplierName: 'CEMEX UK',
      defaultVehicleReg: 'LK72 GFX',
      vehicleType: 'Concrete Agitator 8m³',
      consentTracking: true,
      currentLocation: { lat: 51.4828, lng: -0.1382, speed: 18, heading: 245, updatedAt: new Date() },
      currentStatus: 'in_transit',
    },
    {
      driverKey: 'drv-darren',
      name: 'Darren Vance',
      phone: '+44 7700 900583',
      supplierKey: 'sup-tarmac',
      supplierName: 'Tarmac Trading Ltd',
      defaultVehicleReg: 'HN23 XRL',
      vehicleType: '8-Wheeler Tipper 20t',
      consentTracking: true,
      currentLocation: { lat: 51.4812, lng: -0.144, speed: 0, heading: 0, updatedAt: new Date() },
      currentStatus: 'on_site',
    },
    {
      driverKey: 'drv-steve',
      name: 'Steve Hughes',
      phone: '+44 7700 900891',
      supplierKey: 'sup-cemex',
      supplierName: 'CEMEX UK',
      defaultVehicleReg: 'BX21 ZMT',
      vehicleType: 'Volumetric Mixer',
      consentTracking: false,
      currentStatus: 'idle',
    },
    {
      driverKey: 'drv-mark',
      name: 'Mark Gallagher',
      phone: '+44 7700 900311',
      supplierKey: 'sup-aggregate',
      supplierName: 'Aggregate Industries',
      defaultVehicleReg: 'PO70 WKS',
      vehicleType: 'Articulated Tipper 29t',
      consentTracking: true,
      currentStatus: 'completed',
    },
  ]);
  console.log(`[Seed] Created ${drivers.length} drivers.`);

  // 5. Seed Orders (All 7 statuses + 3 partial delivery discrepancies)
  const orders = await Order.create([
    // Active job for Dave Miller (Step 3/4)
    {
      orderNumber: 'DJ-2026-0812',
      siteKey: 'site-chatham',
      siteName: 'Chatham Capstone',
      destinationId: 'dest-chatham-dock',
      destinationName: 'North Quay Dry Dock Pour Zone',
      supplierKey: 'sup-cemex',
      supplierName: 'CEMEX UK',
      type: 'material',
      category: 'Ready-Mix Concrete C40/50',
      description: 'Sulphate-resistant mix for basement pour section 4B. Slump class S3.',
      orderedQty: 24,
      unit: 'm³',
      timeSlot: '08:00 - 10:00',
      deliveryDate: new Date(),
      unitPrice: 135,
      totalPrice: 3240,
      commercialTerms: 'Net 30, demurrage £95/hr after 45m standing time',
      status: 'dispatched',
      assignedDriverKey: 'drv-dave',
      assignedDriverName: 'Dave Miller',
      assignedVehicleReg: 'LK72 GFX',
      vehicleReg: 'LK72 GFX',
    },
    // On-site order being discharged right now
    {
      orderNumber: 'DJ-2026-0811',
      siteKey: 'site-chatham',
      siteName: 'Chatham Capstone',
      destinationId: 'dest-chatham-agg',
      destinationName: 'East Basin Aggregate Storage Bays',
      supplierKey: 'sup-tarmac',
      supplierName: 'Tarmac Trading Ltd',
      type: 'material',
      category: 'Type 1 Sub-Base MOT',
      description: 'Granular sub-base stone crushed to 40mm down for haul road formation',
      orderedQty: 40,
      unit: 'tonnes',
      timeSlot: '07:30 - 09:30',
      deliveryDate: new Date(),
      unitPrice: 28.5,
      totalPrice: 1140,
      commercialTerms: 'Net 30, free waiting 30 mins',
      status: 'on_site',
      assignedDriverKey: 'drv-darren',
      assignedDriverName: 'Darren Vance',
      assignedVehicleReg: 'HN23 XRL',
      vehicleReg: 'HN23 XRL',
    },
    // Pending order awaiting supplier acceptance
    {
      orderNumber: 'DJ-2026-0814',
      siteKey: 'site-chatham',
      siteName: 'Chatham Capstone',
      destinationId: 'dest-chatham-rebar',
      destinationName: 'St Mary\'s Island Rebar Laydown Yard',
      supplierKey: 'sup-cemex',
      supplierName: 'CEMEX UK',
      type: 'material',
      category: 'Ready-Mix Concrete C35/45',
      description: 'Retaining wall backfill pour. Slump class S4 with retarder.',
      orderedQty: 18,
      unit: 'm³',
      timeSlot: '13:00 - 15:00',
      deliveryDate: new Date(),
      unitPrice: 128,
      totalPrice: 2304,
      commercialTerms: 'Standard Net 30 terms',
      status: 'pending',
      vehicleReg: 'EA22 NKL',
    },
    // Discrepancy 1: Short delivery of Type 1 Aggregate (-6 tonnes)
    {
      orderNumber: 'DJ-2026-0808',
      siteKey: 'site-chatham',
      siteName: 'Chatham Capstone',
      destinationId: 'dest-chatham-agg',
      destinationName: 'East Basin Aggregate Storage Bays',
      supplierKey: 'sup-hanson',
      supplierName: 'Hanson UK',
      type: 'material',
      category: 'Sub-Base Type 1 Limestone',
      description: 'Capping layer stone. Discrepancy logged at weighbridge ticket check.',
      orderedQty: 42,
      unit: 'tonnes',
      timeSlot: '10:00 - 12:00',
      deliveryDate: new Date(Date.now() - 24 * 3600 * 1000),
      unitPrice: 29,
      totalPrice: 1218,
      commercialTerms: 'Net 30, weighbridge verification strictly binding',
      status: 'verified',
      assignedDriverKey: 'drv-mark',
      assignedDriverName: 'Mark Gallagher',
      assignedVehicleReg: 'PO70 WKS',
      vehicleReg: 'PO70 WKS',
    },
    // Discrepancy 2: Damaged rebar delivery (partial rejection)
    {
      orderNumber: 'DJ-2026-0805',
      siteKey: 'site-rochester',
      siteName: 'Rochester Capstone',
      destinationId: 'dest-rochester-pier',
      destinationName: 'Pier 4 River Embankment Foundation',
      supplierKey: 'sup-cemex',
      supplierName: 'CEMEX UK',
      type: 'material',
      category: 'Piling Grout C50 Micro-Silica',
      description: 'High performance grout. Slump flow test failed on batch 2.',
      orderedQty: 20,
      unit: 'm³',
      timeSlot: '09:00 - 11:00',
      deliveryDate: new Date(Date.now() - 48 * 3600 * 1000),
      unitPrice: 165,
      totalPrice: 3300,
      commercialTerms: 'Net 30, immediate technical compliance clause',
      status: 'disputed',
      assignedDriverKey: 'drv-steve',
      assignedDriverName: 'Steve Hughes',
      assignedVehicleReg: 'BX21 ZMT',
      vehicleReg: 'BX21 ZMT',
    },
    // Discrepancy 3: Moisture variation shortage on washed sand
    {
      orderNumber: 'DJ-2026-0802',
      siteKey: 'site-rochester',
      siteName: 'Rochester Capstone',
      destinationId: 'dest-rochester-sub',
      destinationName: 'Riverside Substation Utilities Trench',
      supplierKey: 'sup-tarmac',
      supplierName: 'Tarmac Trading Ltd',
      type: 'material',
      category: 'Sharp Washed Sand 0/4mm',
      description: 'Screed batching sand. Weightbridge ticket showed wet weight difference.',
      orderedQty: 30,
      unit: 'tonnes',
      timeSlot: '08:30 - 10:30',
      deliveryDate: new Date(Date.now() - 72 * 3600 * 1000),
      unitPrice: 32,
      totalPrice: 960,
      commercialTerms: 'Net 30',
      status: 'completed',
      assignedVehicleReg: 'LN21 WXZ',
      vehicleReg: 'LN21 WXZ',
    },
    // Fully completed run
    {
      orderNumber: 'DJ-2026-0800',
      siteKey: 'site-chatham',
      siteName: 'Chatham Capstone',
      destinationId: 'dest-chatham-dock',
      destinationName: 'North Quay Dry Dock Pour Zone',
      supplierKey: 'sup-cemex',
      supplierName: 'CEMEX UK',
      type: 'material',
      category: 'Ready-Mix Concrete C40/50',
      description: 'Basement slab section 3A pour. Clean full delivery.',
      orderedQty: 16,
      unit: 'm³',
      timeSlot: '07:00 - 09:00',
      deliveryDate: new Date(Date.now() - 80 * 3600 * 1000),
      unitPrice: 135,
      totalPrice: 2160,
      commercialTerms: 'Standard Net 30',
      status: 'completed',
      assignedVehicleReg: 'LK72 GFX',
      vehicleReg: 'LK72 GFX',
    },
  ]);
  console.log(`[Seed] Created ${orders.length} orders.`);

  // 6. Seed Visits
  const activeOrder = orders[0];
  const onSiteOrder = orders[1];
  const shortOrder = orders[3];
  const disputedOrder = orders[4];
  const completedOrder = orders[6];

  const visits = await Visit.create([
    {
      visitNumber: 'VIS-2026-0812',
      orderId: activeOrder._id,
      orderNumber: activeOrder.orderNumber,
      siteKey: activeOrder.siteKey,
      siteName: activeOrder.siteName,
      gateId: 'gate-1',
      gateName: 'Gate 1 (Leviathan In-Gate & Security)',
      destinationId: activeOrder.destinationId,
      destinationName: activeOrder.destinationName,
      supplierKey: activeOrder.supplierKey,
      supplierName: activeOrder.supplierName,
      driverKey: 'drv-dave',
      driverName: 'Dave Miller',
      vehicleReg: 'LK72 GFX',
      dispatchedQty: 24,
      unit: 'm³',
      status: 'dispatched',
      eta: '25 mins (10:45 AM)',
      distanceRemainingMiles: 8.4,
      journeyStartedAt: new Date(Date.now() - 25 * 60 * 1000),
      qrPayload: `DJ-SITEFLOW://${activeOrder.orderNumber}/gate-1`,
    },
    {
      visitNumber: 'VIS-2026-0811',
      orderId: onSiteOrder._id,
      orderNumber: onSiteOrder.orderNumber,
      siteKey: onSiteOrder.siteKey,
      siteName: onSiteOrder.siteName,
      gateId: 'gate-2',
      gateName: 'Gate 2 (Dockside Heavy Haul Gate)',
      destinationId: onSiteOrder.destinationId,
      destinationName: onSiteOrder.destinationName,
      supplierKey: onSiteOrder.supplierKey,
      supplierName: onSiteOrder.supplierName,
      driverKey: 'drv-darren',
      driverName: 'Darren Vance',
      vehicleReg: 'HN23 XRL',
      dispatchedQty: 40,
      unit: 'tonnes',
      status: 'on_site',
      entryAt: new Date(Date.now() - 22 * 60 * 1000),
      qrPayload: `DJ-SITEFLOW://${onSiteOrder.orderNumber}/gate-2`,
    },
    // Visit with Shortage (-6 tonnes)
    {
      visitNumber: 'VIS-2026-0808',
      orderId: shortOrder._id,
      orderNumber: shortOrder.orderNumber,
      siteKey: shortOrder.siteKey,
      siteName: shortOrder.siteName,
      gateId: 'gate-2',
      gateName: 'Gate 2 (Dockside Heavy Haul Gate)',
      destinationId: shortOrder.destinationId,
      destinationName: shortOrder.destinationName,
      supplierKey: shortOrder.supplierKey,
      supplierName: shortOrder.supplierName,
      driverKey: 'drv-mark',
      driverName: 'Mark Gallagher',
      vehicleReg: 'PO70 WKS',
      dispatchedQty: 42,
      unit: 'tonnes',
      status: 'verified',
      entryAt: new Date(Date.now() - 25 * 3600 * 1000),
      verifiedAt: new Date(Date.now() - 24 * 3600 * 1000),
      qrPayload: `DJ-SITEFLOW://${shortOrder.orderNumber}/gate-2`,
    },
    // Visit with Dispute
    {
      visitNumber: 'VIS-2026-0805',
      orderId: disputedOrder._id,
      orderNumber: disputedOrder.orderNumber,
      siteKey: disputedOrder.siteKey,
      siteName: disputedOrder.siteName,
      gateId: 'gate-1',
      gateName: 'Gate 1 (Esplanade North Gate)',
      destinationId: disputedOrder.destinationId,
      destinationName: disputedOrder.destinationName,
      supplierKey: disputedOrder.supplierKey,
      supplierName: disputedOrder.supplierName,
      driverKey: 'drv-steve',
      driverName: 'Steve Hughes',
      vehicleReg: 'BX21 ZMT',
      dispatchedQty: 20,
      unit: 'm³',
      status: 'flagged',
      flagReason: 'Slump test failed: 120mm measured vs 180mm specified. Engineer rejected batch.',
      entryAt: new Date(Date.now() - 49 * 3600 * 1000),
      verifiedAt: new Date(Date.now() - 48 * 3600 * 1000),
      qrPayload: `DJ-SITEFLOW://${disputedOrder.orderNumber}/gate-1`,
    },
    // Fully completed visit
    {
      visitNumber: 'VIS-2026-0800',
      orderId: completedOrder._id,
      orderNumber: completedOrder.orderNumber,
      siteKey: completedOrder.siteKey,
      siteName: completedOrder.siteName,
      gateId: 'gate-1',
      gateName: 'Gate 1 (Leviathan In-Gate & Security)',
      destinationId: completedOrder.destinationId,
      destinationName: completedOrder.destinationName,
      supplierKey: completedOrder.supplierKey,
      supplierName: completedOrder.supplierName,
      driverKey: 'drv-dave',
      driverName: 'Dave Miller',
      vehicleReg: 'LK72 GFX',
      dispatchedQty: 16,
      unit: 'm³',
      status: 'completed',
      entryAt: new Date(Date.now() - 81 * 3600 * 1000),
      verifiedAt: new Date(Date.now() - 80 * 3600 * 1000),
      exitAt: new Date(Date.now() - 80 * 3600 * 1000 + 44 * 60 * 1000),
      durationMinutes: 44,
      qrPayload: `DJ-SITEFLOW://${completedOrder.orderNumber}/gate-1`,
    },
  ]);
  console.log(`[Seed] Created ${visits.length} visits.`);

  // 7. Seed Verifications & Credit Notes
  const shortVisit = visits[2];
  const shortUnitPrice = shortOrder.unitPrice || 29;
  const shortVariance = -6; // 36 tonnes received out of 42
  const shortCreditAmount = Math.abs(shortVariance) * shortUnitPrice; // £174

  await Verification.create([
    {
      visitId: shortVisit._id,
      orderId: shortOrder._id,
      orderNumber: shortOrder.orderNumber,
      supervisorName: 'Raj Patel',
      orderedQty: shortOrder.orderedQty,
      dispatchedQty: shortVisit.dispatchedQty,
      actualReceivedQty: 36,
      varianceQty: shortVariance,
      unit: 'tonnes',
      status: 'verified_shortage',
      reasonCode: 'shortage',
      proofNotes: 'Weighbridge ticket confirmed gross tare difference of 36.00t vs 42.00t on delivery ticket.',
      hasDiscrepancy: true,
      creditNoteGenerated: true,
      creditNoteAmount: shortCreditAmount,
      verifiedAt: new Date(Date.now() - 24 * 3600 * 1000),
    },
    {
      visitId: visits[3]._id,
      orderId: disputedOrder._id,
      orderNumber: disputedOrder.orderNumber,
      supervisorName: 'Raj Patel',
      orderedQty: disputedOrder.orderedQty,
      dispatchedQty: visits[3].dispatchedQty,
      actualReceivedQty: 12,
      varianceQty: -8,
      unit: 'm³',
      status: 'disputed',
      reasonCode: 'spec_failure',
      proofNotes: 'Batch 2 failed slump test and was sent back to plant without discharge. Dispute opened.',
      hasDiscrepancy: true,
      creditNoteGenerated: true,
      creditNoteAmount: 8 * (disputedOrder.unitPrice || 165),
      verifiedAt: new Date(Date.now() - 48 * 3600 * 1000),
    },
    {
      visitId: visits[4]._id,
      orderId: completedOrder._id,
      orderNumber: completedOrder.orderNumber,
      supervisorName: 'Raj Patel',
      orderedQty: completedOrder.orderedQty,
      dispatchedQty: visits[4].dispatchedQty,
      actualReceivedQty: 16,
      varianceQty: 0,
      unit: 'm³',
      status: 'verified_exact',
      hasDiscrepancy: false,
      creditNoteGenerated: false,
      verifiedAt: new Date(Date.now() - 80 * 3600 * 1000),
    },
  ]);

  await CreditNote.create([
    {
      creditNoteNumber: 'CN-2026-0808',
      orderId: shortOrder._id,
      orderNumber: shortOrder.orderNumber,
      visitId: shortVisit._id,
      supplierKey: shortOrder.supplierKey,
      supplierName: shortOrder.supplierName,
      amount: shortCreditAmount,
      varianceQty: 6,
      unit: 'tonnes',
      unitPrice: shortUnitPrice,
      reason: 'Short delivery of 6 tonnes Sub-Base Type 1 Limestone at Battersea Gate 2',
      status: 'issued',
    },
    {
      creditNoteNumber: 'CN-2026-0805',
      orderId: disputedOrder._id,
      orderNumber: disputedOrder.orderNumber,
      visitId: visits[3]._id,
      supplierKey: disputedOrder.supplierKey,
      supplierName: disputedOrder.supplierName,
      amount: 8 * (disputedOrder.unitPrice || 165),
      varianceQty: 8,
      unit: 'm³',
      unitPrice: disputedOrder.unitPrice || 165,
      reason: 'Rejected batch slump specification failure at Birmingham Curzon Street',
      status: 'acknowledged',
    },
  ]);
  console.log('[Seed] Created verifications and credit notes.');
  console.log('[Seed] Complete! Database is populated with live DJ Civil data.');
}

const isMainModule = process.argv[1]?.includes('seed');
if (isMainModule) {
  runSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed Error]', err);
      process.exit(1);
    });
}

