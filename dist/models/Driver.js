import mongoose, { Schema } from 'mongoose';
const DriverLocationSchema = new Schema({
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    speed: { type: Number },
    heading: { type: Number },
    updatedAt: { type: Date, default: Date.now },
}, { _id: false });
const DriverSchema = new Schema({
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
}, { timestamps: true });
export const Driver = mongoose.model('Driver', DriverSchema);
