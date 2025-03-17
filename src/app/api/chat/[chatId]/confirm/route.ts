// api/chat/[chatId]/confirm/route.ts


import { NextResponse } from 'next/server';
import { connectDB, Chat, Food } from '@/lib/db';

export async function PATCH(req: Request, { params }: { params: { chatId: string } }) {
  await connectDB();
  
  try {
    const chat = await Chat.findById(params.chatId);
    const food = await Food.findByIdAndUpdate(
      chat.foodId,
      { status: 'picked_up' },
      { new: true }
    );
    
    await Chat.findByIdAndUpdate(params.chatId, { status: 'confirmed' });

    const io = getSocketServer();
    io.to(params.chatId).emit("food-status-update", food);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Confirmation failed' }, { status: 500 });
  }
}