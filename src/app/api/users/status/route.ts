import { NextResponse } from 'next/server';
import { connectDB, User } from '@/lib/db';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  await connectDB();
  const { isOnline } = await req.json();
  const token = req.headers.get('authorization')?.split(' ')[1];

  try {
    const decoded: any = jwt.verify(token!, process.env.JWT_SECRET!);
    await User.findByIdAndUpdate(decoded.id, {
      isOnline,
      lastSeen: new Date()
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Status update failed' }, { status: 500 });
  }
}