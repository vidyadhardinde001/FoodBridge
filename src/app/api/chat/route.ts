// app/api/chat/route.ts

import { NextResponse } from 'next/server';
import { connectDB, Chat } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function GET(req: Request) {
  await connectDB();
  const token = req.headers.get('authorization')?.split(' ')[1];

  try {
    const decoded: any = jwt.verify(token!, process.env.JWT_SECRET!);
    const userId = decoded.id;
    const role = decoded.role;
    const providerId = decoded.id;

    const query = role === 'provider' 
      ? { providerId: userId }
      : { charityId: userId };

    const chats = await Chat.find(query)
      .populate('charityId', 'name profileImage')
      .populate('providerId', 'name profileImage')
      .sort({ updatedAt: -1 });

    return NextResponse.json(chats);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 });
  }
}