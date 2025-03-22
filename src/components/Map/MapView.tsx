
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { usePetContext } from '@/context/PetContext';
import { Pet } from '@/types';
import { MapPin, Cat, Dog, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

// To use Mapbox in a real app, you would need to set your own token
// For demo purposes, we're using a temporary token
mapboxgl.accessToken = 'pk.eyJ1IjoiZGVtb3Rva2VuOTg3NjU0IiwiYSI6ImNscnM3bXE4MzAwd28ya28wcnNteng3MXMifQ.9dGNhAMhgUC_P0tCbZ3AQA';

interface MapViewProps {
  onSelectPet?: (pet: Pet) => void;
}

const MapView: React.FC<MapViewProps> = ({ onSelectPet }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { state } = usePetContext();
  const [mapLoaded, setMapLoaded] = useState(false);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  
  // Initialize map
  useEffect(() => {
    if (mapContainer.current && !map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/light-v11',
        center: [-74.006, 40.7128], // Default to NYC
        zoom: 13
      });
      
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      map.current.addControl(new mapboxgl.GeolocateControl({
        positionOptions: {
          enableHighAccuracy: true
        },
        trackUserLocation: true
      }));
      
      map.current.on('load', () => {
        setMapLoaded(true);
      });
    }
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);
  
  // Add markers when pets data changes
  useEffect(() => {
    if (!mapLoaded || !map.current) return;
    
    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};
    
    // Filter pets based on the current map filter
    const filteredPets = state.pets.filter(pet => {
      if (state.mapFilter === 'all') return true;
      if (state.mapFilter === 'cats' && pet.type === 'cat') return true;
      if (state.mapFilter === 'dogs' && pet.type === 'dog') return true;
      if (state.mapFilter === 'other' && pet.type === 'other') return true;
      return false;
    });
    
    // Add new markers
    filteredPets.forEach(pet => {
      const { latitude, longitude } = pet.location;
      
      // Create custom marker element
      const el = document.createElement('div');
      el.className = 'map-marker';
      el.innerHTML = getMarkerHtml(pet);
      
      // Create and add the marker
      const marker = new mapboxgl.Marker(el)
        .setLngLat([longitude, latitude])
        .addTo(map.current!);
      
      // Add click event
      el.addEventListener('click', () => {
        if (onSelectPet) {
          onSelectPet(pet);
        }
      });
      
      markersRef.current[pet.id] = marker;
    });
    
    // Fit bounds if we have markers
    if (filteredPets.length > 0) {
      const bounds = new mapboxgl.LngLatBounds();
      filteredPets.forEach(pet => {
        bounds.extend([pet.location.longitude, pet.location.latitude]);
      });
      
      map.current.fitBounds(bounds, {
        padding: 50,
        maxZoom: 15
      });
    }
  }, [state.pets, state.mapFilter, mapLoaded, onSelectPet]);
  
  const getMarkerHtml = (pet: Pet) => {
    let icon;
    if (pet.type === 'cat') {
      icon = `<svg class="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5c.67 0 1.35.09 2 .26 1.78-2 5.03-2.84 6.42-2.26 1.4.58-.42 7-.42 7 .57 1.07 1 2.24 1 3.44C21 17.9 16.97 21 12 21s-9-3-9-7.56c0-1.25.5-2.4 1-3.44 0 0-1.89-6.42-.5-7 1.39-.58 4.72.23 6.5 2.23A9.04 9.04 0 0 1 12 5Z"></path><path d="M8 14v.5"></path><path d="M16 14v.5"></path><path d="M11.25 16.25h1.5L12 17l-.75-.75Z"></path></svg>`;
    } else if (pet.type === 'dog') {
      icon = `<svg class="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5"></path><path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5"></path><path d="M8 14v.5"></path><path d="M16 14v.5"></path><path d="M11.25 16.25h1.5L12 17l-.75-.75Z"></path><path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444c0-1.061-.162-2.2-.493-3.309m-9.243-6.082A8.801 8.801 0 0 1 12 5c.74 0 1.468.08 2.213.225"></path></svg>`;
    } else {
      icon = `<svg class="w-6 h-6 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path><path d="M5 3v4"></path><path d="M19 17v4"></path><path d="M3 5h4"></path><path d="M17 19h4"></path></svg>`;
    }
    
    return `
      <div class="relative flex items-center justify-center">
        <div class="w-10 h-10 ${getMarkerColor(pet)} rounded-full flex items-center justify-center shadow-lg transform transition hover:scale-110">
          ${icon}
        </div>
        <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 ${getMarkerColor(pet)} rotate-45"></div>
      </div>
    `;
  };
  
  const getMarkerColor = (pet: Pet) => {
    switch (pet.type) {
      case 'cat':
        return 'bg-red-500 text-white';
      case 'dog':
        return 'bg-blue-500 text-white';
      default:
        return 'bg-purple-500 text-white';
    }
  };
  
  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
      
      <div className="absolute top-4 left-4 right-4 z-10">
        <div className="blur-backdrop rounded-xl p-2 shadow-sm">
          <div className="flex items-center overflow-x-auto no-scrollbar">
            <MapFilterButton
              label="All"
              isActive={state.mapFilter === 'all'}
              onClick={() => usePetContext().setMapFilter('all')}
              icon={<MapPin className="w-4 h-4" />}
            />
            <MapFilterButton
              label="Cats"
              isActive={state.mapFilter === 'cats'}
              onClick={() => usePetContext().setMapFilter('cats')}
              icon={<Cat className="w-4 h-4" />}
            />
            <MapFilterButton
              label="Dogs"
              isActive={state.mapFilter === 'dogs'}
              onClick={() => usePetContext().setMapFilter('dogs')}
              icon={<Dog className="w-4 h-4" />}
            />
            <MapFilterButton
              label="Other"
              isActive={state.mapFilter === 'other'}
              onClick={() => usePetContext().setMapFilter('other')}
              icon={<Sparkles className="w-4 h-4" />}
            />
          </div>
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

const MapFilterButton: React.FC<MapFilterButtonProps> = ({
  label,
  isActive,
  onClick,
  icon
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center px-3 py-2 rounded-lg mr-2 transition-all whitespace-nowrap",
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

export default MapView;
