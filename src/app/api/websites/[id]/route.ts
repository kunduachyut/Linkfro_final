import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Website from "@/models/Website";
import { requireAuth } from "@/lib/auth";
import mongoose from "mongoose";

// Correctly typed params (never a Promise)
type RouteParams = {
  params: {
    id: string;
  };
};

export async function GET(req: Request, context: { params: any }) {
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
      if (userRole !== "superadmin") {
        return NextResponse.json({ error: "Access denied" }, { status: 403 });
      }
    }
  }

  return NextResponse.json(website.toJSON());
}

export async function PATCH(req: Request, { params }: RouteParams) {
  try {
    const body = await req.json();
    const { id } = params; // ✅ Fixed: Removed await, access directly

    const website = await Website.findById(id);
    if (!website) {
      return NextResponse.json({ error: "Website not found" }, { status: 404 });
    }

    // --- Super Admin actions ---
    if (body.action === "approve") {
      website.status = "approved";
      website.rejectionReason = undefined;
      website.approvedAt = new Date();

      // If an admin provided an extra price (in cents), apply it to the stored price
      if (typeof body.extraPriceCents === 'number' && !Number.isNaN(body.extraPriceCents)) {
        const currentCents = typeof website.priceCents === 'number' ? website.priceCents : (typeof website.price === 'number' ? Math.round(website.price * 100) : 0);
        website.priceCents = currentCents + body.extraPriceCents;
        // Keep 'price' in sync for any consumers that read it
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
      
      Object.keys(body).forEach((key) => {
        if (body[key] !== undefined) {
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
        }
      });

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
    return NextResponse.json({ success: true, website });
  } catch (error) {
    console.error("PATCH error:", error);
    return NextResponse.json(
      { error: "Failed to update website" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: RouteParams) {
  await dbConnect();

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
  if (
    userId === "user_31H9OiuHhU5R5ITj5AlP4aJBosn" ||
    userId === "user_31XHCLTOeZ74gf9COPnuyjHpQY6"
  )
    return "superadmin";
  return "consumer";
}