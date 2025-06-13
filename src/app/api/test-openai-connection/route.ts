import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

export async function GET(request: NextRequest) {
  console.log('Server: Testing OpenAI API connectivity');
  
  try {
    // Create OpenAI client with increased timeout
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      timeout: 30000, // 30 second timeout for this test
    });
    
    console.log('Server: OpenAI client created for connectivity test');
    console.log('Server: API Key type:', process.env.OPENAI_API_KEY?.substring(0, 8) + '...');
    
    // Track request timing
    const startTime = Date.now();
    
    try {
      // Just fetch the list of models as a simple connectivity test
      console.log('Server: Attempting to list OpenAI models');
      const models = await openai.models.list();
      
      const responseTime = Date.now() - startTime;
      console.log(`Server: OpenAI API connection successful in ${responseTime}ms`);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Successfully connected to OpenAI API',
        responseTime,
        modelCount: models.data.length
      });
    } catch (openaiError) {
      const responseTime = Date.now() - startTime;
      console.error(`Server: OpenAI API connection failed after ${responseTime}ms:`, openaiError);
      
      // Log detailed error information
      if (openaiError instanceof Error) {
        console.error('Server: OpenAI API error details:', {
          name: openaiError.name,
          message: openaiError.message,
          stack: openaiError.stack,
          // Additional properties that might be present in OpenAI errors
          status: (openaiError as any).status,
          code: (openaiError as any).code,
          type: (openaiError as any).type,
          param: (openaiError as any).param
        });
      }
      
      return NextResponse.json({ 
        success: false, 
        message: openaiError instanceof Error ? openaiError.message : 'Failed to connect to OpenAI API',
        error: openaiError instanceof Error ? {
          name: openaiError.name,
          message: openaiError.message,
          status: (openaiError as any).status,
          code: (openaiError as any).code,
          type: (openaiError as any).type,
        } : String(openaiError),
        responseTime
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Server: Error in API route:', error);
    
    return NextResponse.json(
      { 
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error',
        error: String(error)
      },
      { status: 500 }
    );
  }
}
