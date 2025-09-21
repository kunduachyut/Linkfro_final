import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Website from "@/models/Website";
import Purchase from "@/models/Purchase";
import AdRequest from "@/models/AdRequest";
import { requireAuth } from "@/lib/auth";
import { AdRequestSchema } from "@/utils/types";
import { Types } from "mongoose";

export async function GET(req: Request) {
  await dbConnect();
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const userId = authResult;

  const { searchParams } = new URL(req.url);
  const role = searchParams.get("role"); // "publisher" | default consumer

  if (role === "publisher") {
    const mySites = await Website.find({ userId: userId }).select("_id").exec();
    const siteIds = mySites.map((s) => s._id);
    const requests = await AdRequest.find({ websiteId: { $in: siteIds } })
      .sort({ createdAt: -1 })
      .populate("websiteId")
      .exec();
    return NextResponse.json(requests);
  }

  const requests = await AdRequest.find({ buyerId: userId })
    .sort({ createdAt: -1 })
    .populate("websiteId")
    .exec();
  return NextResponse.json(requests);
}

export async function POST(req: Request) {
  await dbConnect();
  const authResult = await requireAuth();
  if (authResult instanceof NextResponse) return authResult;
  const buyerId = authResult;

  const json = await req.json();
  const parsed = AdRequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { websiteId, message } = parsed.data;
  if (!Types.ObjectId.isValid(websiteId)) {
    return NextResponse.json({ error: "Invalid websiteId" }, { status: 400 });
  }

  const purchase = await Purchase.findOne({ websiteId, buyerId, status: "paid" }).exec();
  if (!purchase) {
    return NextResponse.json({ error: "You must buy this website first" }, { status: 403 });
  }

  const site = await Website.findById(websiteId).exec();
  if (!site) {
    return NextResponse.json({ error: "Website not found" }, { status: 404 });
  }

  const request = await AdRequest.create({
    websiteId,
    buyerId,
    publisherId: (site as any).userId || (site as any).ownerId,
    message,
  });
  return NextResponse.json(request, { status: 201 });
}
