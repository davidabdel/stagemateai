# StageMate AI

StageMate AI is a powerful SaaS platform designed for real estate agents who want to eliminate the need for professional photographers or staging. With StageMate AI, agents can transform ordinary room photos into clean, virtually staged real estate images using advanced AI technology.

## Features

- **AI-Powered Image Transformation**: Transform messy room photos into professionally staged images
- **High-Quality Downloads**: Download AI-generated images in high resolution for marketing materials
- **Multiple Room Types**: Support for living rooms, bedrooms, kitchens, bathrooms, and more
- **Custom Styling**: Add style notes to guide the AI in creating the perfect look
- **Batch Processing**: Queue multiple photos for efficient processing
- **Real-Time Feedback**: Clear processing notifications keep you informed

## Technology Stack

- **Frontend**: Next.js with React
- **Backend**: Next.js API Routes
- **Authentication**: Supabase Auth
- **Database**: Supabase PostgreSQL
- **Storage**: Supabase Storage
- **AI Image Generation**: OpenAI Images Edit API with gpt-image-1 model
- **Styling**: TailwindCSS

## Implementation Details

### OpenAI Integration

StageMate AI uses the OpenAI Images Edit API with the gpt-image-1 model to transform original property photos into AI-staged versions. The implementation follows the official OpenAI documentation format:

```typescript
// Call the OpenAI Images Edit API
const response = await openai.images.edit({
  model: "gpt-image-1",
  image: imageFile, // Properly formatted using toFile and createReadStream
  prompt: prompt,   // Includes room type and style notes
  n: 1,
  size: "1024x1024",
  quality: "high"   // Request high-quality images for better downloads
});
```

### Storage Structure

- **original-photos**: Stores uploaded property photos
- **staged-photos**: Stores AI-generated staged photos

## Getting Started

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `OPENAI_API_KEY`
4. Run the development server: `npm run dev`
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

1. Sign up or log in to your account
2. Create a property listing
3. Upload property photos
4. Select room type and add style notes
5. Submit for AI processing
6. Download the high-quality staged images
