
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, Map, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  
  // Redirect to discover page after 3 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/discover');
    }, 3000);
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-pet-light/30">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center px-4 max-w-sm"
      >
        <div className="mb-6 relative">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
            className="w-24 h-24 rounded-full pet-gradient flex items-center justify-center mx-auto shadow-lg"
          >
            <Camera className="w-12 h-12 text-white" />
          </motion.div>
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 200, damping: 15 }}
            className="absolute -right-4 top-0 w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center shadow-md text-white"
          >
            <Map className="w-6 h-6" />
          </motion.div>
          
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: 'spring', stiffness: 200, damping: 15 }}
            className="absolute -left-2 bottom-0 w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center shadow-md text-white"
          >
            <UserRound className="w-5 h-5" />
          </motion.div>
        </div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="text-4xl font-bold mb-3 bg-clip-text text-transparent pet-gradient"
        >
          PetMapster
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="text-muted-foreground mb-8"
        >
          Discover and share adorable pets spotted in windows around your city
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="flex justify-center"
        >
          <div className="relative">
            <div className="w-3 h-3 rounded-full bg-pet-accent absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-ping" />
            <div className="w-2 h-2 rounded-full bg-pet-accent absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Index;
