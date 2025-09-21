import { NextResponse } from "next/server";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

const consumerRequestSchema = new mongoose.Schema({
  customerEmail: { type: String, required: true },
  phone: { type: String },
  message: { type: String },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

// Prevent recompiling in dev - give a clear model type to avoid TS union-callable errors
const ConsumerRequest: mongoose.Model<any> =
  (mongoose.models.ConsumerRequest as mongoose.Model<any>) ||
  mongoose.model("ConsumerRequest", consumerRequestSchema);

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI);
  }
}

export async function GET() {
  try {
    await connectDB();
    const requests = await ConsumerRequest.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json({ success: true, items: requests });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Failed to fetch requests" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    await connectDB();
    const { id, status } = await req.json();
    const updated = await ConsumerRequest.findByIdAndUpdate(id, { status }, { new: true });

    if (!updated) {
      return NextResponse.json({ success: false, error: "Request not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, item: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, error: "Failed to update request" }, { status: 500 });
  }
}
