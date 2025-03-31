// /api/requests/[id]/confirm/route.ts
import { connectDB, Food, Notification } from '@/lib/db';
import { NextResponse } from 'next/server';
import { sendConfirmationEmail } from '@/lib/email';


export async function POST(req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  
  try {
    const request = await Notification.findByIdAndUpdate(params.id, {
      status: 'confirmed'
    }).populate('charity food provider');

    if (!request) {
      return NextResponse.json({ error: 'Request not found' }, { status: 404 });
    }

    await Food.findByIdAndUpdate(request.food._id, {
      status: 'picked_up', 
      charity: request.charity._id
    });

    // Send confirmation email and notification
    // Add your email sending logic here

    await Notification.create({
        charity: request.charity._id,
        provider: request.provider._id,
        food: request.food._id,
        message: `Your request for ${request.food.foodName} has been approved!`,
        type: 'general',
        status: 'confirmed'
      });


      if (request.charity.email) {
        await sendConfirmationEmail(
          request.charity.email,
          {
            foodName: request.food.foodName,
            pickupLocation: request.food.pickupLocation
          }
        );
      }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Confirmation failed' }, { status: 500 });
  }
}
