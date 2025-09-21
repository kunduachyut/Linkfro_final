import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import AdminRole from "@/models/AdminRole";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  await dbConnect();

  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ role: null, isSuper: false });

    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase() || null;

    const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL ||"santanu.digitalseo@gmail.com"||"kunduachyut19@gmail.com").toLowerCase();
    const superAdminIds = (process.env.SUPER_ADMIN_USER_IDS || "").split(",").map(s => s.trim()).filter(Boolean);
    
    const isSuper =
      !!(superAdminEmail && email && email === superAdminEmail) ||
      superAdminIds.includes(userId);

    if (isSuper) {
      return NextResponse.json({ role: null, isSuper: true });
    }

    if (!email) return NextResponse.json({ role: null, isSuper: false });

    const roleDoc = await AdminRole.findOne({ email }).lean().exec();
    return NextResponse.json({ role: roleDoc?.role || null, isSuper: false });
  } catch (err) {
    console.error("GET /api/admin-roles/current error", err);
    return NextResponse.json({ role: null, isSuper: false });
  }
}

// Get all admin roles
export async function POST(req: NextRequest) {
  await dbConnect();

  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Verify if user is super admin
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase() || null;

    const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || "kunduachyut19@gmail.com" || "basakbittu35@gmail.com").toLowerCase();
    const superAdminIds = (process.env.SUPER_ADMIN_USER_IDS || "").split(",").map(s => s.trim()).filter(Boolean);
    
    const isSuper =
      !!(superAdminEmail && email && email === superAdminEmail) ||
      superAdminIds.includes(userId);

    if (!isSuper) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { action, email: targetEmail, role } = await req.json();

    if (action === "getAll") {
      const adminRoles = await AdminRole.find({}).lean().exec();
      return NextResponse.json({ adminRoles });
    }

    if (action === "create" && targetEmail && role) {
      // Check if role already exists for this email
      const existingRole = await AdminRole.findOne({ email: targetEmail.toLowerCase() });
      if (existingRole) {
        return NextResponse.json({ error: "Role already exists for this email" }, { status: 400 });
      }

      const newRole = new AdminRole({
        email: targetEmail.toLowerCase(),
        role,
        assignedBy: userId,
        assignedAt: new Date()
      });

      await newRole.save();
      return NextResponse.json({ success: true, role: newRole });
    }

    if (action === "update" && targetEmail && role) {
      const updatedRole = await AdminRole.findOneAndUpdate(
        { email: targetEmail.toLowerCase() },
        { role, updatedAt: new Date() },
        { new: true }
      );

      if (!updatedRole) {
        return NextResponse.json({ error: "Role not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true, role: updatedRole });
    }

    if (action === "delete" && targetEmail) {
      const deletedRole = await AdminRole.findOneAndDelete({ email: targetEmail.toLowerCase() });

      if (!deletedRole) {
        return NextResponse.json({ error: "Role not found" }, { status: 404 });
      }

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid action or parameters" }, { status: 400 });

  } catch (err) {
    console.error("POST /api/admin-roles error", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}