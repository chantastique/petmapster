
import React from 'react';
import CameraView from '@/components/Camera/CameraView';
import Navbar from '@/components/Layout/Navbar';

const Camera = () => {
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
