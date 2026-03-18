import mongoose, { Schema, Document, Model } from "mongoose";

export interface IBooking extends Document {
  fieldId: mongoose.Types.ObjectId;
  date: string;
  startTime: string;
  endTime: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  userId?: mongoose.Types.ObjectId;
  status: "confirmed" | "cancelled";
  totalPrice: number;
  createdAt: Date;
}

const BookingSchema = new Schema<IBooking>(
  {
    fieldId: { type: Schema.Types.ObjectId, ref: "Field", required: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    clientName: { type: String, required: true },
    clientPhone: { type: String, required: true },
    clientEmail: String,
    userId: { type: Schema.Types.ObjectId, ref: "User" },
    status: { type: String, enum: ["confirmed", "cancelled"], default: "confirmed" },
    totalPrice: { type: Number, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Prevent double-booking at DB level
BookingSchema.index(
  { fieldId: 1, date: 1, startTime: 1 },
  { unique: true, partialFilterExpression: { status: "confirmed" } }
);

const Booking: Model<IBooking> =
  mongoose.models.Booking ?? mongoose.model<IBooking>("Booking", BookingSchema);

export default Booking;
