import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Website from "@/models/Website";
import { requireAuth } from "@/lib/auth";
import mongoose from "mongoose";
import { clerkClient } from "@clerk/nextjs/server";
import AdminRole from "@/models/AdminRole";

// Correctly typed params (never a Promise)
type RouteParams = {
  params: {
    id: string;
  };
};

export async function GET(req: Request, context: any) {
  await dbConnect();

  // Next may provide `params` as a thenable — await it before using properties
  const params = await context.params;
  const id = params.id;

  console.log("GET request for website with ID:", id);

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: "Invalid website ID" }, { status: 400 });
  }

  const website = await Website.findById(id);
  if (!website) {
    return NextResponse.json({ error: "Website not found" }, { status: 404 });
  }

  const authCheck = await requireAuth();
  const isAuthenticated = !(authCheck instanceof NextResponse);

  if (!isAuthenticated && website.status !== "approved") {
    return NextResponse.json({ error: "Website not found" }, { status: 404 });
  }

  if (isAuthenticated) {
    const userId = authCheck;
    const userRole = await getUserRole(userId);

    if (website.userId.toString() !== userId && website.status !== "approved") {
      // allow superadmin and 'websites' analysts to access for moderation
      if (!(userRole === "superadmin" || userRole === "websites")) {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }
  }

  return NextResponse.json(website.toJSON());
}

export async function PATCH(req: Request, context: any) {
  await dbConnect();
  const params = await context.params;
  const id = params.id;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json({ error: 'Invalid website ID' }, { status: 400 });
  }
  try {
    const body = await req.json();
    const website = await Website.findById(id);
    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    // --- Super Admin actions ---
    if (body.action === "approve") {
      website.status = "approved";
      website.available = true; // Explicitly set available to true when approving
      website.rejectionReason = undefined;
      website.approvedAt = new Date();

      // If an admin provided an extra price (in cents), persist the original publisher price
      // and store the admin-applied extra separately so publisher views can continue to show the original.
      if (typeof body.extraPriceCents === 'number' && !Number.isNaN(body.extraPriceCents) && body.extraPriceCents !== 0) {
        const currentCents = typeof website.priceCents === 'number' ? website.priceCents : (typeof website.price === 'number' ? Math.round(website.price * 100) : 0);
        // If originalPriceCents is not already set, preserve the current publisher-submitted price
        if ((website as any).originalPriceCents == null) {
          (website as any).originalPriceCents = currentCents;
        }
        // Record the admin extra amount separately
        (website as any).adminExtraPriceCents = ((website as any).adminExtraPriceCents || 0) + body.extraPriceCents;
        // Update the authoritative priceCents for consumers (includes admin extra)
        website.priceCents = ((website as any).originalPriceCents ?? currentCents) + (website as any).adminExtraPriceCents;
        website.price = website.priceCents / 100;
      }
    } else if (body.action === "reject") {
      website.status = "rejected";
      website.rejectionReason = body.reason || "No reason provided";
      website.rejectedAt = new Date();
    } else {
      // --- Publisher edits ---
      console.log('Publisher editing website:', {
        websiteId: id,
        currentStatus: website.status,
        updatedFields: Object.keys(body)
      });
      
  // Store the original status to check if content was modified
      const originalStatus = website.status;
  // Debug: log incoming body to verify client-sent price fields
  // eslint-disable-next-line no-console
  console.debug('PATCH incoming body for publisher edit:', body);
      
      // Apply incoming updates, but protect admin-only price fields from publisher edits
      const protectedKeysForPublisher = ['adminExtraPriceCents', 'originalPriceCents'];
      Object.keys(body).forEach((key) => {
        if (body[key] === undefined) return;

        // Prevent publisher from directly modifying admin fields
        if (protectedKeysForPublisher.includes(key)) {
          console.log(`Ignoring protected field on publisher update: ${key}`);
          return;
        }

        // Special handling for primeTrafficCountries to ensure it's an array
        if (key === 'primeTrafficCountries' && typeof body[key] === 'string') {
          // If it's a comma-separated string, convert to array
          if (body[key].includes(",")) {
            website[key] = body[key]
              .split(",")
              .map((country: string) => country.trim())
              .filter((country: string) => country);
          } else {
            // Single country
            website[key] = [body[key].trim()].filter((country: string) => country);
          }
        } else {
          website[key] = body[key];
        }
      });

      // If publisher provided a price update, update originalPriceCents to match their new price
      let newPriceCents: number | undefined = undefined;
      if (body.priceCents !== undefined) {
        const n = Number(body.priceCents);
        if (!Number.isNaN(n)) newPriceCents = Math.max(0, Math.floor(n));
      } else if (body.price !== undefined) {
        const p = Number(body.price);
        if (!Number.isNaN(p)) newPriceCents = Math.max(0, Math.round(p * 100));
      }

      // Debug: show computed newPriceCents
      // eslint-disable-next-line no-console
      console.debug('Computed newPriceCents from body:', newPriceCents);

      if (typeof newPriceCents === 'number') {
        // Update the publisher-visible original price
        (website as any).originalPriceCents = newPriceCents;

        // Keep any admin extra price intact and recompute authoritative priceCents
        const adminExtra = typeof (website as any).adminExtraPriceCents === 'number' ? (website as any).adminExtraPriceCents : 0;
        website.priceCents = newPriceCents + adminExtra;
        website.price = website.priceCents / 100;
      }

      // When a publisher edits content, set status to pending for admin review
      // Exception: Don't change priceConflict status as it needs admin resolution
      // Exception: Don't change status when only updating availability
      const updatedFields = Object.keys(body);
      const isOnlyAvailabilityUpdate = updatedFields.length === 1 && updatedFields[0] === 'available';
      
      if (originalStatus !== 'priceConflict' && !isOnlyAvailabilityUpdate) {
        website.status = "pending";
        console.log('🔄 Setting status to pending due to publisher edit');
      } else if (isOnlyAvailabilityUpdate) {
        console.log('🔄 Only availability updated, keeping current status');
      } else {
        console.log('⚠️ Keeping priceConflict status - requires admin resolution');
      }
    }

    await website.save();
    // Debug: log saved values so server logs show updated originalPriceCents
    // eslint-disable-next-line no-console
    console.debug('PATCH saved website (pre-reload)', { id: website._id?.toString?.(), originalPriceCents: (website as any).originalPriceCents, priceCents: website.priceCents });

    // Reload from DB to ensure we return the persisted state
    const fresh = await Website.findById(website._id).lean();
  // eslint-disable-next-line no-console
  console.debug('PATCH reloaded website from DB', { id: (fresh as any)?._id?.toString?.(), originalPriceCents: (fresh as any)?.originalPriceCents, priceCents: (fresh as any)?.priceCents });

    return NextResponse.json({ success: true, website: fresh });
  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update website" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, context: any) {
  await dbConnect();

  const params = await context.params;
  const id = params.id; // ✅ safe

  console.log("DELETE request for website with ID:", id);

  if (!id) {
    return NextResponse.json({ error: "Missing website ID" }, { status: 400 });
  }
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return NextResponse.json(
      { error: "Invalid website ID format" },
      { status: 400 }
    );
  }

  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const userId = authResult;

  const website = await Website.findById(id);
  if (!website) {
    return NextResponse.json({ error: "Website not found" }, { status: 404 });
  }

  const userRole = await getUserRole(userId);

  if (website.userId.toString() === userId || userRole === "superadmin") {
    await Website.findByIdAndDelete(id);
    return NextResponse.json({ message: "Website deleted successfully" });
  }

  return NextResponse.json({ error: "Access denied" }, { status: 403 });
}

