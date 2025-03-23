
import React, { useEffect, useState } from 'react';
import CameraView from '@/components/Camera/CameraView';
import Navbar from '@/components/Layout/Navbar';
import { toast } from '@/components/ui/use-toast';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const Camera = () => {
  const [browserSupport, setBrowserSupport] = useState<boolean | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Set component as mounted
    setIsMounted(true);
    
    // Check if the browser supports the camera API
    const checkCameraSupport = () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setBrowserSupport(false);
        toast({
          variant: "destructive",
          title: "Camera not supported",
          description: "Your browser doesn't support camera access. Please try a modern browser like Chrome or Firefox."
        });
        return false;
      }
      setBrowserSupport(true);
      return true;
    };

    // Delay the camera support check to ensure browser is ready
    const timerId = setTimeout(() => {
      checkCameraSupport();
    }, 1000); // Increased delay to ensure browser is fully ready

    return () => {
      clearTimeout(timerId);
      setIsMounted(false); // Set component as unmounted
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
