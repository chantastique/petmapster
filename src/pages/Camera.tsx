
import React, { useEffect, useState, useRef } from 'react';
import CameraView from '@/components/Camera/CameraView';
import Navbar from '@/components/Layout/Navbar';
import { toast } from '@/hooks/use-toast';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Camera = () => {
  const [browserSupport, setBrowserSupport] = useState<boolean | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const mountRef = useRef(true);

  useEffect(() => {
    // Set component as mounted
    setIsMounted(true);
    mountRef.current = true;
    
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
      }
      return true;
    };

    // Delay the camera support check to ensure browser is ready
    const timerId = setTimeout(() => {
      if (mountRef.current) {
        checkCameraSupport();
      }
    }, 1000);

    return () => {
      mountRef.current = false;
      clearTimeout(timerId);
      setIsMounted(false);
    };
  }, []);

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
        {browserSupport && isMounted && <CameraView />}
      </main>
      <Navbar />
    </div>
  );
};

export default Camera;
