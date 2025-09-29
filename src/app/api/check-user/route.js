// src/app/api/check-user/route.js
import { NextResponse } from "next/server";
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;

async function connectDB() {
  if (mongoose.connection.readyState === 0) {
    try {
      await mongoose.connect(MONGODB_URI);
    } catch (err) {
      throw new Error("MongoDB connection failed");
    }
  }
}

export async function POST(request) {
  try {
    await connectDB();
  const { email, password, role: requestedRole } = await request.json();

  console.log("Login attempt:", { email, password, requestedRole });

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Try to find user in different collections. Prefer Request (access requests)
    // because those documents contain the password field used for login when users
    // have requested access but may also have a Clerk User entry.
    let user = null;
    let source = null;

    // Look for a Request entry first (this often contains password, role, status)
    if (mongoose.models.Request) {
      const reqDoc = await mongoose.models.Request.findOne({ email });
      if (reqDoc) {
        user = reqDoc;
        source = "Request";
        console.log("Found in Request collection:", reqDoc);
      }
    }

    // If no Request entry, try the User (Clerk-managed) collection
    if (!user && mongoose.models.User) {
      const userDoc = await mongoose.models.User.findOne({ email });
      if (userDoc) {
        user = userDoc;
        source = "User";
        console.log("Found in User collection:", userDoc);
      }
    }

    // If still not found, try to find any document with this email in other models
    if (!user) {
      const collections = await mongoose.connection.db.listCollections().toArray();
      for (const collection of collections) {
        const modelName = collection.name;
        if (mongoose.models[modelName]) {
          const doc = await mongoose.models[modelName].findOne({ email });
          if (doc) {
            user = doc;
            source = modelName;
            console.log(`Found in ${modelName} collection:`, doc);
            break;
          }
        }
      }
    }

    if (!user) {
      console.log("No user found with email:", email);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if password matches. Many User (Clerk) documents won't have a password
    // stored locally; the access request document usually contains the password used
    // at signup. If a Request entry exists (or another doc with a password), use that
    // value for comparison.
    const storedPassword = (user && typeof user.password !== 'undefined') ? user.password : null;

    if (!storedPassword) {
      console.log(`No stored password found on ${source || 'unknown'} doc for email:`, email);
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (storedPassword !== password) {
      console.log("Password doesn't match");
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Normalize roles for comparison (case-insensitive)
    const storedRole = (user.role || "").toString().toLowerCase();
    const requestedRoleNormalized = (requestedRole || "").toString().toLowerCase();

    // Check if user is approved. If not approved, return approved:false with 200
    // so the client can show an inline approval-pending message instead of throwing.
    if (user.status !== "approved") {
      return NextResponse.json(
        {
          error: "Account pending approval",
          approved: false,
          user: {
            email: user.email,
            role: user.role || null,
          }
        },
        { status: 200 }
      );
    }

    // If the client provided a requested role at login, ensure it matches the stored role
    if (requestedRoleNormalized && storedRole && requestedRoleNormalized !== storedRole) {
      console.log(`Role mismatch: requested=${requestedRoleNormalized} stored=${storedRole}`);
      return NextResponse.json(
        { error: `Role mismatch: you signed up as '${user.role}', please login as that role` },
        { status: 403 }
      );
    }

    // Successful login
    return NextResponse.json({ 
      message: "Login successful", 
      approved: true,
      user: {
        email: user.email,
        phone: user.phone,
        country: user.country,
        role: user.role || null
      }
    });
  } catch (error) {
    console.error("Login check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}