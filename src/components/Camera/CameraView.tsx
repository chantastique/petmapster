import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Cat, Dog, Sparkles, Check, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePetContext } from '@/context/PetContext';
import { Pet } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';

const CameraView: React.FC = () => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [petType, setPetType] = useState<'cat' | 'dog' | 'other'>('cat');
  const [petName, setPetName] = useState('');
  const [petDescription, setPetDescription] = useState('');
  const [petRating, setPetRating] = useState(5);
  const [step, setStep] = useState<'camera' | 'details' | 'location'>('camera');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { addPet } = usePetContext();
  
  useEffect(() => {
    // Only start camera when on camera step and no image has been captured
    if (step === 'camera' && !capturedImage) {
      const initCamera = async () => {
        try {
          setCameraError(null);
          await startCamera();
        } catch (err) {
          console.error('Failed to initialize camera:', err);
          const errorMsg = err instanceof Error ? err.message : 'Unknown camera error';
          setCameraError(errorMsg);
          setCameraActive(false);
        }
      };
      
      initCamera();
    }
    
    // Clean up camera resources when component unmounts
    return () => {
      stopCamera();
    };
  }, [step, capturedImage]);
  
  const startCamera = async () => {
    // Clear any previous errors
    setCameraError(null);
    
    try {
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };
      
      console.log('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Camera access granted', stream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        toast({
          title: "Camera activated",
          description: "Camera is now ready to use"
        });
      } else {
        throw new Error('Video element not available');
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      let errorMessage = 'Could not access camera';
      
      if (err instanceof Error) {
        // Add more specific error messages based on common error types
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
          errorMessage = 'Camera permission denied. Please allow camera access in your browser settings.';
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
          errorMessage = 'No camera found on this device.';
        } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
          errorMessage = 'Camera is in use by another application.';
        } else if (err.name === 'OverconstrainedError') {
          errorMessage = 'Camera constraints not satisfied.';
        }
      }
      
      setCameraError(errorMessage);
      setCameraActive(false);
      toast({
        variant: "destructive",
        title: "Camera Error",
        description: errorMessage
      });
      
      throw new Error(errorMessage);
    }
  };
  
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  };
  
  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Make sure video is loaded before attempting to capture
      if (video.readyState !== 4) {
        toast({
          variant: "destructive",
          title: "Camera not ready",
          description: "Please wait for the camera to initialize fully"
        });
        return;
      }
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageDataURL = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageDataURL);
        stopCamera();
        setStep('details');
        toast({
          title: "Photo captured",
          description: "You can now add details about this pet"
        });
      }
    } else {
      toast({
        variant: "destructive",
        title: "Could not capture image",
        description: "Camera is not properly initialized"
      });
    }
  };
  
  const retakePhoto = () => {
    setCapturedImage(null);
    setStep('camera');
    startCamera();
  };
  
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
  
  const renderRatingStars = () => {
    return (
      <div className="flex items-center justify-center gap-2 my-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => setPetRating(star)}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
              petRating >= star ? 'bg-yellow-400 text-white' : 'bg-muted text-muted-foreground'
            }`}
          >
            {star}
          </button>
        ))}
      </div>
    );
  };

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
    <div className="relative min-h-screen flex flex-col">
      <canvas ref={canvasRef} className="hidden" />
      
      <AnimatePresence mode="wait">
        {step === 'camera' && (
          <motion.div
            key="camera"
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
                  onLoadedMetadata={() => console.log('Video element loaded')}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-white rounded-lg opacity-50" />
                </div>
                <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center">
                  <button 
                    onClick={captureImage} 
                    className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center"
                  >
                    <span className="w-12 h-12 rounded-full bg-white shadow-md" />
                  </button>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center p-4 bg-muted text-center">
                {renderCameraError()}
                <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-lg font-medium mb-4">
                  {cameraError ? 'Camera access failed' : 'Camera access required'}
                </p>
                <button
                  onClick={startCamera}
                  className="pet-gradient px-6 py-3 rounded-full text-white shadow-md"
                >
                  {cameraError ? 'Try Again' : 'Enable Camera'}
                </button>
              </div>
            )}
          </motion.div>
        )}
        
        {step === 'details' && capturedImage && (
          <motion.div
            key="details"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 overflow-auto pb-24"
          >
            <div className="relative aspect-square overflow-hidden">
              <img
                src={capturedImage}
                alt="Captured pet"
                className="w-full h-full object-cover"
              />
              <button
                onClick={retakePhoto}
                className="absolute top-4 left-4 bg-black/50 p-2 rounded-full text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 max-w-md mx-auto">
              <h2 className="text-2xl font-semibold mb-6 text-center">Pet Details</h2>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Pet Type</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setPetType('cat')}
                    className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
                      petType === 'cat' ? 'pet-gradient' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Cat className={`w-5 h-5 ${petType === 'cat' ? 'text-white' : ''}`} />
                    <span>Cat</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPetType('dog')}
                    className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
                      petType === 'dog' ? 'pet-gradient' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Dog className={`w-5 h-5 ${petType === 'dog' ? 'text-white' : ''}`} />
                    <span>Dog</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPetType('other')}
                    className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
                      petType === 'other' ? 'pet-gradient' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <Sparkles className={`w-5 h-5 ${petType === 'other' ? 'text-white' : ''}`} />
                    <span>Other</span>
                  </button>
                </div>
              </div>
              
              <div className="mb-6">
                <label htmlFor="petName" className="block text-sm font-medium mb-2">
                  Pet Name (optional)
                </label>
                <input
                  type="text"
                  id="petName"
                  value={petName}
                  onChange={(e) => setPetName(e.target.value)}
                  placeholder="What would you name this pet?"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background/80 focus:outline-none focus:ring-2 focus:ring-pet-accent"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">How cute is this pet?</label>
                {renderRatingStars()}
              </div>
              
              <div className="mb-6">
                <label htmlFor="petDescription" className="block text-sm font-medium mb-2">
                  Description (optional)
                </label>
                <textarea
                  id="petDescription"
                  value={petDescription}
                  onChange={(e) => setPetDescription(e.target.value)}
                  placeholder="Share what you noticed about this pet..."
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background/80 focus:outline-none focus:ring-2 focus:ring-pet-accent"
                />
              </div>
              
              <button
                onClick={handleSubmit}
                className="w-full pet-gradient py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all"
              >
                <Check className="w-5 h-5" />
                <span>Add to Map</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CameraView;
