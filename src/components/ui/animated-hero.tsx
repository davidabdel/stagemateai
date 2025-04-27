"use client";

import { useEffect, useMemo, useState } from "react";
import { MoveRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HeroProps {
  titles?: string[];
  heading?: string;
  description?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  primaryButtonHref?: string;
  secondaryButtonHref?: string;
}

function Hero({
  titles = ["stunning", "professional", "elegant", "modern", "inviting"],
  heading = "Transform empty spaces into",
  description = "Instantly turn empty or outdated rooms into beautifully staged spaces with our AI technology. No photographers, no designers, no waiting.",
  primaryButtonText = "Try it now – Free",
  secondaryButtonText = "View Examples",
  primaryButtonHref = "/auth",
  secondaryButtonHref = "/dashboard"
}: HeroProps) {
  const [titleNumber, setTitleNumber] = useState(0);
  const [fadeState, setFadeState] = useState("fade-in");
  const animatedTitles = useMemo(
    () => titles,
    [titles]
  );

  useEffect(() => {
    const intervalId = setInterval(() => {
      // Start fade out
      setFadeState("fade-out");
      
      // After fade out completes, change word and fade in
      setTimeout(() => {
        setTitleNumber((prev) => (prev === titles.length - 1 ? 0 : prev + 1));
        setFadeState("fade-in");
      }, 500);
    }, 3000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, [titles.length]);

  return (
    <div className="w-full">
      <div className="container mx-auto">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">
          <div>
            <Button variant="secondary" size="sm" className="gap-4">
              AI-Powered Virtual Staging <MoveRight className="w-4 h-4" />
            </Button>
          </div>
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular">
              <span className="text-blue-400">{heading}</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                &nbsp;
                <span
                  className={`absolute font-semibold transition-opacity duration-500 ${fadeState === "fade-in" ? "opacity-100" : "opacity-0"}`}
                >
                  {animatedTitles[titleNumber]}
                </span>
              </span>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center">
              {description}
            </p>
          </div>
          <div className="flex flex-row gap-3">
            <Button size="lg" className="gap-4" variant="outline" asChild>
              <a href={secondaryButtonHref}>{secondaryButtonText} <MoveRight className="w-4 h-4" /></a>
            </Button>
            <Button size="lg" className="gap-4" asChild>
              <a href={primaryButtonHref}>{primaryButtonText} <MoveRight className="w-4 h-4" /></a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };
