import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { dbConnect } from '@/lib/db';
import Purchase from '@/models/Purchase';
import { getOrCreateUser } from '@/lib/user';

export async function GET(req: NextRequest, context: any) {
  try {
    const params = await context.params;
    const { id } = params;

    await dbConnect();
    const purchase = await Purchase.findById(id).populate('websiteId').exec();
    if (!purchase) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const websiteObj: any = typeof purchase.websiteId === 'object' ? purchase.websiteId : null;
    const formatted = {
      id: purchase._id.toString(),
      _id: purchase._id.toString(),
      websiteId: websiteObj?._id?.toString() || purchase.websiteId?.toString(),
      websiteTitle: websiteObj?.title || 'Unknown Website',
      priceCents: purchase.amountCents,
      totalCents: purchase.amountCents,
      amountCents: purchase.amountCents,
      customerId: purchase.buyerId,
      customerEmail: '',
      status: purchase.status,
      paymentLink: purchase.paymentLink || null,
      contentType: purchase.contentSelection,
      createdAt: purchase.createdAt.toISOString(),
      updatedAt: purchase.updatedAt?.toISOString(),
      contentIds: purchase.contentIds?.map(id => id.toString()) || []
    };

    try {
      const user = await getOrCreateUser(formatted.customerId);
      formatted.customerEmail = user.email;
    } catch (err) {
      formatted.customerEmail = 'Unknown';
    }

    return NextResponse.json(formatted);
  } catch (err) {
    console.error('Failed to fetch purchase', err);
    return NextResponse.json({ error: 'Internal' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, context: any) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const params = await context.params;
    const { id } = params;
    const body = await req.json();
    const { status } = body;

    if (!id || !status) return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });

    await dbConnect();
    const purchase = await Purchase.findByIdAndUpdate(id, { status, updatedAt: new Date() }, { new: true }).exec();
    if (!purchase) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({ success: true, purchase });
  } catch (err) {
    console.error('Failed to patch purchase', err);
    return NextResponse.json({ error: 'Internal' }, { status: 500 });
  }
}
