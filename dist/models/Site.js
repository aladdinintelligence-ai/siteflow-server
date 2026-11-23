import mongoose, { Schema } from 'mongoose';
const SiteGateSchema = new Schema({
    gateId: { type: String, required: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    isPrimary: { type: Boolean, default: false },
    status: { type: String, enum: ['open', 'congested', 'closed'], default: 'open' },
}, { _id: false });
const SiteDestinationSchema = new Schema({
    destId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    gateId: { type: String, required: true },
    routeSvgPath: { type: String, required: true },
}, { _id: false });
const SiteSchema = new Schema({
    siteKey: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    address: { type: String, required: true },
    city: { type: String, required: true },
    postcode: { type: String, required: true },
    coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true },
    },
    gates: [SiteGateSchema],
    destinations: [SiteDestinationSchema],
    activeHeadcount: { type: Number, default: 0 },
    active: { type: Boolean, default: true },
}, { timestamps: true });
export const Site = mongoose.model('Site', SiteSchema);
