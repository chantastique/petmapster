
import React from 'react';
import { MapPin, Cat, Dog, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MapViewType } from '@/types';

interface MapFilterButtonsProps {
  currentFilter: MapViewType;
  onFilterChange: (filter: MapViewType) => void;
}

export const MapFilterButtons: React.FC<MapFilterButtonsProps> = ({
  currentFilter,
  onFilterChange
}) => {
  return (
    <div className="absolute top-4 left-4 right-4 z-10">
      <div className="blur-backdrop rounded-xl p-2 shadow-sm">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <MapFilterButton
            label="All"
            isActive={currentFilter === 'all'}
            onClick={() => onFilterChange('all')}
            icon={<MapPin className="w-4 h-4" />}
          />
          <MapFilterButton
            label="Cats"
            isActive={currentFilter === 'cats'}
            onClick={() => onFilterChange('cats')}
            icon={<Cat className="w-4 h-4" />}
          />
          <MapFilterButton
            label="Dogs"
            isActive={currentFilter === 'dogs'}
            onClick={() => onFilterChange('dogs')}
            icon={<Dog className="w-4 h-4" />}
          />
          <MapFilterButton
            label="Other"
            isActive={currentFilter === 'other'}
            onClick={() => onFilterChange('other')}
            icon={<Sparkles className="w-4 h-4" />}
          />
        </div>
      </div>
    </div>
  );
};

interface MapFilterButtonProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
  icon: React.ReactNode;
}

export const MapFilterButton: React.FC<MapFilterButtonProps> = ({
  label,
  isActive,
  onClick,
  icon
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center px-3 py-2 rounded-lg transition-all whitespace-nowrap",
        isActive 
          ? "pet-gradient text-white shadow-sm" 
          : "bg-background text-muted-foreground hover:bg-muted"
      )}
    >
      <span className="mr-2">{icon}</span>
      <span className="text-sm font-medium">{label}</span>
    </button>
  );
};
