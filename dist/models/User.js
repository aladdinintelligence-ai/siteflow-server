import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
const UserSchema = new Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
        type: String,
        required: true,
        enum: ['director', 'ordering', 'supplier', 'driver', 'marshal', 'supervisor', 'analyst'],
    },
    organization: { type: String, required: true, default: 'DJ Civil Engineering Ltd' },
    supplierId: { type: String },
    driverId: { type: String },
    siteId: { type: String },
    active: { type: Boolean, default: true },
}, { timestamps: true });
UserSchema.methods.comparePassword = async function (candidate) {
    return bcrypt.compare(candidate, this.passwordHash);
};
export const User = mongoose.model('User', UserSchema);
