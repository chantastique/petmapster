
export interface Pet {
  id: string;
  imageUrl: string;
  type: 'cat' | 'dog' | 'other';
  name?: string;
  rating: number;
  description?: string;
  location: {
    latitude: number;
    longitude: number;
    address?: string;
  };
  timestamp: number;
  userId: string;
}

export interface User {
  id: string;
  name: string;
  avatar?: string;
  petsSpotted: number;
}

export type MapViewType = 'all' | 'cats' | 'dogs' | 'other' | 'favorites';

export interface AppContextState {
  pets: Pet[];
  user: User | null;
  isLoading: boolean;
  selectedPet: Pet | null;
  mapFilter: MapViewType;
}
