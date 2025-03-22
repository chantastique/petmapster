
import React from 'react';
import { Pet } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PetCardProps {
  pet: Pet;
  onClick?: () => void;
  className?: string;
}

const PetCard: React.FC<PetCardProps> = ({ pet, onClick, className }) => {
  return (
    <div 
      className={cn(
        "glass-panel overflow-hidden transition-all duration-300",
        "hover:shadow-md hover:scale-[1.01] active:scale-[0.99]",
        className
      )}
      onClick={onClick}
    >
      <div className="relative aspect-square">
        <img 
          src={pet.imageUrl} 
          alt={pet.name || `A ${pet.type}`}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity">
          <div className="absolute bottom-0 w-full p-3">
            <h3 className="text-white font-medium truncate">
              {pet.name || `${pet.type.charAt(0).toUpperCase() + pet.type.slice(1)} in window`}
            </h3>
          </div>
        </div>
        <div className="absolute top-2 right-2">
          <div className="flex items-center gap-1 bg-black/30 backdrop-blur-md rounded-full px-2 py-1 text-white">
            <Star className="w-4 h-4 fill-yellow-400 stroke-yellow-400" />
            <span className="text-sm font-medium">{pet.rating}</span>
          </div>
        </div>
        <div className="absolute top-2 left-2">
          <div className="bg-black/30 backdrop-blur-md rounded-full px-2 py-1 text-xs text-white capitalize">
            {pet.type}
          </div>
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-center text-xs text-muted-foreground mb-1">
          <MapPin className="w-3 h-3 mr-1" />
          <span className="truncate">{pet.location.address || 'Location pin'}</span>
        </div>
        <p className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(pet.timestamp), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
};

export default PetCard;
