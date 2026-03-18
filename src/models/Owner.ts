import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOwner extends Document {
  name: string;
  email: string;
  password: string;
  phone: string;
  createdAt: Date;
}

const OwnerSchema = new Schema<IOwner>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    phone: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Owner: Model<IOwner> =
  mongoose.models.Owner ?? mongoose.model<IOwner>("Owner", OwnerSchema);

export default Owner;