// Helper function
async function getUserRole(userId: string): Promise<string> {
  try {
    const superAdminEmail = (process.env.SUPER_ADMIN_EMAIL || "").toLowerCase() || null;
    const superAdminIds = (process.env.SUPER_ADMIN_USER_IDS || "").split(",").map(s => s.trim()).filter(Boolean);
    if (superAdminIds.includes(userId)) return "superadmin";

    try {
      const client = await clerkClient();
      const user = await client.users.getUser(userId);
      const rawEmail = (user?.emailAddresses || []).find((e: any) => e?.primary === true)?.emailAddress
        || (user?.emailAddresses || [])[0]?.emailAddress
        || null;
      const email = rawEmail ? String(rawEmail).toLowerCase().trim() : null;

      if (email && superAdminEmail && email === superAdminEmail) return "superadmin";

      if (email) {
        const roleDoc = await AdminRole.findOne({ email, active: true }).lean().exec();
        if (roleDoc) {
          if (roleDoc.role === 'super') return 'superadmin';
          if (roleDoc.role === 'websites') return 'websites';
          if (roleDoc.role === 'requests') return 'requests';
        }
      }
    } catch (e) {
      console.error('getUserRole clerk/AdminRole lookup failed', e);
    }

    return 'consumer';
  } catch (e) {
    console.error('getUserRole unexpected error', e);
    return 'consumer';
  }
}