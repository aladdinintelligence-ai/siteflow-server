import mongoose, { Schema, Document, Types } from 'mongoose';

export type DiscrepancyReason =
  | 'shortage'
  | 'damaged'
  | 'spec_failure'
  | 'moisture_loss'
  | 'service_incomplete';

export interface IVerification extends Document {
  visitId: Types.ObjectId;
  orderId: Types.ObjectId;
  orderNumber: string;
  supervisorName: string;
  orderedQty: number;
  dispatchedQty: number;
  actualReceivedQty: number;
  varianceQty: number; // actualReceivedQty - dispatchedQty
  unit: string;
  status: 'verified_exact' | 'verified_shortage' | 'verified_overage' | 'disputed';
  reasonCode?: DiscrepancyReason;
  proofNotes?: string;
  photoUrl?: string;
  hasDiscrepancy: boolean;
  creditNoteGenerated: boolean;
  creditNoteAmount?: number;
  verifiedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const VerificationSchema = new Schema<IVerification>(
  {
    visitId: { type: Schema.Types.ObjectId, ref: 'Visit', required: true, unique: true, index: true },
    orderId: { type: Schema.Types.ObjectId, ref: 'Order', required: true, index: true },
    orderNumber: { type: String, required: true },
    supervisorName: { type: String, required: true },
    orderedQty: { type: Number, required: true },
    dispatchedQty: { type: Number, required: true },
    actualReceivedQty: { type: Number, required: true },
    varianceQty: { type: Number, required: true },
    unit: { type: String, required: true },
    status: {
      type: String,
      enum: ['verified_exact', 'verified_shortage', 'verified_overage', 'disputed'],
      required: true,
      index: true,
    },
    reasonCode: {
      type: String,
      enum: ['shortage', 'damaged', 'spec_failure', 'moisture_loss', 'service_incomplete'],
    },
    proofNotes: { type: String },
    photoUrl: { type: String },
    hasDiscrepancy: { type: Boolean, default: false },
    creditNoteGenerated: { type: Boolean, default: false },
    creditNoteAmount: { type: Number, default: 0 },
    verifiedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const Verification = mongoose.model<IVerification>('Verification', VerificationSchema);

