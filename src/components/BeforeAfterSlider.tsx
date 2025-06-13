'use client';

import React, { useState, useRef, useEffect } from 'react';

interface BeforeAfterSliderProps {
  beforeImage: string;
  afterImage: string;
  beforeAlt?: string;
  afterAlt?: string;
  height?: number;
  width?: number;
}

const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({
  beforeImage,
  afterImage,
  beforeAlt = 'Before image',
  afterAlt = 'After image',
  height = 500,
  width = 800,
}) => {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMouseDown = () => {
    isDragging.current = true;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent | MouseEvent | TouchEvent) => {
    if (!isDragging.current || !containerRef.current) return;

    let clientX: number;
    
    if ('touches' in e) {
      // Touch event
      clientX = e.touches[0].clientX;
    } else {
      // Mouse event
      clientX = (e as MouseEvent).clientX;
    }

    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const containerWidth = rect.width;
    
    // Calculate position as percentage
    let position = (x / containerWidth) * 100;
    
    // Clamp position between 0 and 100
    position = Math.max(0, Math.min(100, position));
    
    setSliderPosition(position);
  };

  const handleTouchMove = (e: TouchEvent) => {
    e.preventDefault(); // Prevent scrolling while dragging
    handleMouseMove(e);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isDragging.current = false;
    };

    const handleGlobalMouseMove = (e: MouseEvent) => {
      handleMouseMove(e);
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (isDragging.current) {
        handleTouchMove(e);
      }
    };

    // Add global event listeners
    document.addEventListener('mouseup', handleGlobalMouseUp);
    document.addEventListener('mousemove', handleGlobalMouseMove);
    document.addEventListener('touchend', handleGlobalMouseUp);
    document.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });

    return () => {
      // Clean up event listeners
      document.removeEventListener('mouseup', handleGlobalMouseUp);
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('touchend', handleGlobalMouseUp);
      document.removeEventListener('touchmove', handleGlobalTouchMove);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="relative overflow-hidden rounded-lg shadow-lg"
      style={{ width: '100%', maxWidth: `${width}px`, height: 'auto', aspectRatio: `${width}/${height}` }}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchEnd={handleMouseUp}
    >
      {/* Before Image (Full width) */}
      <div className="absolute inset-0 w-full h-full">
        <img
          src={beforeImage}
          alt={beforeAlt}
          className="w-full h-full object-cover"
        />
      </div>

      {/* After Image (Clipped) */}
      <div 
        className="absolute inset-0 overflow-hidden h-full"
        style={{ width: `${sliderPosition}%` }}
      >
        <img
          src={afterImage}
          alt={afterAlt}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Slider Control */}
      <div 
        className="absolute inset-y-0 z-20"
        style={{ left: `calc(${sliderPosition}% - 1px)` }}
      >
        {/* Vertical divider line */}
        <div className="absolute inset-y-0 w-[2px] bg-[#6ecfc9]"></div>
        
        {/* Slider handle with arrows */}
        <div 
          className="absolute top-1/2 -translate-y-1/2 flex items-center justify-center cursor-grab active:cursor-grabbing"
          style={{ pointerEvents: 'all' }}
        >
          {/* Left arrow */}
          <div className="absolute -left-10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="text-[#6ecfc9]">
              <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/>
            </svg>
          </div>
          
          {/* Right arrow */}
          <div className="absolute -right-10 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="text-[#6ecfc9]">
              <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeforeAfterSlider;
