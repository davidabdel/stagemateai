import { NextResponse } from 'next/server';

// Access the mock FAQs from the parent route
// This is a workaround for demonstration purposes
// In a real app, you would use a database or a proper state management solution
declare const mockFaqs: any[];

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { question, answer } = body;
    
    // Validate required fields
    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      );
    }
    
    // Find the FAQ in our mock data
    const faqIndex = mockFaqs.findIndex(f => f.id === id);
    
    if (faqIndex === -1) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      );
    }
    
    // Update the FAQ
    const updatedFaq = {
      ...mockFaqs[faqIndex],
      question,
      answer,
      updated_at: new Date().toISOString()
    };
    
    // Replace the old FAQ with the updated one
    mockFaqs[faqIndex] = updatedFaq;
    
    return NextResponse.json({ success: true, faq: updatedFaq });
  } catch (error) {
    console.error('Error updating FAQ:', error);
    return NextResponse.json(
      { error: 'Failed to update FAQ' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Find the FAQ in our mock data
    const faqIndex = mockFaqs.findIndex(f => f.id === id);
    
    if (faqIndex === -1) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      );
    }
    
    // Remove the FAQ from our mock array
    mockFaqs.splice(faqIndex, 1);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return NextResponse.json(
      { error: 'Failed to delete FAQ' },
      { status: 500 }
    );
  }
}