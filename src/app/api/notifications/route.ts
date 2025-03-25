// api/notifications/route.ts
import { connectDB, Notification } from '@/lib/db';
import { NextResponse } from 'next/server';
import jwt  from 'jsonwebtoken';

export async function GET(req: Request) {
    await connectDB();
    const token = req.headers.get('authorization')?.split(' ')[1];
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  
    try {
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
      
      // Debug: Log the charity ID being queried
      console.log('Fetching notifications for charity:', decoded.id);
      
      const notifications = await Notification.find({ charity: decoded.id })
        .sort({ createdAt: -1 })
        .populate('food', 'foodName quantity condition')
        .limit(10);
  
      // Debug: Log the notifications found
      console.log('Notifications found:', notifications.length);
      
      return NextResponse.json(notifications);
    } catch (error) {
      console.error('Notification fetch error:', error);
      return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
    }
  }