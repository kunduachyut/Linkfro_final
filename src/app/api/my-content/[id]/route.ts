import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { dbConnect } from '@/lib/db';
import { UserContent } from '@/models/Content';
import Purchase from '@/models/Purchase';
import { Types } from 'mongoose';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, context: any) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const params = await context.params;
    const { id } = params as { id: string };
    if (!id || !Types.ObjectId.isValid(id)) return NextResponse.json({ error: 'Invalid id' }, { status: 400 });

    await dbConnect();

    const content = await UserContent.findById(id).lean();
    if (!content) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Allow access if requester is the uploader OR is the buyer for the linked purchase
    const isUploader = String(content.userId) === String(userId);
    let isBuyer = false;
    if (content.purchaseId && Types.ObjectId.isValid(String(content.purchaseId))) {
      try {
        const purchase = await Purchase.findById(content.purchaseId).lean();
        if (purchase && (purchase as any).buyerId && String((purchase as any).buyerId) === String(userId)) {
          isBuyer = true;
        }
      } catch (err) {
        // ignore
      }
    }

    if (!isUploader && !isBuyer) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const pdf = (content as any).pdf;
    if (!pdf || !pdf.data) return NextResponse.json({ error: 'File not available' }, { status: 404 });

    const buffer = Buffer.from(pdf.data as any);
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': pdf.contentType || 'application/pdf',
        'Content-Disposition': `inline; filename="${pdf.filename || 'document.pdf'}"`,
      },
    });
  } catch (err) {
    console.error('/api/my-content/[id] error', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
