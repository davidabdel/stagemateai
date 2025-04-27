"use client";

import { Hero } from '@/components/ui/animated-hero';

export function HeroSection() {
  return (
    <Hero 
      titles={[
        "stunning",
        "professional", 
        "elegant", 
        "modern", 
        "inviting"
      ]}
      heading="Transform empty spaces into"
      description="Instantly turn empty or outdated rooms into beautifully staged spaces with our AI technology. No photographers, no designers, no waiting."
      primaryButtonText="Try it now – Free"
      secondaryButtonText="View Examples"
      primaryButtonHref="/auth"
      secondaryButtonHref="/dashboard"
    />
  );
}
