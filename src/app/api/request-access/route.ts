import { NextResponse } from "next/server";
import mongoose, { Document, Schema, Model } from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI as string;

// --- Define TypeScript interface for request ---
interface IRequest extends Document {
  email: string;
  phone?: string;
  password: string;
  country?: string;
  traffic?: string;
  numberOfWebsites?: string;
  role: "advertiser" | "publisher";
  message?: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
}

// --- Define Schema ---
const requestSchema = new Schema<IRequest>({
  email: { type: String, required: true, unique: true, index: true, lowercase: true },
  phone: { type: String },
  password: { type: String, required: true },
  country: { type: String },
  traffic: { type: String },
  numberOfWebsites: { type: String },
  role: { type: String, enum: ["advertiser", "publisher"], required: true },
  message: { type: String },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  createdAt: { type: Date, default: Date.now },
});

// Prevent recompiling model in dev/hot-reload
// Ensure dev hot-reload doesn't keep an old model with the previous schema.
if ((mongoose.models as any).Request) {
  try {
    // remove cached model so we can recompile with updated schema
    delete (mongoose.models as any).Request;
  } catch (e) {
    // ignore
  }
}
const RequestModel: Model<IRequest> = mongoose.models.Request as Model<IRequest> || mongoose.model<IRequest>("Request", requestSchema);

// --- DB Connection ---
async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(MONGODB_URI);
      console.log("✅ MongoDB connected");
    } catch (err) {
      console.error("❌ MongoDB connection error:", err);
      throw new Error("MongoDB connection failed");
    }
  }
}


// --- POST Handler (Save new request) ---
export async function POST(req: Request) {
  try {
    await connectDB();
    const body = await req.json();

    // Validate required fields — only require email, password and role for minimal signup
    const requiredFields = ['email', 'password', 'role'];
    const missingFields = requiredFields.filter(field => !body[field]);

    if (missingFields.length > 0) {
      return NextResponse.json(
        { success: false, error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Build request data with optional fields
    const requestData: Partial<IRequest> & { email: string; password: string; role: string } = {
      email: String(body.email).toLowerCase(),
      password: body.password,
      role: body.role,
      status: 'pending',
      createdAt: new Date()
    };

    // Ensure email is unique across Request and existing User records
    // Check for existing Request
    const existingRequest = await RequestModel.findOne({ email: requestData.email });
    if (existingRequest) {
      return NextResponse.json(
        { success: false, error: 'A request with this email already exists' },
        { status: 409 }
      );
    }

    // Check for existing User (Clerk-managed) account
    if ((mongoose.models as any).User) {
      const existingUser = await (mongoose.models as any).User.findOne({ email: requestData.email });
      if (existingUser) {
        return NextResponse.json(
          { success: false, error: 'An account with this email already exists. Please sign in.' },
          { status: 409 }
        );
      }
    }

    if (body.phone) requestData.phone = body.phone;
    if (body.country) requestData.country = body.country;
    if (body.traffic) requestData.traffic = body.traffic;
    if (body.numberOfWebsites) requestData.numberOfWebsites = body.numberOfWebsites;
    if (body.message) requestData.message = body.message;

    const requestDoc = new RequestModel(requestData);
    await requestDoc.save();

    return NextResponse.json({ 
      success: true, 
      message: "Request saved successfully",
      id: requestDoc._id 
    });
  } catch (error) {
    console.error("Error saving request:", error);
    return NextResponse.json(
      { success: false, error: "Database error occurred" },
      { status: 500 }
    );
  }
}

// --- GET Handler (Fetch all requests) ---
export async function GET() {
  try {
    await connectDB();
    const requests: IRequest[] = await RequestModel.find({})
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error fetching requests:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch requests" },
      { status: 500 }
    );
  }
}

// --- PATCH Handler (Update request status) ---
// In your API route
export async function PATCH(request) {
  try {
    await connectDB();
  const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: "Request ID and status are required" },
        { status: 400 }
      );
    }

    if (!['pending', 'approved', 'rejected', 'paused'].includes(status)) {
      return NextResponse.json(
        { error: "Status must be either 'pending', 'approved', 'rejected', or 'paused'" },
        { status: 400 }
      );
    }

    // Update the request status
    const updatedRequest = await RequestModel.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedRequest) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "Request status updated successfully",
      request: updatedRequest 
    });
  } catch (error) {
    console.error("Error updating request:", error);
    return NextResponse.json(
      { error: "Failed to update request" },
      { status: 500 }
    );
  }
}

// --- DELETE Handler (Delete a request) ---
export async function DELETE(request) {
  try {
    await connectDB();
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "Request ID is required" },
        { status: 400 }
      );
    }

    // Delete the request
    const deletedRequest = await RequestModel.findByIdAndDelete(id);

    if (!deletedRequest) {
      return NextResponse.json(
        { error: "Request not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: "Request deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting request:", error);
    return NextResponse.json(
      { error: "Failed to delete request" },
      { status: 500 }
    );
  }
}
