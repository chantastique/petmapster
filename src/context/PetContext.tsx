
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Pet, User, AppContextState, MapViewType } from '../types';
import { useAuth } from './AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

// Mock data for development
const mockPets: Pet[] = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba',
    type: 'cat',
    name: 'Window Cat',
    rating: 5,
    description: 'Gorgeous orange tabby watching the world go by',
    location: {
      latitude: 40.7128,
      longitude: -74.006,
      address: '123 Broadway, New York'
    },
    timestamp: Date.now() - 3600000, // 1 hour ago
    userId: 'user1'
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1561037404-61cd46aa615b',
    type: 'dog',
    name: 'Curious Pup',
    rating: 4,
    description: 'Adorable dog looking out from a second-floor window',
    location: {
      latitude: 40.7138,
      longitude: -74.013,
      address: '456 5th Avenue, New York'
    },
    timestamp: Date.now() - 86400000, // 1 day ago
    userId: 'user1'
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13',
    type: 'cat',
    name: 'Sleepy Kitty',
    rating: 5,
    description: 'Black and white cat napping in a sunny window',
    location: {
      latitude: 40.7218,
      longitude: -73.996,
      address: '789 Park Avenue, New York'
    },
    timestamp: Date.now() - 172800000, // 2 days ago
    userId: 'user2'
  }
];

const mockUser: User = {
  id: 'user1',
  name: 'Pet Spotter',
  avatar: 'https://i.pravatar.cc/300',
  petsSpotted: 15
};

// Define initial state
const initialState: AppContextState = {
  pets: [],
  user: null,
  isLoading: true,
  selectedPet: null,
  mapFilter: 'all'
};

// Create context
const PetContext = createContext<{
  state: AppContextState;
  addPet: (pet: Omit<Pet, 'id' | 'userId' | 'timestamp'>) => void;
  selectPet: (pet: Pet | null) => void;
  setMapFilter: (filter: MapViewType) => void;
}>({
  state: initialState,
  addPet: () => {},
  selectPet: () => {},
  setMapFilter: () => {}
});

export const usePetContext = () => useContext(PetContext);

export const PetProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<AppContextState>(initialState);
  const { user, profile } = useAuth();

  // Load initial data
  useEffect(() => {
    // In a real app, this would fetch from an API
    setTimeout(() => {
      setState(prev => ({
        ...prev,
        pets: mockPets,
        user: user ? {
          id: user.id,
          name: profile?.username || user.email?.split('@')[0] || 'Pet Spotter',
          avatar: profile?.avatar_url || 'https://i.pravatar.cc/300',
          petsSpotted: profile?.petsSpotted || mockUser.petsSpotted
        } : null,
        isLoading: false
      }));
    }, 1000);
  }, [user, profile]);

  // Add a new pet
  const addPet = (petData: Omit<Pet, 'id' | 'userId' | 'timestamp'>) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "You need to be logged in to add pets."
      });
      return;
    }

    const newPet: Pet = {
      ...petData,
      id: `pet-${Date.now()}`,
      userId: user.id,
      timestamp: Date.now()
    };
    
    setState(prev => ({
      ...prev,
      pets: [newPet, ...prev.pets],
      user: prev.user ? {
        ...prev.user,
        petsSpotted: (prev.user.petsSpotted || 0) + 1
      } : null
    }));

    toast({
      title: "Pet added!",
      description: "Your pet sighting has been added successfully."
    });
  };
  
  // Select a pet for details view
  const selectPet = (pet: Pet | null) => {
    setState(prev => ({
      ...prev,
      selectedPet: pet
    }));
  };
  
  // Set map filter
  const setMapFilter = (filter: MapViewType) => {
    setState(prev => ({
      ...prev,
      mapFilter: filter
    }));
  };

  return (
    <PetContext.Provider value={{ state, addPet, selectPet, setMapFilter }}>
      {children}
    </PetContext.Provider>
  );
};
