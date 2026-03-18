import mongoose, { Schema, Document, Model } from "mongoose";

export interface WorkingHour {
  day: number; // 0=Sunday ... 6=Saturday
  open: string;
  close: string;
}

export interface IField extends Document {
  ownerId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  type: "5v5" | "6v6" | "7v7" | "11v11";
  city: string;
  neighborhood?: string;
  address?: string;
  location?: { lat: number; lng: number };
  pricePerHour: number;
  workingHours: WorkingHour[];
  slotDuration: number;
  amenities: string[];
  isActive: boolean;
  createdAt: Date;
}

const FieldSchema = new Schema<IField>(
  {
    ownerId: { type: Schema.Types.ObjectId, ref: "Owner", required: true },
    name: { type: String, required: true },
    description: String,
    type: { type: String, enum: ["5v5", "6v6", "7v7", "11v11"], required: true },
    city: { type: String, required: true },
    neighborhood: String,
    address: String,
    location: { lat: Number, lng: Number },
    pricePerHour: { type: Number, required: true },
    workingHours: [
      {
        day: { type: Number, required: true },
        open: { type: String, required: true },
        close: { type: String, required: true },
      },
    ],
    slotDuration: { type: Number, default: 60 },
    amenities: [String],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Field: Model<IField> =
  mongoose.models.Field ?? mongoose.model<IField>("Field", FieldSchema);

export default Field;
