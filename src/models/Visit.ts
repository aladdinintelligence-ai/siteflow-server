import mongoose, { Schema, Document, Types } from 'mongoose';

export type VisitStatus =
  | 'scheduled'
  | 'dispatched'
  | 'on_site'
  | 'verified'
  | 'completed'
  | 'flagged';

export interface IVisit extends Document {
  visitNumber: string; // e.g. "VIS-2026-0812"
  orderId: Types.ObjectId;
  orderNumber: string;
  siteKey: string;
  siteName: string;
  gateId: string;
  gateName: string;
  destinationId: string;
  destinationName: string;
  supplierKey: string;
  supplierName: string;
  driverKey: string;
  driverName: string;
  vehicleReg: string;
  dispatchedQty: number;
  unit: string;
  status: VisitStatus;
  flagReason?: string;
  eta?: string;
  distanceRemainingMiles?: number;
  journeyStartedAt?: Date;
  entryAt?: Date;
  verifiedAt?: Date;
  exitAt?: Date;
  durationMinutes?: number;
  qrPayload: string; // Dynamic QR content for gate check-in
  createdAt: Date;
  updatedAt: Date;
}

const VisitSchema = new Schema<IVisit>(
  {
    visitNumber: { type: String, required: true, unique: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    orderNumber: { type: String, required: true, index: true },
    siteKey: { type: String, required: true, index: true },
    siteName: { type: String, required: true },
    gateId: { type: String, required: true },
    gateName: { type: String, required: true },
    destinationId: { type: String, required: true },
    destinationName: { type: String, required: true },
    supplierKey: { type: String, required: true, index: true },
    supplierName: { type: String, required: true },
    driverKey: { type: String, required: true, index: true },
    driverName: { type: String, required: true },
    vehicleReg: { type: String, required: true },
    dispatchedQty: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true },
    status: {
      type: String,
      enum: ['scheduled', 'dispatched', 'on_site', 'verified', 'completed', 'flagged'],
      default: 'scheduled',
      index: true,
    },
    flagReason: { type: String },
    eta: { type: String },
    distanceRemainingMiles: { type: Number },
    journeyStartedAt: { type: Date },
    entryAt: { type: Date },
    verifiedAt: { type: Date },
    exitAt: { type: Date },
    durationMinutes: { type: Number },
    qrPayload: { type: String, required: true },
  },
  { timestamps: true }
);

export const Visit = mongoose.model<IVisit>('Visit', VisitSchema);

