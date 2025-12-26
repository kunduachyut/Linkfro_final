// app/api/purchases/route.ts (updated to use database models)
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { getOrCreateUser } from '@/lib/user';
import { dbConnect } from '@/lib/db';
import Purchase from '@/models/Purchase';
import { UserContent } from '@/models/Content';

export async function GET(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Check if user is super admin (you might want to implement proper role checking)
    const url = new URL(req.url);
    const isSuperAdmin = url.searchParams.get('role') === 'superadmin';
    
    let userPurchases;
    if (isSuperAdmin) {
      // If super admin, return all purchases with populated website data
      userPurchases = await Purchase.find()
        .populate('websiteId')
        .sort({ createdAt: -1 })
        .exec();
    } else {
      // Otherwise filter for current user
      userPurchases = await Purchase.find({ buyerId: userId })
        .populate('websiteId')
        .sort({ createdAt: -1 })
        .exec();
    }
    
    // Transform the data to match the expected format
    const formattedPurchases = userPurchases.map(purchase => ({
      id: purchase._id.toString(),
      _id: purchase._id.toString(),
      websiteId: purchase.websiteId?._id?.toString() || purchase.websiteId?.toString(),
      websiteTitle: purchase.websiteId?.title || 'Unknown Website',
      priceCents: purchase.amountCents,
      totalCents: purchase.amountCents,
      amountCents: purchase.amountCents,
      customerId: purchase.buyerId,
      customerEmail: '', // We'll populate this below
  paymentLink: purchase.paymentLink || null,
  docLink: purchase.docLink || null,
  liveLink: purchase.liveLink || null,
      status: purchase.status,
      contentType: purchase.contentSelection, // Use stored content selection
      linkDetails: purchase.linkDetails || null,
      createdAt: purchase.createdAt.toISOString(),
      updatedAt: purchase.updatedAt?.toISOString(),
      contentIds: purchase.contentIds?.map(id => id.toString()) || [] // Add contentIds
    }));
    
    // Populate customer email information
    for (const purchase of formattedPurchases) {
      try {
        const user = await getOrCreateUser(purchase.customerId);
        purchase.customerEmail = user.email;
      } catch (err) {
        console.error('Error fetching user email:', err);
        purchase.customerEmail = 'Unknown';
      }
    }

    return NextResponse.json(formattedPurchases);
  } catch (error) {
    console.error('Failed to fetch purchases:', error);
    return NextResponse.json(
      { error: 'Failed to fetch purchases' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { items, contentSelections } = await req.json();
    
    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: 'Items array is required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Get or create user to fetch real email
    const user = await getOrCreateUser(userId);

    // Process each item in the cart
    const purchaseResults = [];
    
    for (const item of items) {
      // Get content selection for this item
      const contentSelection = contentSelections?.[item.websiteId];
      
      // Create a purchase in the database
      const purchase = await Purchase.create({
        websiteId: item.websiteId,
        buyerId: userId,
        amountCents: item.priceCents,
        status: 'pending',
        contentIds: [], // Initialize with empty array
        contentSelection: contentSelections?.[item.websiteId] || null // Store user's content selection
      });
      
      // Transform to match expected format
      const formattedPurchase = {
        id: purchase._id.toString(),
        _id: purchase._id.toString(),
        websiteId: purchase.websiteId.toString(),
        websiteTitle: item.title,
        priceCents: purchase.amountCents,
  paymentLink: purchase.paymentLink || null,
  docLink: purchase.docLink || null,
  liveLink: purchase.liveLink || null,
        totalCents: purchase.amountCents,
        amountCents: purchase.amountCents,
        customerId: purchase.buyerId,
        customerEmail: user.email,
        status: purchase.status,
        contentType: purchase.contentSelection, // Use stored content selection
        linkDetails: purchase.linkDetails || null,
        createdAt: purchase.createdAt.toISOString(),
        updatedAt: purchase.updatedAt?.toISOString(),
        contentIds: purchase.contentIds?.map(id => id.toString()) || [] // Add contentIds
      };
      
      purchaseResults.push(formattedPurchase);
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Purchase requests sent to administrator for approval',
      purchases: purchaseResults
    });

  } catch (error) {
    console.error('Purchase error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// API endpoint to update purchase status
export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { purchaseId, status } = await req.json();
    
    if (!purchaseId || !status) {
      return NextResponse.json(
        { error: 'Purchase ID and status are required' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find and update the purchase
    const purchase = await Purchase.findByIdAndUpdate(
      purchaseId,
      { status, updatedAt: new Date() },
      { new: true }
    );
    
    if (!purchase) {
      return NextResponse.json(
        { error: 'Purchase request not found' },
        { status: 404 }
      );
    }

    // Transform to match expected format
    const formattedPurchase = {
      id: purchase._id.toString(),
      _id: purchase._id.toString(),
      websiteId: purchase.websiteId.toString(),
      websiteTitle: '', // We don't have this information in this context
      paymentLink: purchase.paymentLink || null,
      priceCents: purchase.amountCents,
      totalCents: purchase.amountCents,
      amountCents: purchase.amountCents,
      customerId: purchase.buyerId,
      customerEmail: '', // We don't have this information in this context
      status: purchase.status,
      contentType: purchase.contentSelection, // Use stored content selection
      linkDetails: purchase.linkDetails || null,
      createdAt: purchase.createdAt.toISOString(),
      updatedAt: purchase.updatedAt?.toISOString(),
      contentIds: purchase.contentIds?.map(id => id.toString()) || [] // Add contentIds
    };

    return NextResponse.json({ 
      success: true, 
      message: 'Purchase status updated',
      purchase: formattedPurchase
    });

  } catch (error) {
    console.error('Update purchase error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}