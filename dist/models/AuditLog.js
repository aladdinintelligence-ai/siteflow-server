import mongoose, { Schema } from 'mongoose';
const AuditLogSchema = new Schema({
    action: { type: String, required: true, index: true },
    entityType: {
        type: String,
        enum: ['order', 'visit', 'verification', 'gate', 'user', 'credit_note'],
        required: true,
    },
    entityId: { type: String, required: true, index: true },
    actorId: { type: String },
    actorRole: { type: String, required: true },
    actorName: { type: String, required: true },
    siteKey: { type: String, index: true },
    details: { type: Schema.Types.Mixed, default: {} },
}, { timestamps: { createdAt: true, updatedAt: false } });
export const AuditLog = mongoose.model('AuditLog', AuditLogSchema);
