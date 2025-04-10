// api/food/route.ts

import { connectDB, Food, User,Notification } from '@/lib/db';
import { NextResponse } from 'next/server';
import { sendVerificationEmail } from '@/lib/email';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import { sendNotificationEmail } from '@/lib/email';

// GET endpoint to fetch available food listings
export async function GET(req: Request) {
  await connectDB();
  const { searchParams } = new URL(req.url);
  const charity = searchParams.get('charity');
  const status = searchParams.get('status');
  try {
    const query: any = {};
    if (charity) query.charity = charity;
    if (status) query.status = status;

    const foods = await Food.find(query)
      .populate('provider', 'name email phone address _id')
      .populate('charity', 'name')
      .sort({ createdAt: -1 });
    return NextResponse.json(foods);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch food' }, { status: 500 });
  }
}

// POST endpoint to create a new food listing
export async function POST(req: Request) {
  await connectDB();
  const { foodName, foodCategory, quantity, pickupLocation, description, imageUrl,foodType,foodCondition, coordinates,pricingType, price, quantityUnit } = await req.json();
  const token = req.headers.get('authorization')?.split(' ')[1];

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Verify the JWT token
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const provider = await User.findById(decoded.id);

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

    const isVeg = foodType === 'veg';

    if (pricingType === 'paid' && (!price || price <= 0)) {
      return NextResponse.json(
        { error: "Invalid price for paid listing" },
        { status: 400 }
      );
    }

    // Create the food listing with the geocoded coordinates
    const food = await Food.create({
      foodName,
      foodCategory,
      quantity,
      quantityUnit,
      pickupLocation,
      pricingType,
      price: pricingType === 'paid' ? price : undefined,
      description,
      imageUrl,
      provider: decoded.id,
      status: 'available',
      isVeg,
      condition: foodCondition,
      coordinates: { lat, lng }, // Save the coordinates
    });

     // Find charities within 10km using manual distance calculation
     const allCharities = await User.find({ role: 'charity' });
    
     const nearbyCharities = allCharities.filter(charity => {
       if (!charity.coordinates || !charity.coordinates.lat || !charity.coordinates.lng) return false;
       
       const distance = calculateDistance(
         coordinates.lat,
         coordinates.lng,
         charity.coordinates.lat,
         charity.coordinates.lng
       );
       
       return distance <= 10; // 10 km
     });
 
     // Create notifications
     const notificationPromises = nearbyCharities.map(async charityUser => {
      try {
        // 1. Create database notification
        await Notification.create({
          charity: charityUser._id,
          food: food._id,
          message: `${provider.name} has ${foodCondition} ${foodName} (${quantity}${quantityUnit}) available near ${pickupLocation}`
        });

        // 2. Send email notification
        if (charityUser.email) {
          await sendNotificationEmail(
            charityUser.email,
            provider.name,
            {
              name: foodName,
              quantity: quantity.toString(),
              condition: foodCondition,
              category: foodCategory
            },
            `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/charity`
          );
        }

        console.log(`Notification sent to charity ${charityUser._id}`);
      } catch (error) {
        console.error(`Failed to notify charity ${charityUser._id}:`, error);
      }
    });
    await Promise.all(notificationPromises);

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

// Helper function to calculate distance between two coordinates in km
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
  return R * c; // Distance in km
}

function deg2rad(deg: number) {
  return deg * (Math.PI/180);
}