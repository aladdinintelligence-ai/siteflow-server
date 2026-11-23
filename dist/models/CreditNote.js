import mongoose, { Schema } from 'mongoose';
const CreditNoteSchema = new Schema({
    creditNoteNumber: { type: String, required: true, unique: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    orderNumber: { type: String, required: true },
    visitId: { type: Schema.Types.ObjectId, ref: 'Visit', required: true, index: true },
    supplierKey: { type: String, required: true, index: true },
    supplierName: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    varianceQty: { type: Number, required: true },
    unit: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    reason: { type: String, required: true },
    status: {
        type: String,
        enum: ['issued', 'acknowledged', 'settled'],
        default: 'issued',
    },
}, { timestamps: true });
export const CreditNote = mongoose.model('CreditNote', CreditNoteSchema);
