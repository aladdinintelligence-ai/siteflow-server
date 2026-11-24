import mongoose, { Schema, Document } from 'mongoose';

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'declined'
  | 'dispatched'
  | 'on_site'
  | 'verified'
  | 'completed'
  | 'disputed';

export interface IOrder extends Document {
  orderNumber: string; // e.g. "DJ-2026-0812"
  siteKey: string;
  siteName: string;
  destinationId: string;
  destinationName: string;
  supplierKey: string;
  supplierName: string;
  type: 'material' | 'service';
  category: string;
  description: string;
  orderedQty: number;
  unit: string;
  timeSlot: string;
  deliveryDate: Date;
  // Commercial terms (CONFIDENTIAL: Must NEVER be leaked to driver role)
  unitPrice: number;
  totalPrice: number;
  commercialTerms: string;
  // Lifecycle state
  status: OrderStatus;
  declineReason?: string;
  assignedDriverKey?: string;
  assignedDriverName?: string;
  assignedVehicleReg?: string;
  vehicleReg?: string;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
  {
    orderNumber: { type: String, required: true, unique: true, index: true },
    siteKey: { type: String, required: true, index: true },
    siteName: { type: String, required: true },
    destinationId: { type: String, required: true },
    destinationName: { type: String, required: true },
    supplierKey: { type: String, required: true, index: true },
    supplierName: { type: String, required: true },
    type: { type: String, enum: ['material', 'service'], required: true },
    category: { type: String, required: true },
    description: { type: String, required: true },
    orderedQty: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true },
    timeSlot: { type: String, required: true },
    deliveryDate: { type: Date, default: Date.now },
    // Commercial Fields (Zero Commercial Leakage)
    unitPrice: { type: Number, required: true, min: 0 },
    totalPrice: { type: Number, required: true, min: 0 },
    commercialTerms: { type: String, default: 'Standard Net 30, demurrage £95/hr after 45m' },
    // Lifecycle
    status: {
      type: String,
      enum: ['pending', 'accepted', 'declined', 'dispatched', 'on_site', 'verified', 'completed', 'disputed'],
      default: 'pending',
      index: true,
    },
    declineReason: { type: String },
    assignedDriverKey: { type: String },
    assignedDriverName: { type: String },
    assignedVehicleReg: { type: String },
    vehicleReg: { type: String },
  },
  { timestamps: true }
);

export const Order = mongoose.model<IOrder>('Order', OrderSchema);

