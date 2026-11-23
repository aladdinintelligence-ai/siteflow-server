import mongoose, { Schema } from 'mongoose';
const SupplierSchema = new Schema({
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
}, { timestamps: true });
export const Supplier = mongoose.model('Supplier', SupplierSchema);
