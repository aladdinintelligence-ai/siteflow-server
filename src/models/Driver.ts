import mongoose, { Schema, Document } from 'mongoose';

export interface IDriverLocation {
  lat: number;
  lng: number;
  speed?: number;
  heading?: number;
  updatedAt: Date;
}

export interface IDriver extends Document {
  driverKey: string; // e.g. "drv-dave"
  name: string;
  phone: string;
  supplierKey: string;
  supplierName: string;
  defaultVehicleReg: string;
  vehicleType: string;
  consentTracking: boolean;
  currentLocation?: IDriverLocation;
  currentStatus: 'idle' | 'assigned' | 'in_transit' | 'on_site' | 'completed';
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DriverLocationSchema = new Schema<IDriverLocation>(
  {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    speed: { type: Number },
    heading: { type: Number },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const DriverSchema = new Schema<IDriver>(
  {
    driverKey: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    supplierKey: { type: String, required: true, index: true },
    supplierName: { type: String, required: true },
    defaultVehicleReg: { type: String, required: true },
    vehicleType: { type: String, required: true },
    consentTracking: { type: Boolean, default: false },
    currentLocation: DriverLocationSchema,
    currentStatus: {
      type: String,
      enum: ['idle', 'assigned', 'in_transit', 'on_site', 'completed'],
      default: 'idle',
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Driver = mongoose.model<IDriver>('Driver', DriverSchema);

