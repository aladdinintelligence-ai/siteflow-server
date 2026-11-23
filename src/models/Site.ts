import mongoose, { Schema, Document } from 'mongoose';

export interface ISiteGate {
  gateId: string;
  name: string;
  code: string;
  isPrimary: boolean;
  status: 'open' | 'congested' | 'closed';
}

export interface ISiteDestination {
  destId: string;
  name: string;
  description: string;
  category: string;
  gateId: string;
  routeSvgPath: string; // SVG path representation for approved haul route
}

export interface ISite extends Document {
  siteKey: string; // e.g. "site-btr"
  name: string;
  code: string;
  address: string;
  city: string;
  postcode: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  gates: ISiteGate[];
  destinations: ISiteDestination[];
  activeHeadcount: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SiteGateSchema = new Schema<ISiteGate>(
  {
    gateId: { type: String, required: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    isPrimary: { type: Boolean, default: false },
    status: { type: String, enum: ['open', 'congested', 'closed'], default: 'open' },
  },
  { _id: false }
);

const SiteDestinationSchema = new Schema<ISiteDestination>(
  {
    destId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    gateId: { type: String, required: true },
    routeSvgPath: { type: String, required: true },
  },
  { _id: false }
);

const SiteSchema = new Schema<ISite>(
  {
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
  },
  { timestamps: true }
);

export const Site = mongoose.model<ISite>('Site', SiteSchema);

