// api/chat/[chatId]/route.ts

import { NextResponse } from 'next/server';
import { connectDB, Chat } from '@/lib/db';

export async function GET(req: Request, { params }: { params: { chatId: string } }) {
    await connectDB();
    try {
      const chat = await Chat.findById(params.chatId)
        .populate('charityId', 'name profileImage')
        .populate('providerId', 'name profileImage');
        
      return NextResponse.json(chat);
    } catch (error) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 });
    }
  }

