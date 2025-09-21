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

    // Try to find user in different collections
    let user = null;
    
    // First try the User collection
    if (mongoose.models.User) {
      user = await mongoose.models.User.findOne({ email });
      console.log("Found in User collection:", user);
    }
    
    // If not found, try the Request collection (from access form)
    if (!user && mongoose.models.Request) {
      user = await mongoose.models.Request.findOne({ email });
      console.log("Found in Request collection:", user);
    }
    
    // If still not found, try to find any document with this email
    if (!user) {
      // Get all collection names
      const collections = await mongoose.connection.db.listCollections().toArray();
      
      for (const collection of collections) {
        const modelName = collection.name;
        if (mongoose.models[modelName]) {
          user = await mongoose.models[modelName].findOne({ email });
          if (user) {
            console.log(`Found in ${modelName} collection:`, user);
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

    // Check if password matches
    if (user.password !== password) {
      console.log("Password doesn't match");
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check if user is approved
    if (user.status !== "approved") {
      return NextResponse.json(
        { 
          error: "Account pending approval",
          approved: false 
        },
        { status: 403 }
      );
    }

    // If the client provided a requested role at login, ensure it matches the stored role
    if (requestedRole && user.role && requestedRole !== user.role) {
      console.log(`Role mismatch: requested=${requestedRole} stored=${user.role}`);
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