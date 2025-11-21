import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from "@clerk/nextjs/server";
import Chat, { IChat, IMessage } from '@/models/Chat';

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

  // Access route params
  const params = context?.params;
  const purchaseId = (params as { purchaseId: string })?.purchaseId;

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

    return NextResponse.json(chat);
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

  // Access route params
  const params = context?.params;
  const purchaseId = (params as { purchaseId: string })?.purchaseId;

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

    return NextResponse.json(chat);
  } catch (error) {
    console.error('Error in POST /api/chat/[purchaseId]:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}