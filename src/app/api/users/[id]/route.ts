import { NextRequest, NextResponse } from 'next/server';
import { clerkClient } from '@clerk/nextjs/server';
import { getUserByClerkId } from '@/lib/user';

export async function GET(request: NextRequest, context: any) {
  try {
    const params = await context?.params;
    const id = params?.id;
    if (!id || typeof id !== 'string') {
      return new NextResponse('Invalid user id', { status: 400 });
    }

    // Try local DB first
    const local = await getUserByClerkId(id).catch(() => null);
    if (local && (local.firstName || local.lastName)) {
      const name = `${local.firstName || ''}${local.firstName && local.lastName ? ' ' : ''}${local.lastName || ''}`.trim();
      return NextResponse.json({ id, displayName: name });
    }

    // Fallback to Clerk
    const clerk = await clerkClient();
    const cuser = await clerk.users.getUser(id).catch(() => null);
    if (!cuser) return new NextResponse('User not found', { status: 404 });

    const primaryEmail = cuser.emailAddresses?.find((e: any) => e.id === cuser.primaryEmailAddressId);
    const email = primaryEmail?.emailAddress || cuser.emailAddresses?.[0]?.emailAddress;
    const name = `${cuser.firstName || ''}${cuser.firstName && cuser.lastName ? ' ' : ''}${cuser.lastName || ''}`.trim() || email || id;

    return NextResponse.json({ id, displayName: name });
  } catch (err) {
    console.error('Error fetching user display name', err);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
