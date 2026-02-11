import { NextRequest, NextResponse } from 'next/server';
import { prisma, isDatabaseAvailable } from '@/lib/prisma';
import { verifyPassword, generateToken } from '@/lib/auth';

// Mark as dynamic to prevent static rendering error
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log('=== SIGNIN REQUEST ===');
  
  // Check if database is available first
  const dbAvailable = await isDatabaseAvailable();
  if (!dbAvailable) {
    console.log('Database not available - using demo mode');
    return NextResponse.json(
      { 
        error: 'Database not available',
        message: 'Demo mode: Signin is disabled. Please configure a database.',
        demo: true
      },
      { status: 503 }
    );
  }
  
  try {
    const body = await request.json().catch((e) => {
      console.error('Failed to parse JSON body:', e);
      throw new Error('Invalid JSON in request body');
    });
    
    const { email, password } = body;
    console.log('Signin attempt for:', email);

    // Validation
    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    }).catch((e) => {
      console.error('Database error finding user:', e);
      throw new Error('Database error');
    });

    if (!user) {
      console.log('User not found');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    console.log('User found:', user.id);

    // Verify password
    const isValid = await verifyPassword(password, user.password);
    console.log('Password verification result:', isValid);

    if (!isValid) {
      console.log('Invalid password');
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email });
    console.log('Token generated');

    console.log('=== SIGNIN SUCCESS ===');
    
    // Create response with token in body
    const response = NextResponse.json({
      message: 'Login successful',
      user: { id: user.id, email: user.email },
      credits: user.credits,
      token
    }, { status: 200 });

    // Set cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Signin error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

