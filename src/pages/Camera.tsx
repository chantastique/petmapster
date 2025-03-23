
import React, { useEffect, useState, useRef } from 'react';
import CameraView from '@/components/Camera/CameraView';
import Navbar from '@/components/Layout/Navbar';
import { toast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

const Camera = () => {
  const [browserSupport, setBrowserSupport] = useState<boolean | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const mountRef = useRef(true);

  useEffect(() => {
    // Set component as mounted
    setIsMounted(true);
    mountRef.current = true;
    setIsLoading(true);
    
    // Check if the browser supports the camera API
    const checkCameraSupport = () => {
      if (!mountRef.current) return false;
      
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        if (mountRef.current) {
          setBrowserSupport(false);
          toast({
            variant: "destructive",
            title: "Camera not supported",
            description: "Your browser doesn't support camera access. Please try a modern browser like Chrome or Firefox."
          });
        }
        return false;
      }
      
      if (mountRef.current) {
        setBrowserSupport(true);
        setIsLoading(false);
      }
      return true;
    };

    // Give the browser a moment to initialize
    const timerId = setTimeout(() => {
      if (mountRef.current) {
        checkCameraSupport();
      }
    }, 1000); // Increased from 500ms to 1000ms

    return () => {
      mountRef.current = false;
      clearTimeout(timerId);
      setIsMounted(false);
    };
  }, []);

  // Fix: Use strict equality comparison (===) instead of comparing boolean types directly
  if (browserSupport === false) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 flex items-center justify-center p-4">
          <Alert variant="destructive" className="max-w-md mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-center py-2">
              Your browser doesn't support camera access.<br />
              Please try a modern browser like Chrome or Firefox.
            </AlertDescription>
          </Alert>
        </main>
        <Navbar />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 relative">
        {isLoading && browserSupport !== false && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm z-10 p-6">
            <p className="mb-4 text-center font-medium">Initializing camera...</p>
            <Progress value={65} className="w-64 h-2" />
          </div>
        )}
        {browserSupport === true && isMounted && <CameraView onCameraReady={() => setIsLoading(false)} />}
      </main>
      <Navbar />
    </div>
  );
};

export default Camera;
