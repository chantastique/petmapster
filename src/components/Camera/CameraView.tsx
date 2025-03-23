
import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { usePetContext } from '@/context/PetContext';
import { Pet } from '@/types';
import { toast } from '@/hooks/use-toast';
import { useCamera } from '@/hooks/use-camera';
import CameraUI from './CameraUI';
import PetDetailsForm from './PetDetailsForm';

interface CameraViewProps {
  onCameraReady?: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCameraReady }) => {
  // States for pet details
  const [petType, setPetType] = useState<'cat' | 'dog' | 'other'>('cat');
  const [petName, setPetName] = useState('');
  const [petDescription, setPetDescription] = useState('');
  const [petRating, setPetRating] = useState(5);
  const [step, setStep] = useState<'camera' | 'details' | 'location'>('camera');
  
  // Context
  const { addPet } = usePetContext();
  
  // Custom hook for camera functionality
  const {
    videoRef,
    canvasRef,
    cameraActive,
    cameraError,
    isVideoReady,
    isInitializing,
    capturedImage,
    setCapturedImage,
    initCamera,
    stopCamera,
    captureImage
  } = useCamera({ onCameraReady });
  
  // Effect to initialize camera when on camera step
  useEffect(() => {
    if (step === 'camera' && !capturedImage) {
      const timeout = setTimeout(() => {
        initCamera();
      }, 1500);
      
      return () => {
        clearTimeout(timeout);
        if (step !== 'camera') {
          stopCamera();
        }
      };
    }
  }, [step, capturedImage, initCamera, stopCamera]);
  
  // Handle image capture
  const handleCaptureImage = () => {
    const image = captureImage();
    if (image) {
      setStep('details');
    }
  };
  
  // Handle retaking the photo
  const handleRetakePhoto = () => {
    setCapturedImage(null);
    setStep('camera');
  };
  
  // Handle form submission
  const handleSubmit = () => {
    // In a real app, you would get the actual location
    // For this demo, we're using mock coordinates
    const newPet: Omit<Pet, 'id' | 'userId' | 'timestamp'> = {
      imageUrl: capturedImage || '',
      type: petType,
      name: petName || undefined,
      rating: petRating,
      description: petDescription || undefined,
      location: {
        latitude: 40.7128 + (Math.random() * 0.02 - 0.01),
        longitude: -74.006 + (Math.random() * 0.02 - 0.01),
        address: '123 Pet Street'
      }
    };
    
    addPet(newPet);
    toast({
      title: "Pet added!",
      description: "Your furry friend is now on the map"
    });
    
    // Reset the form
    setCapturedImage(null);
    setPetType('cat');
    setPetName('');
    setPetDescription('');
    setPetRating(5);
    setStep('camera');
  };
  
  return (
    <div className="relative min-h-screen flex flex-col">
      <canvas ref={canvasRef} className="hidden" />
      
      <AnimatePresence mode="wait">
        {step === 'camera' && (
          <CameraUI
            videoRef={videoRef}
            cameraActive={cameraActive}
            cameraError={cameraError}
            isVideoReady={isVideoReady}
            isInitializing={isInitializing}
            onCapture={handleCaptureImage}
            onRetry={initCamera}
          />
        )}
        
        {step === 'details' && capturedImage && (
          <PetDetailsForm
            capturedImage={capturedImage}
            petType={petType}
            petName={petName}
            petDescription={petDescription}
            petRating={petRating}
            onTypeChange={setPetType}
            onNameChange={setPetName}
            onDescriptionChange={setPetDescription}
            onRatingChange={setPetRating}
            onRetake={handleRetakePhoto}
            onSubmit={handleSubmit}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CameraView;
