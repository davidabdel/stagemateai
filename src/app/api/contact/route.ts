import { NextResponse } from 'next/server';

// Pabbly webhook URL - in production, this should be stored in an environment variable
const WEBHOOK_URL = 'https://connect.pabbly.com/workflow/sendwebhookdata/IjU3NjUwNTZmMDYzMjA0MzM1MjZkNTUzNCI_3D_pc';

export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json();
    const { name, email, subject, message } = body;
    
    // Validate required fields
    if (!name || !email || !message) {
      return NextResponse.json({ 
        success: false, 
        message: 'Name, email, and message are required fields' 
      }, { status: 400 });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        success: false, 
        message: 'Please provide a valid email address' 
      }, { status: 400 });
    }
    
    // Prepare data for webhook
    const webhookData = {
      name,
      email,
      subject: subject || 'Contact Form Submission',
      message,
      timestamp: new Date().toISOString()
    };
    
    // Send data to webhook
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(webhookData),
    });
    
    if (!response.ok) {
      throw new Error(`Webhook responded with status: ${response.status}`);
    }
    
    // Return success response
    return NextResponse.json({ 
      success: true, 
      message: 'Your message has been sent successfully' 
    });
    
  } catch (error) {
    console.error('Error in contact form webhook:', error);
    return NextResponse.json({ 
      success: false, 
      message: error instanceof Error ? error.message : 'Failed to send message. Please try again later.' 
    }, { status: 500 });
  }
}