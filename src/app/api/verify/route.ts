// app/api/verify/route.ts
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { connectDB, Food } from '@/lib/db';
import { sendConfirmationEmail } from '@/lib/email';

export async function POST(req: Request) {
  await connectDB();
  const { token, foodId } = await req.json();

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { 
      foodId: string, 
      charityId: string 
    };

    
    
    // Update food status
    const food = await Food.findByIdAndUpdate(
      foodId,
      { status: 'picked_up' },
      { new: true }
    )
    .populate('charity', 'email')
    .populate('provider', 'email');

    if (!food) {
      return NextResponse.json({ error: 'Food not found' }, { status: 404 });
    }

    food.status = 'picked_up';
    await food.save();

    // Send confirmation email to charity
    if (food.charity && (food.charity as any).email) {
      await sendConfirmationEmail(
        (food.charity as any).email, // Charity's email
        {
          foodName: food.foodName,
          pickupLocation: food.pickupLocation
        }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Verification failed:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}