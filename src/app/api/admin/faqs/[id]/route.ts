import { NextResponse } from 'next/server';
import { supabase } from '@/utils/supabaseClient';

export async function PUT(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();
    const { question, answer } = body;
    
    // Validate required fields
    if (!question || !answer) {
      return NextResponse.json(
        { error: 'Question and answer are required' },
        { status: 400 }
      );
    }
    
    // Update FAQ
    const { data, error } = await supabase
      .from('faqs')
      .update({ 
        question, 
        answer,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) {
      throw error;
    }
    
    if (data.length === 0) {
      return NextResponse.json(
        { error: 'FAQ not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true, faq: data[0] });
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
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    // Delete FAQ
    const { error } = await supabase
      .from('faqs')
      .delete()
      .eq('id', id);
    
    if (error) {
      throw error;
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    return NextResponse.json(
      { error: 'Failed to delete FAQ' },
      { status: 500 }
    );
  }
}
