// api/food/route.ts

import { connectDB, Food, User } from '@/lib/db';
import { NextResponse } from 'next/server';
import { sendVerificationEmail } from '@/lib/email';
import jwt from 'jsonwebtoken';
import axios from 'axios';

// GET endpoint to fetch available food listings
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

// POST endpoint to create a new food listing
export async function POST(req: Request) {
  await connectDB();
  const { foodName, foodCategory, quantity, pickupLocation, description, imageUrl } = await req.json();
  const token = req.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify the JWT token
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    // Geocode the pickup location using Google Maps Geocoding API
    const geocodeResponse = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
      params: {
        address: pickupLocation,
        key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY, // Ensure this is in your .env file
      },
    });

    // Check if the geocoding was successful
    if (geocodeResponse.data.status !== 'OK') {
      throw new Error('Failed to geocode address');
    }

    // Extract latitude and longitude from the geocoding response
    const { lat, lng } = geocodeResponse.data.results[0].geometry.location;

    // Create the food listing with the geocoded coordinates
    const food = await Food.create({
      foodName,
      foodCategory,
      quantity,
      pickupLocation,
      description,
      imageUrl,
      provider: decoded.id,
      status: 'available',
      coordinates: { lat, lng }, // Save the coordinates
    });

    return NextResponse.json(food);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create listing' }, { status: 500 });
  }
}

// PATCH endpoint to update food status (e.g., mark as pending)
export async function PATCH(req: Request) {
  await connectDB();
  const { foodId } = await req.json();
  const token = req.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify the JWT token
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    const charityId = decoded.id;

    // Update the food status and assign the charity
    const food = await Food.findByIdAndUpdate(
      foodId,
      { status: 'pending', charity: decoded.id },
      { new: true }
    ).populate('provider charity');

    // Send a verification email to the provider
    await sendVerificationEmail(food.provider.email, food._id, charityId);

    return NextResponse.json(food);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update status' }, { status: 500 });
  }
}