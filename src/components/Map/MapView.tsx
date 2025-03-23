
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { usePetContext } from '@/context/PetContext';
import { Pet } from '@/types';
import { TokenInput } from './TokenInput';
import { MapFilterButtons } from './MapFilterButtons';
import { MarkerRenderer } from './MarkerRenderer';
import { toast } from '@/components/ui/use-toast';

// Default token
const DEFAULT_MAPBOX_TOKEN = 'pk.eyJ1IjoiY2hhbnRhc3RpcXVlIiwiYSI6ImNtOGtlZXg0ZTA2OXkycXEwdDd4dXY4Z2YifQ.24VO3kT5koNp1fRktApUpA';

interface MapViewProps {
  onSelectPet?: (pet: Pet) => void;
}

const MapView: React.FC<MapViewProps> = ({ onSelectPet }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { state, setMapFilter } = usePetContext();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [tokenError, setTokenError] = useState(false);
  const [userToken, setUserToken] = useState(DEFAULT_MAPBOX_TOKEN);
  const [mapboxToken, setMapboxToken] = useState(DEFAULT_MAPBOX_TOKEN);
  
  // Clear any previous map instance when component unmounts
  useEffect(() => {
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, []);

  // Initialize map with the current token
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;
    
    // Clean up any existing map before creating a new one
    if (map.current) {
      map.current.remove();
      map.current = null;
      setMapLoaded(false);
    }
    
    try {
      mapboxgl.accessToken = mapboxToken;
      
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
        console.log('Map loaded successfully');
        toast({
          title: "Map loaded",
          description: "Mapbox map initialized successfully",
        });
      });

      map.current.on('error', (e: any) => {
        console.error('Mapbox error:', e);
        
        // Check for authorization errors
        if (e.error && typeof e.error === 'object' && 'status' in e.error && e.error.status === 401) {
          setTokenError(true);
          toast({
            title: "Map Error",
            description: "Invalid Mapbox token. Please try again.",
            variant: "destructive"
          });
          
          if (map.current) {
            map.current.remove();
            map.current = null;
          }
        }
      });
    } catch (error) {
      console.error('Error initializing map:', error);
      setTokenError(true);
      toast({
        title: "Map Error",
        description: "Failed to initialize Mapbox map",
        variant: "destructive"
      });
    }
  }, [mapboxToken]);

  const handleTokenChange = (token: string) => {
    setUserToken(token);
  };

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userToken.trim()) {
      setMapboxToken(userToken.trim());
      setTokenError(false);
      toast({
        title: "Token Updated",
        description: "Trying to load map with new token",
      });
    }
  };
  
  return (
    <div className="relative w-full h-full">
      {tokenError ? (
        <TokenInput 
          token={userToken}
          onTokenChange={handleTokenChange}
          onTokenSubmit={handleTokenSubmit}
        />
      ) : (
        <>
          <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
          
          <MapFilterButtons 
            currentFilter={state.mapFilter}
            onFilterChange={setMapFilter}
          />
          
          {mapLoaded && map.current && (
            <MarkerRenderer
              map={map.current}
              pets={state.pets}
              mapFilter={state.mapFilter}
              onSelectPet={onSelectPet}
            />
          )}
        </>
      )}
    </div>
  );
};

export default MapView;
