// api/food/[id]/route.ts

import { connectDB, Food } from '@/lib/db';
import { NextResponse } from 'next/server';
import { sendConfirmationEmail } from '@/lib/email';
import jwt from 'jsonwebtoken';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await connectDB();

  try {
    // Extract token from headers
    const token = req.headers.get('authorization')?.split(' ')[1];
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify the token and get the provider's ID
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const { providerId, foodId } = decoded;
    console.log('Decoded token:', decoded);

    if (foodId !== params.id) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 403 });
    }

    // Find the food listing
    const food = await Food.findById(params.id).populate('charity').populate('provider', 'email');
    if (!food?.charity) {
      return NextResponse.json(
        { error: 'Charity not found for this food listing' },
        { status: 404 }
      );
    }

    if (food.status === 'picked_up') {
      return NextResponse.json(
        { error: 'This food has already been picked up' },
        { status: 400 }
      );
    }

    // Update food status
    food.status = 'picked_up';
    await food.save();

    // Send confirmation to charity (add this)
    if (food.charity && (food.charity as any).email) {
      await sendConfirmationEmail(
        (food.charity as any).email, 
        { foodName: food.foodName }
      );
    }

    return NextResponse.json(food);
  } catch (error) {
    console.error('Error updating food status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}