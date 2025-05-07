-- Create videos table
CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    videoId TEXT NOT NULL,
    thumbnail TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create FAQs table
CREATE TABLE IF NOT EXISTS faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add initial default videos if needed
INSERT INTO videos (title, description, videoId, thumbnail)
VALUES 
    ('Getting Started with StageMate AI', 'Learn the basics of using StageMate AI to create stunning product images.', 'dQw4w9WgXcQ', '/images/video-thumbnail-1.jpg'),
    ('Advanced Staging Techniques', 'Take your product images to the next level with these advanced techniques.', 'dQw4w9WgXcQ', '/images/video-thumbnail-2.jpg'),
    ('Optimizing Your Images for E-commerce', 'Learn how to optimize your staged images for maximum impact on e-commerce platforms.', 'dQw4w9WgXcQ', '/images/video-thumbnail-3.jpg')
ON CONFLICT (id) DO NOTHING;

-- Add initial default FAQs if needed
INSERT INTO faqs (question, answer)
VALUES 
    ('How do I create my first image?', 'Navigate to the dashboard, click on "Create New Image", upload your product image, and follow the prompts to generate your staged image.'),
    ('What file formats are supported?', 'We support JPG, PNG, and WEBP formats. For best results, use high-resolution images with clear product visibility.'),
    ('How many credits do I need per image?', 'Each image generation uses 1 credit. The number of credits you have depends on your subscription plan.'),
    ('Can I upgrade my plan?', 'Yes! You can upgrade your plan at any time from the dashboard by clicking on "Upgrade" in the top right corner.'),
    ('How do I download my images?', 'Your generated images will appear in your dashboard. Click on any image and use the download button to save it to your device.'),
    ('What if I run out of credits?', 'You can purchase additional credits or upgrade your plan to get more credits. Visit the dashboard and click on "Get More Credits".')
ON CONFLICT (id) DO NOTHING;
