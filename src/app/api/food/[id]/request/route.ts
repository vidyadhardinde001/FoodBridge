// api/food/[id]/request/route.ts
import { connectDB, Food, Chat } from '@/lib/db';
import { NextResponse } from 'next/server';
import { sendVerificationEmail } from '@/lib/email';
import jwt from 'jsonwebtoken';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  // Extract token from headers
  const token = req.headers.get('authorization')?.split(' ')[1];

  try {
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify the token and get the charity's ID
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    console.log('Decoded token:', decoded);
    // const charityId = decoded.id;
    const { charityId } = await req.json();

    // Find the food listing
    const food = await Food.findByIdAndUpdate(
      params.id,
      { 
        status: 'pending', 
        charity: charityId // Use proper charity ID
      },
      { new: true }
    ).populate('provider charity');
    if (!food) {
      return NextResponse.json(
        { error: 'Food listing not found' },
        { status: 404 }
      );
    }

    // Check for existing chat
    const existingChat = await Chat.findOne({
      foodId: params.id,
      charityId,
      providerId: food.provider._id
    });

    if (existingChat) {
      return NextResponse.json({ chatId: existingChat._id });
    }

    // Create new chat
    const newChat = await Chat.create({
      foodId: params.id,
      charityId,
      providerId: food.provider._id,
      messages: []
    });

    // Update the food status to "pending" and set the charity
    // food.status = 'pending';
    // food.charity = charityId;
    await food.save();

    // Send verification email to the provider
    // await sendVerificationEmail(
    //   (food.provider as any).email, // Provider's email
    //   food._id.toString(),
    //   charityId
    // );

    return NextResponse.json({ chatId: newChat._id });
  } catch (error) {
    console.error('Error updating food status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}