// This file contains the updated fetch functions for videos and FAQs
// The full implementation is in admin-fixed.tsx

// Fetch videos from API
async function fetchVideos() {
  try {
    // Try to fetch from Supabase directly first
    const { data: videosData, error: videosError } = await supabase
      .from('videos')
      .select('*')
      .order('id', { ascending: true });
    
    if (videosError) {
      console.error('Error fetching videos from Supabase:', videosError);
      // Fall back to default videos
      console.log('Using default videos instead');
      setVideos(defaultVideoTutorials);
      return;
    }
    
    if (videosData && videosData.length > 0) {
      setVideos(videosData);
    } else {
      // No data in Supabase, use defaults
      console.log('No videos found in Supabase, using defaults');
      setVideos(defaultVideoTutorials);
    }
  } catch (error) {
    console.error('Error fetching videos:', error);
    // Fall back to default videos
    setVideos(defaultVideoTutorials);
  }
}

// Fetch FAQs from API
async function fetchFaqs() {
  try {
    // Try to fetch from Supabase directly first
    const { data: faqsData, error: faqsError } = await supabase
      .from('faqs')
      .select('*')
      .order('id', { ascending: true });
    
    if (faqsError) {
      console.error('Error fetching FAQs from Supabase:', faqsError);
      // Fall back to default FAQs
      console.log('Using default FAQs instead');
      setFaqs(defaultFaqItems);
      return;
    }
    
    if (faqsData && faqsData.length > 0) {
      setFaqs(faqsData);
    } else {
      // No data in Supabase, use defaults
      console.log('No FAQs found in Supabase, using defaults');
      setFaqs(defaultFaqItems);
    }
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    // Fall back to default FAQs
    setFaqs(defaultFaqItems);
  }
}