
import React, { useState, useRef, useEffect } from 'react';
import { Camera, X, Cat, Dog, Sparkles, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePetContext } from '@/context/PetContext';
import { Pet } from '@/types';

const CameraView: React.FC = () => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [petType, setPetType] = useState<'cat' | 'dog' | 'other'>('cat');
  const [petName, setPetName] = useState('');
  const [petDescription, setPetDescription] = useState('');
  const [petRating, setPetRating] = useState(5);
  const [step, setStep] = useState<'camera' | 'details' | 'location'>('camera');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const { addPet } = usePetContext();
  
  // Start camera when component mounts
  useEffect(() => {
    if (step === 'camera' && !capturedImage) {
      startCamera();
    }
    
    return () => {
      stopCamera();
    };
  }, [step, capturedImage]);
  
  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        },
        audio: false
      };
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
      }
    } catch (err) {
      console.error('Error accessing camera:', err);
      setCameraActive(false);
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
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageDataURL = canvas.toDataURL('image/jpeg');
        setCapturedImage(imageDataURL);
        stopCamera();
        setStep('details');
      }
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
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 border-2 border-white rounded-lg opacity-50" />
                </div>
                <div className="camera-controls">
                  <button onClick={captureImage} className="camera-button">
                    <span className="w-12 h-12 rounded-full bg-white" />
                  </button>
                </div>
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <div className="text-center p-4">
                  <Camera className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg font-medium mb-4">Camera access required</p>
                  <button
                    onClick={startCamera}
                    className="pet-gradient px-4 py-2 rounded-full"
                  >
                    Enable Camera
                  </button>
                </div>
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
