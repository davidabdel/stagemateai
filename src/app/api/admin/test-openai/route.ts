import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize the OpenAI client with your API key from environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET(request: NextRequest) {
  try {
    console.log('Testing OpenAI API connection...');
    
    // Simple test to check if the OpenAI API is working
    // We'll use a simple models.list call which is lightweight
    const response = await openai.models.list();
    
    // If we get here, the API is working
    console.log('OpenAI API connection successful');
    
    return NextResponse.json({ 
      success: true, 
      message: 'OpenAI API connection successful',
      apiVersion: '4.100.0', // Hardcoded version since openai.version is not available
      modelsAvailable: response.data.length
    });
  } catch (error: any) {
    console.error('OpenAI API connection failed:', error);
    
    return NextResponse.json({ 
      success: false, 
      message: 'OpenAI API connection failed',
      error: error.message || 'Unknown error'
    }, { status: 500 });
  }
}