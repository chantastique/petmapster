
import React from 'react';
import { X, Cat, Dog, Sparkles, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface PetDetailsFormProps {
  capturedImage: string;
  petType: 'cat' | 'dog' | 'other';
  petName: string;
  petDescription: string;
  petRating: number;
  onTypeChange: (type: 'cat' | 'dog' | 'other') => void;
  onNameChange: (name: string) => void;
  onDescriptionChange: (description: string) => void;
  onRatingChange: (rating: number) => void;
  onRetake: () => void;
  onSubmit: () => void;
}

const PetDetailsForm: React.FC<PetDetailsFormProps> = ({
  capturedImage,
  petType,
  petName,
  petDescription,
  petRating,
  onTypeChange,
  onNameChange,
  onDescriptionChange,
  onRatingChange,
  onRetake,
  onSubmit
}) => {
  const renderRatingStars = () => {
    return (
      <div className="flex items-center justify-center gap-2 my-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onRatingChange(star)}
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
          onClick={onRetake}
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
              onClick={() => onTypeChange('cat')}
              className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
                petType === 'cat' ? 'pet-gradient' : 'bg-muted text-muted-foreground'
              }`}
            >
              <Cat className={`w-5 h-5 ${petType === 'cat' ? 'text-white' : ''}`} />
              <span>Cat</span>
            </button>
            <button
              type="button"
              onClick={() => onTypeChange('dog')}
              className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all ${
                petType === 'dog' ? 'pet-gradient' : 'bg-muted text-muted-foreground'
              }`}
            >
              <Dog className={`w-5 h-5 ${petType === 'dog' ? 'text-white' : ''}`} />
              <span>Dog</span>
            </button>
            <button
              type="button"
              onClick={() => onTypeChange('other')}
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
            onChange={(e) => onNameChange(e.target.value)}
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
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder="Share what you noticed about this pet..."
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-border bg-background/80 focus:outline-none focus:ring-2 focus:ring-pet-accent"
          />
        </div>
        
        <button
          onClick={onSubmit}
          className="w-full pet-gradient py-3 px-6 rounded-xl flex items-center justify-center gap-2 shadow-sm hover:shadow transition-all"
        >
          <Check className="w-5 h-5" />
          <span>Add to Map</span>
        </button>
      </div>
    </motion.div>
  );
};

export default PetDetailsForm;
