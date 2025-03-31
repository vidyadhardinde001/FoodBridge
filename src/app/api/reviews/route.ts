import { connectDB, Review, Food, User } from '@/lib/db';
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

export async function POST(req: Request) {
  await connectDB();
  const { foodId, rating, comment } = await req.json();
  const token = req.headers.get('authorization')?.split(' ')[1];

  try {
    const decoded: any = jwt.verify(token!, process.env.JWT_SECRET!);
    const charityId = decoded.id;

    const food = await Food.findById(foodId).populate('provider');
    if (!food || food.status !== 'picked_up') {
      return NextResponse.json({ error: 'Invalid food item' }, { status: 400 });
    }

    const existingReview = await Review.findOne({ charityId, foodId });
    if (existingReview) {
      return NextResponse.json({ error: 'Review already exists' }, { status: 400 });
    }

    const newReview = await Review.create({
      providerId: food.provider._id,
      charityId,
      foodId,
      rating,
      comment
    });

    return NextResponse.json(newReview);
  } catch (error) {
    console.error('Review submission error:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const providerId = searchParams.get('providerId');

  try {
    const reviews = await Review.find({ providerId })
      .populate('charityId', 'name')
      .populate('foodId', 'foodName');
    
    const averageRating = reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length;

    return NextResponse.json({ reviews, averageRating: Number(averageRating.toFixed(1)) });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }
}