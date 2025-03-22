
import React from 'react';
import Navbar from '@/components/Layout/Navbar';
import { usePetContext } from '@/context/PetContext';
import PetCard from '@/components/Pets/PetCard';
import { MapPin, Camera, User } from 'lucide-react';

const Profile = () => {
  const { state, selectPet } = usePetContext();
  const { user, pets } = state;
  
  // Filter pets posted by the current user
  const userPets = pets.filter(pet => pet.userId === user?.id);
  
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 pb-24">
        <div className="grid-pattern min-h-screen">
          <div className="container px-4 py-8 max-w-4xl mx-auto">
            <div className="glass-panel p-6 mb-8">
              {user ? (
                <div className="flex items-center">
                  <div className="relative">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-sm"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-pet-accent flex items-center justify-center text-white text-2xl">
                        {user.name.charAt(0)}
                      </div>
                    )}
                    <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-sm">
                      <div className="w-6 h-6 rounded-full bg-pet-accent flex items-center justify-center">
                        <Camera className="w-3 h-3 text-white" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="ml-6">
                    <h1 className="text-2xl font-bold">{user.name}</h1>
                    <div className="flex items-center text-sm text-muted-foreground mt-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span>New York City</span>
                    </div>
                    
                    <div className="mt-4">
                      <span className="inline-block px-3 py-1 bg-pet-light text-pet-dark rounded-full text-sm font-medium">
                        {user.petsSpotted} Pets Spotted
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-center p-8">
                  <div className="text-center">
                    <User className="w-12 h-12 mx-auto mb-4 text-muted" />
                    <p className="text-lg font-medium mb-4">Loading profile...</p>
                  </div>
                </div>
              )}
            </div>
            
            <h2 className="text-xl font-semibold mb-4 px-1">Your Spotted Pets</h2>
            
            {userPets.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {userPets.map(pet => (
                  <PetCard 
                    key={pet.id} 
                    pet={pet} 
                    onClick={() => selectPet(pet)}
                    className="animate-scale-in"
                  />
                ))}
              </div>
            ) : (
              <div className="glass-panel p-8 text-center">
                <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-4">No pets spotted yet</p>
                <p className="text-muted-foreground mb-6">
                  Start capturing photos of pets in windows to build your collection.
                </p>
                <a 
                  href="/camera" 
                  className="inline-block pet-gradient px-6 py-3 rounded-full text-white shadow-sm"
                >
                  Take Your First Photo
                </a>
              </div>
            )}
          </div>
        </div>
      </main>
      <Navbar />
    </div>
  );
};

export default Profile;
