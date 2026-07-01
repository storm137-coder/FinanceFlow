import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    // Verify the ID token first
    const decodedIdToken = await adminAuth.verifyIdToken(idToken);

    // Set session expiration to 5 days
    const expiresIn = 60 * 60 * 24 * 5 * 1000;

    // Create the session cookie
    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn,
    });

    const options = {
      name: 'session',
      value: sessionCookie,
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    };

    // Set cookie in response
    const cookieStore = await cookies();
    cookieStore.set(options);

    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    console.error('Session creation failed:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session')?.value;
    
    if (sessionCookie) {
      // Clear cookie
      cookieStore.delete('session');

      // Attempt to revoke the session across all devices for this user
      // by verifying the cookie and then revoking tokens
      try {
        const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie);
        await adminAuth.revokeRefreshTokens(decodedClaims.sub);
      } catch (err) {
        // Ignored if invalid cookie
      }
    }
    
    return NextResponse.json({ status: 'success' }, { status: 200 });
  } catch (error) {
    console.error('Session deletion failed:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
