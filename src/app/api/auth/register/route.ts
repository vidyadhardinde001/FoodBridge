// api/auth/register/route.ts


import { connectDB, User } from '@/lib/db';
import { hashPassword } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // Connect to the database
    await connectDB();

    // Parse the request body
    const { role,coordinates, ...userData } = await req.json();
    console.log('Registration request:', { role, ...userData, coordinates });

    // Validate required fields
    if (!role || !userData.email || !userData.password || !userData.name || !userData.phone || !userData.fssai || !coordinates) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash the password
    const hashedPassword = await hashPassword(userData.password);

    // Create the user
    const user = await User.create({
      ...userData,
      password: hashedPassword,
      role,
      coordinates: coordinates
    });

    console.log('User created successfully:', user);

    return NextResponse.json(
      { message: 'User created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}