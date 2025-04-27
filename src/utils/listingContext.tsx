"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define the shape of a listing
export interface Listing {
  id: string;
  title: string;
  address: string;
  createdAt: string;
}

// Define the context type
interface ListingContextType {
  listings: Listing[];
  addListing: (title: string, address: string) => void;
  removeListing: (id: string) => void;
}

// Create the context
const ListingContext = createContext<ListingContextType | undefined>(undefined);

// Provider component
export function ListingProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage if available, otherwise empty array
  const [listings, setListings] = useState<Listing[]>(() => {
    if (typeof window !== "undefined") {
      const savedListings = localStorage.getItem("listings");
      return savedListings ? JSON.parse(savedListings) : [];
    }
    return [];
  });

  // Save to localStorage whenever listings change
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("listings", JSON.stringify(listings));
    }
  }, [listings]);

  // Add a new listing
  const addListing = (title: string, address: string) => {
    const newListing: Listing = {
      id: Date.now().toString(),
      title,
      address,
      createdAt: new Date().toISOString(),
    };
    setListings([...listings, newListing]);
  };

  // Remove a listing
  const removeListing = (id: string) => {
    setListings(listings.filter(listing => listing.id !== id));
  };

  return (
    <ListingContext.Provider value={{ listings, addListing, removeListing }}>
      {children}
    </ListingContext.Provider>
  );
}

// Custom hook to use the listing context
export function useListings() {
  const context = useContext(ListingContext);
  if (context === undefined) {
    throw new Error("useListings must be used within a ListingProvider");
  }
  return context;
}
