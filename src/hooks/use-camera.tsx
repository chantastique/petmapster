import { useState, useRef, useCallback, useEffect } from 'react';
import { toast } from '@/hooks/use-toast';

interface UseCameraOptions {
  onCameraReady?: () => void;
}

export const useCamera = ({ onCameraReady }: UseCameraOptions = {}) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);

  // Refs
  const isMountedRef = useRef(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const initTimeoutRef = useRef<number | null>(null);

  // Cleanup function to stop camera when component unmounts
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      try {
        const tracks = streamRef.current.getTracks();
        tracks.forEach(track => track.stop());
        streamRef.current = null;
        console.log("Camera stopped, tracks closed");
      } catch (error) {
        console.error('Error stopping camera:', error);
      }
    }
    
    if (videoRef.current) {
      try {
        videoRef.current.srcObject = null;
        console.log("Video element source cleared");
      } catch (error) {
        console.error('Error clearing video source:', error);
      }
    }
    
    // Only update state if still mounted
    if (isMountedRef.current) {
      setIsVideoReady(false);
      setCameraActive(false);
    }
  }, []);

  // Start camera with the given video element
  const startCamera = async (videoElement: HTMLVideoElement) => {
    // Verify component is mounted before proceeding
    if (!isMountedRef.current) {
      console.log("Component not mounted, aborting startCamera");
      return false;
    }
    
    // Clear any previous errors
    if (isMountedRef.current) {
      setCameraError(null);
    }
    
    console.log("Starting camera with video element:", videoElement);
    
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
      
      // Attach stream to video element
      try {
        videoElement.srcObject = stream;
        console.log("Stream attached to video element:", videoElement);
        
        // Set up event handlers for video loading
        return new Promise<boolean>((resolve) => {
          const handleCanPlay = () => {
            videoElement.removeEventListener('canplay', handleCanPlay);
            videoElement.removeEventListener('error', handleError);
            
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
            videoElement.removeEventListener('canplay', handleCanPlay);
            videoElement.removeEventListener('error', handleError);
            
            if (isMountedRef.current) {
              setCameraError('Failed to load video stream');
              setIsVideoReady(false);
              setCameraActive(false);
            }
            resolve(false);
          };
          
          // If already ready
          if (videoElement.readyState >= 3) { // HAVE_FUTURE_DATA or higher
            if (isMountedRef.current) {
              setIsVideoReady(true);
              setCameraActive(true);
              console.log('Video ready immediately');
            }
            resolve(true);
            return;
          }
          
          // Otherwise wait for canplay event
          videoElement.addEventListener('canplay', handleCanPlay);
          videoElement.addEventListener('error', handleError);
          
          // Start playing
          videoElement.play().catch(error => {
            console.error('Error playing video:', error);
            handleError();
          });
          
          // Set a timeout to resolve if canplay doesn't fire
          setTimeout(() => {
            if (isMountedRef.current && videoElement.readyState >= 2) { // At least HAVE_CURRENT_DATA
              console.log('Forcing camera ready after timeout');
              handleCanPlay();
            } else if (isMountedRef.current) {
              console.log('Camera failed to initialize within timeout');
              handleError();
            }
          }, 7000); // Increased timeout for slower devices
        });
      } catch (error) {
        console.error("Error attaching stream to video element:", error);
        throw error;
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

  // Initialize camera
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
      
      console.log("Camera initialization started");
      
      // Ensure there's enough time for React to render the video element
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if still mounted
      if (!isMountedRef.current) {
        console.log("Component unmounted during initialization delay");
        return;
      }
      
      // Ensure video element is available
      if (!videoRef.current) {
        console.error("Video element ref not available after delay", videoRef);
        
        // Try to create a video element programmatically if the ref is not available
        const tempVideo = document.createElement('video');
        tempVideo.autoplay = true;
        tempVideo.playsInline = true;
        tempVideo.muted = true;
        
        console.log("Created temporary video element:", tempVideo);
        
        // Check if component is still mounted
        if (!isMountedRef.current) return;
        
        if (isMountedRef.current) {
          setCameraError("Camera initialization issue - using fallback video element");
          
          // Use the temporary video element instead
          const success = await startCamera(tempVideo);
          
          if (success && onCameraReady && isMountedRef.current) {
            onCameraReady();
          }
        }
        return;
      }
      
      console.log("Starting camera with video element:", videoRef.current);
      
      // Start camera with the available video element
      const success = await startCamera(videoRef.current);
      
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

  // Capture image
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
        toast({
          title: "Photo captured",
          description: "You can now add details about this pet"
        });
        return imageDataURL;
      }
    } else {
      toast({
        variant: "destructive",
        title: "Could not capture image",
        description: "Camera is not properly initialized"
      });
      return null;
    }
  };

  // Effect to manage mounting/unmounting
  useEffect(() => {
    isMountedRef.current = true;
    
    return () => {
      isMountedRef.current = false;
      
      // Clear any pending timeouts
      if (initTimeoutRef.current) {
        window.clearTimeout(initTimeoutRef.current);
        initTimeoutRef.current = null;
      }
      
      stopCamera();
    };
  }, [stopCamera]);

  return {
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
  };
};
