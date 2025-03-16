// api/food/route.ts

import { connectDB, Food, User } from '@/lib/db';
import { NextResponse } from 'next/server';
import { sendVerificationEmail } from '@/lib/email';
import jwt from 'jsonwebtoken';

export async function GET() {
  await connectDB();
  try {
    const foods = await Food.find({ status: 'available' })
      .populate('provider', 'name email phone address')
      .sort({ createdAt: -1 });
    return NextResponse.json(foods);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch food' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await connectDB();
  const { foodName,foodCategory, quantity, pickupLocation, description, imageUrl } = await req.json();
  const token = req.headers.get('authorization')?.split(' ')[1];

  try {
    const decoded: any = jwt.verify(token!, process.env.JWT_SECRET!);
    
    const food = await Food.create({
      foodName,
      foodCategory,
      quantity,
      pickupLocation,
      description,
      imageUrl,
      provider: decoded.id,
      status: 'available'
    });

    return NextResponse.json(food);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  await connectDB();
  const { foodId } = await req.json();
  const token = req.headers.get('authorization')?.split(' ')[1];

  try {
    const decoded: any = jwt.verify(token!, process.env.JWT_SECRET!);

    const charityId = decoded.id;
    const food = await Food.findByIdAndUpdate(
      foodId,
      { status: 'pending', charity: decoded.id },
      { new: true }
    ).populate('provider charity');

    // Send verification email to provider
    await sendVerificationEmail(food.provider.email, food._id,charityId);

    return NextResponse.json(food);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}