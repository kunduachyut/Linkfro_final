import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import Wishlist from "@/models/Wishlist";
import { requireAuth } from "@/lib/auth";

export async function GET(req: Request) {
  await dbConnect();

  const authCheck = await requireAuth();
  if (authCheck instanceof NextResponse) {
    return authCheck; // Return the 401 response
  }
  const userId = authCheck;

  try {
    // Find or create wishlist for the user
    let wishlist = await (Wishlist as any).findOne({ userId });
    if (!wishlist) {
      wishlist = await (Wishlist as any).create({ userId, websiteIds: [] });
    }

    return NextResponse.json({ 
      websiteIds: wishlist.websiteIds || [] 
    });
  } catch (error) {
    console.error("Error fetching wishlist:", error);
    return NextResponse.json(
      { error: "Failed to fetch wishlist" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  await dbConnect();

  const authCheck = await requireAuth();
  if (authCheck instanceof NextResponse) {
    return authCheck; // Return the 401 response
  }
  const userId = authCheck;

  try {
    const { websiteId, action } = await req.json();

    if (!websiteId || !action) {
      return NextResponse.json(
        { error: "Missing websiteId or action" },
        { status: 400 }
      );
    }

    // Find or create wishlist for the user
    let wishlist = await (Wishlist as any).findOne({ userId });
    if (!wishlist) {
      wishlist = await (Wishlist as any).create({ userId, websiteIds: [] });
    }

    // Update wishlist based on action
    if (action === "add") {
      if (!wishlist.websiteIds.includes(websiteId)) {
        wishlist.websiteIds.push(websiteId);
      }
    } else if (action === "remove") {
      wishlist.websiteIds = wishlist.websiteIds.filter(
        (id: string) => id !== websiteId
      );
    } else {
      return NextResponse.json(
        { error: "Invalid action. Use 'add' or 'remove'" },
        { status: 400 }
      );
    }

    await wishlist.save();

    return NextResponse.json({ 
      websiteIds: wishlist.websiteIds 
    });
  } catch (error) {
    console.error("Error updating wishlist:", error);
    return NextResponse.json(
      { error: "Failed to update wishlist" },
      { status: 500 }
    );
  }
}