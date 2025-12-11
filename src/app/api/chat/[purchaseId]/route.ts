import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import Chat, { IChat, IMessage } from '@/models/Chat';
import { getUserByClerkId } from '@/lib/user';

export async function GET(
  request: NextRequest,
  context: any
) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId || !user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

  // Access route params (params can be a Promise in Next.js — await it)
  const params = await context?.params;
  const purchaseId = (params as { purchaseId?: string })?.purchaseId;

  if (!purchaseId || typeof purchaseId !== 'string') {
    return new NextResponse('Invalid purchaseId', { status: 400 });
  }

    // Find existing chat
  const chat = await Chat.findOne<IChat>({ purchaseId }).exec();
    
    if (!chat) {
      return NextResponse.json({ messages: [] });
    }


      // Get user role for message marking
      const userRole = user?.publicMetadata?.role || 'consumer';

    // Mark all unread messages from the other user as read
    if (chat.messages.length > 0) {
      const lastMessage = chat.messages[chat.messages.length - 1];
      if (lastMessage.senderRole !== userRole) {
        await Chat.findOneAndUpdate<IChat>(
          { purchaseId },
          { 
            $set: { 
              'messages.$[elem].read': true 
            }
          },
          { 
            arrayFilters: [
              { 
                'elem.senderRole': { $ne: userRole },
                'elem.read': false
              }
            ],
            new: true
          }
        ).exec();
      }
    }

    // Build sender name map and attach display names to messages
    try {
      const uniqueSenderIds = Array.from(new Set(chat.messages.map(m => String(m.sender))));
      const senderNameMap: Record<string, string> = {};
      const clerk = await clerkClient();
      await Promise.all(uniqueSenderIds.map(async (sid) => {
        try {
          const local = await getUserByClerkId(sid).catch(() => null);
          if (local && (local.firstName || local.lastName)) {
            senderNameMap[sid] = `${local.firstName || ''}${local.firstName && local.lastName ? ' ' : ''}${local.lastName || ''}`.trim();
            return;
          }
          const cuser = await clerk.users.getUser(sid).catch(() => null);
          if (cuser) {
            const primaryEmail = cuser.emailAddresses?.find((e: any) => e.id === cuser.primaryEmailAddressId);
            const email = primaryEmail?.emailAddress || cuser.emailAddresses?.[0]?.emailAddress;
            const name = `${cuser.firstName || ''}${cuser.firstName && cuser.lastName ? ' ' : ''}${cuser.lastName || ''}`.trim() || email || sid;
            senderNameMap[sid] = name;
          } else {
            senderNameMap[sid] = sid;
          }
        } catch (e) {
          senderNameMap[sid] = sid;
        }
      }));

      const messagesWithNames = chat.messages.map(m => ({
        ...((m as any).toObject ? (m as any).toObject() : m),
        senderName: senderNameMap[String((m as any).sender)] || String((m as any).sender)
      }));

      return NextResponse.json({ ...((chat as any).toObject ? (chat as any).toObject() : chat), messages: messagesWithNames });
    } catch (e) {
      // Fallback to original chat if anything goes wrong resolving names
      return NextResponse.json(chat);
    }
  } catch (error) {
    console.error('Error in GET /api/chat/[purchaseId]:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  context: any
) {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    
    if (!userId || !user) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

  const body = await request.json();
  const { message } = body;

  // Access route params (params can be a Promise in Next.js — await it)
  const params = await context?.params;
  const purchaseId = (params as { purchaseId?: string })?.purchaseId;

  if (!purchaseId || typeof purchaseId !== 'string') {
    return new NextResponse('Invalid purchaseId', { status: 400 });
  }

    if (!message || typeof message.content !== 'string' || !message.content.trim()) {
      return new NextResponse('Valid message content is required', { status: 400 });
    }

      // Get user role for message
      const userRole = user?.publicMetadata?.role || 'consumer';

    // Add or update chat with server-side timestamp
    const chatMessage: IMessage = {
      content: message.content,
      timestamp: new Date(),
      sender: userId,
      senderRole: userRole as 'consumer' | 'superadmin' | 'contentmanager',
      read: false
    };

    // Add or update chat
    const chat = await Chat.findOneAndUpdate<IChat>(
      { purchaseId },
      {
        $push: { messages: chatMessage },
        $setOnInsert: { createdAt: new Date() },
        $set: { lastUpdated: new Date() }
      },
      { upsert: true, new: true }
    ).exec();

    // Attach sender names for response
    try {
      const uniqueSenderIdsPost = Array.from(new Set(chat.messages.map(m => String(m.sender))));
      const senderNameMapPost: Record<string, string> = {};
      const clerkPost = await clerkClient();
      await Promise.all(uniqueSenderIdsPost.map(async (sid) => {
        try {
          const local = await getUserByClerkId(sid).catch(() => null);
          if (local && (local.firstName || local.lastName)) {
            senderNameMapPost[sid] = `${local.firstName || ''}${local.firstName && local.lastName ? ' ' : ''}${local.lastName || ''}`.trim();
            return;
          }
          const cuser = await clerkPost.users.getUser(sid).catch(() => null);
          if (cuser) {
            const primaryEmail = cuser.emailAddresses?.find((e: any) => e.id === cuser.primaryEmailAddressId);
            const email = primaryEmail?.emailAddress || cuser.emailAddresses?.[0]?.emailAddress;
            const name = `${cuser.firstName || ''}${cuser.firstName && cuser.lastName ? ' ' : ''}${cuser.lastName || ''}`.trim() || email || sid;
            senderNameMapPost[sid] = name;
          } else {
            senderNameMapPost[sid] = sid;
          }
        } catch (e) {
          senderNameMapPost[sid] = sid;
        }
      }));

      const messagesWithNamesPost = chat.messages.map(m => ({
        ...((m as any).toObject ? (m as any).toObject() : m),
        senderName: senderNameMapPost[String((m as any).sender)] || String((m as any).sender)
      }));

      return NextResponse.json({ ...((chat as any).toObject ? (chat as any).toObject() : chat), messages: messagesWithNamesPost });
    } catch (e) {
      return NextResponse.json(chat);
    }
  } catch (error) {
    console.error('Error in POST /api/chat/[purchaseId]:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}