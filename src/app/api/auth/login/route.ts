import { connectDB, User } from '@/lib/db';
import { comparePassword, generateToken } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  await connectDB();

  const { email, password, role } = await req.json();

  try {
    // Find the user by email
    const user = await User.findOne({ email });
    if (!user || !(await comparePassword(password, user.password))) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Validate the user's role
    if (user.role !== role) {
      return NextResponse.json(
        { error: `You are not registered as a ${role}` },
        { status: 403 }
      );
    }

    // Generate token
    const token = generateToken(user);
    return NextResponse.json({
      token,
      role: user.role,
      ...(user.role === 'charity' && { organizationName: user.organizationName })
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Login failed' },
      { status: 500 }
    );
  }
}