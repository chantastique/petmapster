
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { usePetContext } from '@/context/PetContext';
import { Pet } from '@/types';
import { TokenInput } from './TokenInput';
import { MapFilterButtons } from './MapFilterButtons';
import { MarkerRenderer } from './MarkerRenderer';

// We'll use the provided token but still allow users to change it if needed
let mapboxToken = 'pk.eyJ1IjoiY2hhbnRhc3RpcXVlIiwiYSI6ImNtOGtlZXg0ZTA2OXkycXEwdDd4dXY4Z2YifQ.24VO3kT5koNp1fRktApUpA';

interface MapViewProps {
  onSelectPet?: (pet: Pet) => void;
}

const MapView: React.FC<MapViewProps> = ({ onSelectPet }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { state, setMapFilter } = usePetContext();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [tokenError, setTokenError] = useState(false);
  const [userToken, setUserToken] = useState(mapboxToken);
  
  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || !mapboxToken) return;
    
    try {
      if (!map.current) {
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
        });

        map.current.on('error', (e) => {
          console.error('Mapbox error:', e);
          // Fix for the TS error - check for unauthorized status in a safer way
          if (e.error && typeof e.error === 'object' && 'status' in e.error && e.error.status === 401) {
            setTokenError(true);
            if (map.current) {
              map.current.remove();
              map.current = null;
            }
          }
        });
      }
    } catch (error) {
      console.error('Error initializing map:', error);
      setTokenError(true);
    }
    
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    };
  }, [mapboxToken]);

  const handleTokenChange = (token: string) => {
    setUserToken(token);
  };

  const handleTokenSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (userToken.trim()) {
      mapboxToken = userToken.trim();
      setTokenError(false);
      
      // Remove existing map instance to re-initialize with new token
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
    }
  };
  
  return (
    <div className="relative w-full h-full">
      {!mapboxToken || tokenError ? (
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
