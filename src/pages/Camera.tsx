
import React, { useEffect } from 'react';
import CameraView from '@/components/Camera/CameraView';
import Navbar from '@/components/Layout/Navbar';
import { toast } from '@/components/ui/use-toast';

const Camera = () => {
  useEffect(() => {
    // Check if the browser supports the camera API
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast({
        variant: "destructive",
        title: "Camera not supported",
        description: "Your browser doesn't support camera access. Please try a modern browser like Chrome or Firefox."
      });
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 relative">
        <CameraView />
      </main>
      <Navbar />
    </div>
  );
};

export default Camera;
