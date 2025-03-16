// api/food/[id]/request/route.ts
import { connectDB, Food, User } from '@/lib/db';
import { NextResponse } from 'next/server';
import { sendVerificationEmail } from '@/lib/email';
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

    // Verify the token and get the charity's ID
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    console.log('Decoded token:', decoded);
    const charityId = decoded.id;

    // Find the food listing
    const food = await Food.findById(params.id)
      .populate('provider', 'email');
    if (!food) {
      return NextResponse.json(
        { error: 'Food listing not found' },
        { status: 404 }
      );
    }

    // Update the food status to "pending" and set the charity
    food.status = 'pending';
    food.charity = charityId;
    await food.save();

    // Send verification email to the provider
    await sendVerificationEmail(
      (food.provider as any).email, // Provider's email
      food._id.toString(),
      charityId
    );

    return NextResponse.json(food);
  } catch (error) {
    console.error('Error updating food status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}