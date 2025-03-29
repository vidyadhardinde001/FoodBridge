
// /api/requests/[id]/reject/route.ts
import { connectDB, Notification } from '@/lib/db';
import { NextResponse } from 'next/server';
import { sendRejectionEmail  } from '@/lib/email';


export async function POST(req: Request, { params }: { params: { id: string } }) {
  await connectDB();
  const { reason } = await req.json();

  try {
    const request = await Notification.findByIdAndUpdate(params.id, {
      status: 'rejected',
      reason
    }).populate('charity food provider');

    // Send rejection email and notification
    // Add your email sending logic here

    await Notification.create({
        charity: request.charity._id,
        provider: request.provider._id,
        food: request.food._id,
        message: `Request rejected: ${reason}`,
        type: 'general',
        status: 'rejected'
      });

      if (request.charity.email) {
        await sendRejectionEmail(
          request.charity.email,
          {
            foodName: request.food.foodName,
            reason: reason
          }
        );
      }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Rejection failed' }, { status: 500 });
  }
}