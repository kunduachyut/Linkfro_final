import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import AdminRoleAudit from "@/models/AdminRoleAudit";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
  await dbConnect();
  try {
    const { userId } = await auth();
    // allow anonymous actorUserId for now but record if present
    let actorEmail = null;
    if (userId) {
      try {
        const client = await clerkClient();
        const user = await client.users.getUser(userId);
        actorEmail = user?.emailAddresses?.[0]?.emailAddress?.toLowerCase() || null;
      } catch (e) {
        // ignore clerk errors
      }
    }

    const body = await req.json();
    const { targetEmail, role, action, notes } = body;
    if (!targetEmail || !action) {
      return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
    }

    const audit = await AdminRoleAudit.create({
      actorUserId: userId || null,
      actorEmail: actorEmail || null,
      targetEmail: String(targetEmail).toLowerCase().trim(),
      role,
      action,
      notes,
    });

    return NextResponse.json({ success: true, audit });
  } catch (err) {
    console.error("POST /api/admin-role-audit error", err);
    return NextResponse.json({ success: false, error: "Failed to record audit" }, { status: 500 });
  }
}
