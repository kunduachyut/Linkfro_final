import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { dbConnect } from '@/lib/db';
import Purchase from '@/models/Purchase';

export async function PATCH(req: NextRequest, context: any) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const params = await context.params;
    const { id } = params as { id: string };
    const body = await req.json();

    if (!id) return NextResponse.json({ error: 'Missing purchase id' }, { status: 400 });
    if (!body || !body.linkDetails) return NextResponse.json({ error: 'Missing linkDetails payload' }, { status: 400 });

    await dbConnect();
    const purchase = await Purchase.findById(id).exec();
    if (!purchase) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Save link details and mark content selection as 'link'
    purchase.linkDetails = body.linkDetails;
    purchase.contentSelection = 'link';
    await purchase.save();

    return NextResponse.json({ success: true, linkDetails: purchase.linkDetails, contentSelection: purchase.contentSelection });
  } catch (err) {
    console.error('Failed to save link details', err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'Internal error', details: message }, { status: 500 });
  }
}
