import React from 'react';
import Link from 'next/link';

export default function Logo() {
  return (
    <Link href="/" className="flex items-center">
      <div className="flex items-center">
        <img 
          src="/images/3.png" 
          alt="StageMate Logo" 
          width={150}
          height={40}
          style={{ height: '40px', width: 'auto' }}
        />
      </div>
    </Link>
  );
}
