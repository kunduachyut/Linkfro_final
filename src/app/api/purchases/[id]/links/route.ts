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

    await dbConnect();
    const purchase = await Purchase.findById(id).exec();
    if (!purchase) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Accept either naming: docUrl or docLink, liveUrl or liveLink
    if (typeof body.docUrl === 'string') purchase.docLink = body.docUrl || null;
    if (typeof body.docLink === 'string') purchase.docLink = body.docLink || null;
    if (typeof body.liveUrl === 'string') purchase.liveLink = body.liveUrl || null;
    if (typeof body.liveLink === 'string') purchase.liveLink = body.liveLink || null;

    await purchase.save();

    return NextResponse.json({ success: true, docLink: purchase.docLink || null, liveLink: purchase.liveLink || null });
  } catch (err) {
    console.error('Failed to save links', err);
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: 'Internal error', details: message }, { status: 500 });
  }
}
