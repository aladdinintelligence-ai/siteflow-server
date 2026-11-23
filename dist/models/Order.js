import mongoose, { Schema } from 'mongoose';
const OrderSchema = new Schema({
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
}, { timestamps: true });
export const Order = mongoose.model('Order', OrderSchema);
