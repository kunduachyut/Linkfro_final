import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import AdminRole from "@/models/AdminRole";

export async function GET(req: NextRequest) {
  await dbConnect();
  try {
    const roles = await AdminRole.find({}).lean().exec();
    return NextResponse.json({ success: true, roles });
  } catch (err) {
    console.error("GET /api/admin-roles error", err);
    return NextResponse.json({ success: false, error: "Failed to load roles" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const json = await req.json();
    const { email, role } = json;
    if (!email || !role || !["websites", "requests", "super"].includes(role)) {
      return NextResponse.json({ success: false, error: "Invalid payload" }, { status: 400 });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    // Prevent the same email being assigned to multiple different roles
    const existingByEmail = await AdminRole.findOne({ email: normalizedEmail }).exec();
    if (existingByEmail) {
      if (existingByEmail.role === role) {
        // If the exact assignment already exists, ensure it's active and return it
        existingByEmail.active = true;
        await existingByEmail.save();
        return NextResponse.json({ success: true, role: existingByEmail });
      }
      // Email already has a different role - reject to enforce uniqueness
      return NextResponse.json({ success: false, error: `Email already assigned to role '${existingByEmail.role}'` }, { status: 400 });
    }

    // For websites/requests keep a single assignment (upsert)
    if (role === "websites" || role === "requests") {
      // For these roles keep a single assignment by role. We already checked email conflicts above.
      const existing = await AdminRole.findOne({ role }).exec();
      if (existing) {
        existing.email = normalizedEmail;
        existing.active = true;
        await existing.save();
        return NextResponse.json({ success: true, role: existing });
      }
      const created = await AdminRole.create({ email: normalizedEmail, role, active: true });
      return NextResponse.json({ success: true, role: created });
    }

  // For super role allow multiple super admins, but we've already checked the email doesn't exist.
  const created = await AdminRole.create({ email: normalizedEmail, role, active: true });
  return NextResponse.json({ success: true, role: created });
  } catch (err) {
    console.error("POST /api/admin-roles error", err);
    return NextResponse.json({ success: false, error: "Failed to save role" }, { status: 500 });
  }
}

// Update role (toggle active or change role/email if desired)
export async function PATCH(req: NextRequest) {
  await dbConnect();
  try {
    const body = await req.json();
    const { id, active } = body;
    if (!id || typeof active !== 'boolean') {
      return NextResponse.json({ success: false, error: 'Invalid payload' }, { status: 400 });
    }
    const doc = await AdminRole.findById(id).exec();
    if (!doc) return NextResponse.json({ success: false, error: 'Role not found' }, { status: 404 });
    doc.active = active;
    await doc.save();
    return NextResponse.json({ success: true, role: doc });
  } catch (err) {
    console.error('PATCH /api/admin-roles error', err);
    return NextResponse.json({ success: false, error: 'Failed to update role' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  await dbConnect();
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const role = searchParams.get("role");
    if (!id && !role) {
      return NextResponse.json({ success: false, error: "Provide id or role to delete" }, { status: 400 });
    }
    let res;
    if (id) {
      res = await AdminRole.findByIdAndDelete(id).exec();
    } else {
      // delete by role (this deletes the first match)
      res = await AdminRole.findOneAndDelete({ role }).exec();
    }
    return NextResponse.json({ success: true, deleted: !!res });
  } catch (err) {
    console.error("DELETE /api/admin-roles error", err);
    return NextResponse.json({ success: false, error: "Failed to delete role" }, { status: 500 });
  }
}