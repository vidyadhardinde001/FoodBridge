// api/request/route.ts

import { connectDB, Notification, User, Food } from '@/lib/db';
import { NextResponse } from 'next/server';
import { sendVerificationEmail } from '@/lib/email';
import jwt  from 'jsonwebtoken';


export async function POST(req: Request) {
  await connectDB();
  const { foodId, charityId } = await req.json();
  const token = req.headers.get('authorization')?.split(' ')[1];

  try {
    const decoded: any = jwt.verify(token!, process.env.JWT_SECRET!);
    const food = await Food.findById(foodId)
    .populate('provider')
    .populate('charity');

    if (!food || food.status !== 'available') {
    return NextResponse.json(
        { error: 'Food no longer available' },
        { status: 400 }
    );
    }
    const charity = await User.findById(charityId);

    // Create notification
    await Notification.create({
      provider: food.provider._id,
      charity: charityId,
      food: foodId,
      message: `${charity.name} wants to request your ${food.foodName}`,
      type: 'request',
      status: 'pending'
    });

    // Send email to provider
    await sendVerificationEmail(
        food.provider.email,
        {
          foodId: foodId,  // Pass foodId
          charityId: charityId,
          foodName: food.foodName,
          quantity: food.quantity,
          description: food.description
        },
        charity.name
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Request failed:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}