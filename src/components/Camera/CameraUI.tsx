
import React from 'react';
import { Camera, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface CameraUIProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  cameraActive: boolean;
  cameraError: string | null;
  isVideoReady: boolean;
  isInitializing: boolean;
  onCapture: () => void;
  onRetry: () => void;
}

const CameraUI: React.FC<CameraUIProps> = ({
  videoRef,
  cameraActive,
  cameraError,
  isVideoReady,
  isInitializing,
  onCapture,
  onRetry
}) => {
  const renderCameraError = () => {
    if (!cameraError) return null;
    
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {cameraError}. Please check your browser settings and try again.
        </AlertDescription>
      </Alert>
    );
  };
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 relative"
    >
      {cameraActive ? (
        <>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-white rounded-lg opacity-50" />
          </div>
          <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center">
            <button 
              onClick={onCapture} 
              disabled={!isVideoReady}
              className={`w-16 h-16 rounded-full ${isVideoReady ? 'bg-white/20 backdrop-blur-sm' : 'bg-gray-400/20'} flex items-center justify-center transition-all`}
              aria-label="Take photo"
            >
              <span className={`w-12 h-12 rounded-full ${isVideoReady ? 'bg-white' : 'bg-gray-400'} shadow-md`} />
            </button>
          </div>
        </>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-muted text-center">
          {renderCameraError()}
          <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium mb-4">
            {isInitializing ? 'Initializing camera...' : (cameraError ? 'Camera access failed' : 'Camera access required')}
          </p>
          <Button
            onClick={onRetry}
            variant="default"
            disabled={isInitializing}
            className="pet-gradient px-6 py-3 rounded-full text-white shadow-md flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isInitializing ? 'animate-spin' : ''}`} />
            {isInitializing ? 'Initializing...' : (cameraError ? 'Try Again' : 'Enable Camera')}
          </Button>
        </div>
      )}
    </motion.div>
  );
};

export default CameraUI;
