import mongoose, { Schema, Document } from 'mongoose';

export interface ISupplier extends Document {
  supplierKey: string; // e.g. "sup-cemex"
  name: string;
  contactName: string;
  email: string;
  phone: string;
  categories: string[];
  slaRating: string; // e.g. "A+", "A", "B"
  onTimeRate: number; // percentage (e.g. 96)
  shortDeliveryRate: number; // percentage (e.g. 3.2)
  totalOrdersThisMonth: number;
  totalSalesValueThisMonth: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SupplierSchema = new Schema<ISupplier>(
  {
    supplierKey: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    contactName: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    categories: [{ type: String }],
    slaRating: { type: String, default: 'A' },
    onTimeRate: { type: Number, default: 95 },
    shortDeliveryRate: { type: Number, default: 2.5 },
    totalOrdersThisMonth: { type: Number, default: 0 },
    totalSalesValueThisMonth: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Supplier = mongoose.model<ISupplier>('Supplier', SupplierSchema);

