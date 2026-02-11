import { NextRequest, NextResponse } from 'next/server';
import { prisma, isDatabaseAvailable } from '@/lib/prisma';
import { hashPassword, generateToken } from '@/lib/auth';

// Mark as dynamic to prevent static rendering error
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  console.log('=== SIGNUP REQUEST ===');
  
  // Check if database is available first
  const dbAvailable = await isDatabaseAvailable();
  if (!dbAvailable) {
    console.log('Database not available - using demo mode');
    return NextResponse.json(
      { 
        error: 'Database not available',
        message: 'Demo mode: Signup is disabled. Please configure a database.',
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
    
    const { email, password, name } = body;
    console.log('Signup attempt for:', email);

    // Validation
    if (!email || !password) {
      console.log('Missing email or password');
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    }).catch((e) => {
      console.error('Database error finding user:', e);
      throw new Error('Database error');
    });

    if (existingUser) {
      console.log('User already exists');
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);
    console.log('Password hashed successfully');

    // Count existing users for early-adopter credits (first 20 get 20 free credits)
    const userCount = await prisma.user.count();
    const initialCredits = userCount < 20 ? 20 : 0;
    console.log(`User count: ${userCount}, granting ${initialCredits} credits`);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        credits: initialCredits,
      }
    });
    console.log('User created:', user.id);

    // Generate token
    const token = generateToken({ userId: user.id, email: user.email });
    console.log('Token generated');

    // Create brand profile if name provided
    let brandProfile = null;
    if (name) {
      brandProfile = await prisma.brandProfile.create({
        data: {
          userId: user.id,
          name,
          category: 'STREETWEAR',
          subCategories: '',
          brandTone: 'MINIMAL',
          targetAudience: 'GENERAL_PUBLIC',
          environment: 'STUDIO',
        }
      });
      console.log('Brand profile created:', brandProfile.id);
    }

    console.log('=== SIGNUP SUCCESS ===');
    
    // Create response with token in body
    const response = NextResponse.json({
      message: 'User created successfully',
      user: { id: user.id, email: user.email },
      credits: user.credits,
      brandProfile,
      token
    }, { status: 201 });

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
    console.error('Signup error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

