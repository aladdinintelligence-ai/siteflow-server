import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export type UserRole =
  | 'manager'
  | 'director'
  | 'ordering'
  | 'supplier'
  | 'driver'
  | 'marshal'
  | 'analyst';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  organization: string; // e.g. "DJ Civil Engineering Ltd", "CEMEX UK"
  supplierId?: string; // If user belongs to a supplier
  driverId?: string; // If user is linked to a driver profile
  siteId?: string; // Optional default assigned site
  active: boolean;
  comparePassword(candidate: string): Promise<boolean>;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    role: {
      type: String,
      required: true,
      enum: ['manager', 'director', 'ordering', 'supplier', 'driver', 'marshal', 'analyst'],
    },
    organization: { type: String, required: true, default: 'DJ Civil Engineering Ltd' },
    supplierId: { type: String },
    driverId: { type: String },
    siteId: { type: String },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.passwordHash);
};

export const User = mongoose.model<IUser>('User', UserSchema);

