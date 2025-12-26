import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import { requireAuth } from "@/lib/auth";
import { UserContent } from "@/models/Content";
import Purchase from "@/models/Purchase";
import { Types } from "mongoose";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (typeof authResult !== "string") return authResult;
    const userId = authResult;

    await dbConnect();

    const body = await req.json();
    const { link, linkDetails, websiteId, purchaseId, requirements } = body;

    // Basic validation
    if (!requirements && !link && !linkDetails) {
      return NextResponse.json({ error: "requirements or link/linkDetails is required" }, { status: 400 });
    }

    // Create a UserContent record that stores link or linkDetails
    const created = await UserContent.create({
      userId,
      websiteId: websiteId || undefined,
      purchaseId: purchaseId && Types.ObjectId.isValid(purchaseId) ? new Types.ObjectId(purchaseId) : undefined,
      requirements: requirements || "",
      link: link || undefined,
      linkDetails: linkDetails || undefined,
    } as any);

    // If purchaseId provided, attach to purchase.contentIds
    if (purchaseId && Types.ObjectId.isValid(purchaseId)) {
      try {
        await Purchase.findByIdAndUpdate(purchaseId, { $addToSet: { contentIds: created._id } });
      } catch (err) {
        console.error("Failed to attach link content to purchase:", err);
      }
    }

    return NextResponse.json({ id: created._id }, { status: 201 });
  } catch (err: any) {
    console.error("/api/my-content/link error", err);
    const message = typeof err?.message === "string" ? err.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
