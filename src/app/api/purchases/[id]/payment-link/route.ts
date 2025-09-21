import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { dbConnect } from '@/lib/db';
import Purchase from '@/models/Purchase';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // Next.js may provide params as a promise-like; await before using (see sync-dynamic-apis message)
    const { id } = await params as { id: string };
    const { paymentLink } = await req.json();
    if (!id) return NextResponse.json({ error: 'Missing purchase id' }, { status: 400 });

    await dbConnect();
    const purchase = await Purchase.findById(id).exec();
    if (!purchase) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    purchase.paymentLink = paymentLink || null;
    await purchase.save();

    return NextResponse.json({ success: true, paymentLink: purchase.paymentLink });
  } catch (err) {
    console.error('Failed to save payment link', err);
    const message = err instanceof Error ? err.message : String(err);
    // include message for debugging; consider removing details in production
    return NextResponse.json({ error: 'Internal error', details: message }, { status: 500 });
  }
}
