import { NextResponse } from 'next/server';
import { connectDB, User } from '@/lib/db';

export async function GET() {
  try {
    console.log('Attempting to connect to database...');
    await connectDB();
    console.log('Database connected successfully');

    console.log('Fetching providers from database...');
    const providers = await User.find(
      { role: 'provider' },
      { 
        name: 1,
        email: 1,
        phone: 1,
        fssai: 1,
        address: 1,
        coordinates: 1,
        organizationName: 1,
        isOnline: 1,
        lastSeen: 1,
        role: 1
      }
    )
    .sort({ isOnline: -1, name: 1 })
    .lean();

    console.log(`Found ${providers.length} providers`);

    const formattedProviders = providers.map(provider => ({
      ...provider,
      _id: provider._id.toString(),
      lastSeen: provider.lastSeen?.toISOString() || new Date().toISOString()
    }));

    return NextResponse.json({ 
      success: true,
      providers: formattedProviders
    });

  } catch (error) {
    console.error('Error in API route:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch providers',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}