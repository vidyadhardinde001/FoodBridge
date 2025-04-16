import { connectDB, Food,Notification } from "@/lib/db";
import { NextResponse } from 'next/server';

export async function POST(req: Request, { params }: { params: { id: string } }) {
    await connectDB();
    const { confirmed } = await req.json();
  
    const food = await Food.findById(params.id)
      .select('+quantityUnit') // Ensure quantityUnit is included
      .orFail(new Error('Food not found'));
    
    if (confirmed) {
      food.status = 'charity_confirmed';
      await food.save();
      
      await Notification.create({
        charity: food.charity,
        food: food._id,
        message: `Receipt confirmed for ${food.foodName}`,
        type: 'general',
        status: 'confirmed'
      });
    } else {
      food.status = 'available';
      food.charity = undefined;
      await food.save();
      await Notification.create({
        charity: food.charity,
        food: food._id,
        message: `Receipt denied for ${food.foodName}`,
        type: 'general',
        status: 'rejected'
      });
    }
  
    return NextResponse.json({ success: true });
  }