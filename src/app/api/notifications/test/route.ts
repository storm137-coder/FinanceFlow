import { NextRequest, NextResponse } from 'next/server';
import { adminMessaging } from '@/lib/firebaseAdmin';

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'FCM token is required' }, { status: 400 });
    }

    const message = {
      notification: {
        title: 'FinanceFlow',
        body: 'Push notifications are working on your iPhone!',
      },
      token: token,
    };

    // Send a message to the device corresponding to the provided registration token.
    const response = await adminMessaging.send(message);
    
    return NextResponse.json({ success: true, messageId: response });
  } catch (error: any) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send notification', details: error.message },
      { status: 500 }
    );
  }
}
