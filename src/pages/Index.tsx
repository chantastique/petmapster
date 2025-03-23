
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Camera, MapPin } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen grid-pattern flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-lg mx-auto text-center">
          <div className="mb-8">
            <h1 className="font-bold text-4xl mb-4 text-pet-dark">Pet Spotter</h1>
            <p className="text-muted-foreground text-lg">
              Discover and share adorable pets spotted in windows around your city
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
            {user ? (
              <>
                <Button asChild size="lg" className="pet-gradient-button w-full sm:w-auto">
                  <Link to="/camera">
                    <Camera className="mr-2" />
                    Take a Photo
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                  <Link to="/discover">
                    <MapPin className="mr-2" />
                    Discover Pets
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="lg" className="pet-gradient-button w-full sm:w-auto">
                  <Link to="/auth">
                    Get Started
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
                  <Link to="/auth">
                    Sign In
                  </Link>
                </Button>
              </>
            )}
          </div>
          
          <div className="glass-panel p-4 mb-8">
            <h2 className="font-semibold text-xl mb-3 text-pet-dark">How It Works</h2>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
              <div className="p-4">
                <div className="mx-auto bg-pet-light w-12 h-12 rounded-full flex items-center justify-center mb-3">
                  <Camera className="text-pet-dark" />
                </div>
                <h3 className="font-medium mb-1">Spot a Pet</h3>
                <p className="text-sm text-muted-foreground">Take a photo of a pet you see in a window</p>
              </div>
              <div className="p-4">
                <div className="mx-auto bg-pet-light w-12 h-12 rounded-full flex items-center justify-center mb-3">
                  <MapPin className="text-pet-dark" />
                </div>
                <h3 className="font-medium mb-1">Add Location</h3>
                <p className="text-sm text-muted-foreground">Tag the location where you spotted the pet</p>
              </div>
              <div className="p-4">
                <div className="mx-auto bg-pet-light w-12 h-12 rounded-full flex items-center justify-center mb-3">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pet-dark"><path d="M17 18a2 2 0 0 0-2-2H9a2 2 0 0 0-2 2"></path><rect width="18" height="18" x="3" y="3" rx="2"></rect><circle cx="12" cy="10" r="3"></circle></svg>
                </div>
                <h3 className="font-medium mb-1">Share</h3>
                <p className="text-sm text-muted-foreground">Share your pet sightings with the community</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="py-4 px-6 text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Pet Spotter. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
