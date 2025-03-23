
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Camera, X, Cat, Dog, Sparkles, Check, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePetContext } from '@/context/PetContext';
import { Pet } from '@/types';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';

interface CameraViewProps {
  onCameraReady?: () => void;
}

const CameraView: React.FC<CameraViewProps> = ({ onCameraReady }) => {
  // Mount status tracker
  const isMountedRef = useRef(true);
  
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [petType, setPetType] = useState<'cat' | 'dog' | 'other'>('cat');
  const [petName, setPetName] = useState('');
  const [petDescription, setPetDescription] = useState('');
  const [petRating, setPetRating] = useState(5);
  const [step, setStep] = useState<'camera' | 'details' | 'location'>('camera');
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const initTimeoutRef = useRef<number | null>(null);
  
  const { addPet } = usePetContext();
  
  // Set isMountedRef to false when component unmounts
  useEffect(() => {
    // Set as mounted
    isMountedRef.current = true;
    
    return () => {
      // Set as unmounted and clean up resources
      isMountedRef.current = false;
      
      // Clear any pending timeouts
      if (initTimeoutRef.current) {
        window.clearTimeout(initTimeoutRef.current);
        initTimeoutRef.current = null;
      }
      
      stopCamera();
    };
  }, []);
  
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      try {
        const tracks = streamRef.current.getTracks();
        tracks.forEach(track => track.stop());
        streamRef.current = null;
      } catch (error) {
        console.error('Error stopping camera:', error);
      }
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    // Only update state if still mounted
    if (isMountedRef.current) {
      setIsVideoReady(false);
      setCameraActive(false);
    }
  }, []);

  // Separate function to initialize the camera with improved error handling
  const initCamera = useCallback(async () => {
    // Only start initialization if not already in progress and component is mounted
    if (isInitializing || !isMountedRef.current) return;
    
    try {
      // If not mounted, exit immediately
      if (!isMountedRef.current) return;
      
      setIsInitializing(true);
      setCameraError(null);
      setCameraActive(false);
      setIsVideoReady(false);
      
      // First check: Verify mounted before delay
      if (!isMountedRef.current) {
        console.log('Component unmounted before initialization delay');
        return;
      }
      
      // Make sure DOM is fully rendered
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Check again if component is still mounted after delay
      if (!isMountedRef.current) return;
      
      // Check if video element is available
      if (!videoRef.current) {
        console.error('Video element not ready during initialization');
        if (isMountedRef.current) {
          setCameraError("Camera initialization failed - video element not ready");
          toast({
            variant: "destructive",
            title: "Camera Error",
            description: "Video element not ready. Please try again."
          });
        }
        return;
      }
      
      console.log('Starting camera with video element:', videoRef.current);
      
      // Start camera access
      const success = await startCamera();
      
      // Notify parent component that camera is ready
      if (success && onCameraReady && isMountedRef.current) {
        onCameraReady();
      }
    } catch (err) {
      console.error('Failed in initCamera:', err);
      if (isMountedRef.current) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown camera error';
        setCameraError(errorMsg);
        toast({
          variant: "destructive",
          title: "Camera Error",
          description: errorMsg
        });
      }
    } finally {
      if (isMountedRef.current) {
        setIsInitializing(false);
      }
    }
  }, [isInitializing, onCameraReady]);
  
  useEffect(() => {
    // Check if component is still mounted before proceeding
    if (!isMountedRef.current) return;
    
    // Only start camera when on camera step and no image captured
    if (step === 'camera' && !capturedImage) {
      // Simple delay to ensure DOM is ready
      if (initTimeoutRef.current) {
        window.clearTimeout(initTimeoutRef.current);
      }
      
      initTimeoutRef.current = window.setTimeout(() => {
        initTimeoutRef.current = null;
        
        // Check again if still mounted
        if (isMountedRef.current) {
          initCamera();
        }
      }, 1000); // Increased delay for better DOM initialization
    }
    
    // Clean up camera resources when component unmounts or step changes
    return () => {
      if (initTimeoutRef.current) {
        window.clearTimeout(initTimeoutRef.current);
        initTimeoutRef.current = null;
      }
      
      // Only stop camera if changing steps or unmounting
      if (step !== 'camera' || !isMountedRef.current) {
        stopCamera();
      }
    };
  }, [step, capturedImage, initCamera, stopCamera]);
  
  const startCamera = async () => {
    // Verify component is mounted before proceeding
    if (!isMountedRef.current) {
      return false;
    }
    
    // Clear any previous errors
    if (isMountedRef.current) {
      setCameraError(null);
    }
    
    // Check if videoRef is available before proceeding
    if (!videoRef.current) {
      console.error('Video element not available during startCamera');
      if (isMountedRef.current) {
        setCameraError('Camera initialization failed - video element not ready');
      }
      return false;
    }
    
    try {
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };
      
      console.log('Requesting camera access...');
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Camera access granted', stream);
      
      // Check if component is still mounted
      if (!isMountedRef.current) {
        // If component unmounted, clean up the stream
        stream.getTracks().forEach(track => track.stop());
        console.log('Component unmounted after getUserMedia');
        return false;
      }
      
      // Store stream in ref for later cleanup
      streamRef.current = stream;
      
      // Double check if videoRef is still available after async operation
      if (!videoRef.current || !isMountedRef.current) {
        // If component unmounted or video element is gone, clean up
        stream.getTracks().forEach(track => track.stop());
        console.log('Video element no longer available or component unmounted');
        return false;
      }
      
      // Set stream to video element
      videoRef.current.srcObject = stream;
      
      // Set up event handlers for video loading
      const video = videoRef.current;
      
      return new Promise<boolean>((resolve) => {
        const handleCanPlay = () => {
          video.removeEventListener('canplay', handleCanPlay);
          video.removeEventListener('error', handleError);
          
          if (isMountedRef.current) {
            setIsVideoReady(true);
            setCameraActive(true);
            console.log('Video can play now');
            resolve(true);
          } else {
            resolve(false);
          }
        };
        
        const handleError = () => {
          video.removeEventListener('canplay', handleCanPlay);
          video.removeEventListener('error', handleError);
          
          if (isMountedRef.current) {
            setCameraError('Failed to load video stream');
            setIsVideoReady(false);
            setCameraActive(false);
          }
          resolve(false);
        };
        
        // If already ready
        if (video.readyState >= 3) { // HAVE_FUTURE_DATA or higher
          if (isMountedRef.current) {
            setIsVideoReady(true);
            setCameraActive(true);
            console.log('Video ready immediately');
          }
          resolve(true);
          return;
        }
        
        // Otherwise wait for canplay event
        video.addEventListener('canplay', handleCanPlay);
        video.addEventListener('error', handleError);
        
        // Start playing
        video.play().catch(error => {
          console.error('Error playing video:', error);
          handleError();
        });
        
        // Set a timeout to resolve if canplay doesn't fire
        setTimeout(() => {
          if (isMountedRef.current && video.readyState >= 2) { // At least HAVE_CURRENT_DATA
            console.log('Forcing camera ready after timeout');
            handleCanPlay();
          } else if (isMountedRef.current) {
            console.log('Camera failed to initialize within timeout');
            handleError();
          }
        }, 5000); // Increased timeout for slower devices
      });
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
        } else {
          errorMessage = err.message || 'Could not access camera';
        }
      }
      
      // Clean up any partially initialized camera
      stopCamera();
      
      // Final check if still mounted
      if (isMountedRef.current) {
        setCameraError(errorMessage);
        setCameraActive(false);
        setIsVideoReady(false);
        
        toast({
          variant: "destructive",
          title: "Camera Error",
          description: errorMessage
        });
      }
      
      return false;
    }
  };
  
  const captureImage = () => {
    if (!isVideoReady || !cameraActive || !videoRef.current) {
      toast({
        variant: "destructive",
        title: "Camera not ready",
        description: "Please wait for the camera to initialize fully"
      });
      return;
    }
    
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
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
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-white rounded-lg opacity-50" />
                </div>
                <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center">
                  <button 
                    onClick={captureImage} 
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
                  onClick={() => {
                    if (!isInitializing && isMountedRef.current) {
                      setIsVideoReady(false);
                      setCameraActive(false);
                      setCameraError(null);
                      initCamera();
                    }
                  }}
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
