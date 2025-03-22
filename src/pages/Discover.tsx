
import React, { useState } from 'react';
import MapView from '@/components/Map/MapView';
import Navbar from '@/components/Layout/Navbar';
import { usePetContext } from '@/context/PetContext';
import { Pet } from '@/types';
import { X, MapPin, Star, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const Discover = () => {
  const { state, selectPet } = usePetContext();
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  
  const handleSelectPet = (pet: Pet) => {
    setSelectedPet(pet);
  };
  
  const handleClosePetDetails = () => {
    setSelectedPet(null);
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 relative">
        <MapView onSelectPet={handleSelectPet} />
        
        <AnimatePresence>
          {selectedPet && (
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ type: 'spring', damping: 25 }}
              className="absolute inset-x-4 bottom-24 glass-panel shadow-lg overflow-hidden max-h-[70vh] overflow-y-auto"
            >
              <div className="relative">
                <img 
                  src={selectedPet.imageUrl} 
                  alt={selectedPet.name || `A ${selectedPet.type}`}
                  className="w-full aspect-video object-cover"
                />
                <button
                  onClick={handleClosePetDetails}
                  className="absolute top-4 right-4 bg-black/50 p-2 rounded-full text-white"
                >
                  <X className="w-5 h-5" />
                </button>
                <div className="absolute top-4 left-4 flex gap-2">
                  <span className="bg-black/50 text-white px-3 py-1 rounded-full text-sm capitalize backdrop-blur-sm">
                    {selectedPet.type}
                  </span>
                  <span className="bg-black/50 text-white px-3 py-1 rounded-full text-sm flex items-center gap-1 backdrop-blur-sm">
                    <Star className="w-4 h-4 fill-yellow-400 stroke-yellow-400" />
                    {selectedPet.rating}
                  </span>
                </div>
              </div>
              
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">
                  {selectedPet.name || `${selectedPet.type.charAt(0).toUpperCase() + selectedPet.type.slice(1)} in a window`}
                </h2>
                
                <div className="flex items-center text-sm text-muted-foreground mb-4">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span>{selectedPet.location.address || 'Location pinned'}</span>
                </div>
                
                {selectedPet.description && (
                  <p className="mb-4 text-muted-foreground">{selectedPet.description}</p>
                )}
                
                <div className="text-xs text-muted-foreground mt-4">
                  Spotted {format(new Date(selectedPet.timestamp), 'PPpp')}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <Navbar />
    </div>
  );
};

export default Discover;
