// api/requests/route.ts

import { connectDB, Notification } from '@/lib/db';
import { NextResponse } from 'next/server';
import jwt  from 'jsonwebtoken';


export async function GET(req: Request) {
  await connectDB();
  const token = req.headers.get('authorization')?.split(' ')[1];

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const requests = await Notification.find({
      provider: decoded.id,
      type: 'request',
      status: 'pending'
    }).populate('food charity');
    
    return NextResponse.json(requests);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch requests' }, { status: 500 });
  }
}