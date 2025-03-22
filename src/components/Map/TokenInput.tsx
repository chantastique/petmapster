
import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface TokenInputProps {
  token: string;
  onTokenChange: (token: string) => void;
  onTokenSubmit: (e: React.FormEvent) => void;
}

export const TokenInput: React.FC<TokenInputProps> = ({
  token,
  onTokenChange,
  onTokenSubmit
}) => {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="glass-panel p-6 max-w-md w-full">
        <div className="flex items-center gap-2 text-amber-500 mb-4">
          <AlertCircle className="h-5 w-5" />
          <h3 className="font-medium">Mapbox Token Required</h3>
        </div>
        <p className="text-sm text-muted-foreground mb-4">
          Please enter your Mapbox public token to display the map. You can get one by creating an account at <a href="https://mapbox.com" target="_blank" rel="noreferrer" className="text-blue-500 underline">mapbox.com</a>.
        </p>
        <form onSubmit={onTokenSubmit} className="space-y-4">
          <Input 
            value={token}
            onChange={(e) => onTokenChange(e.target.value)}
            placeholder="Enter your Mapbox public token"
            className="w-full"
          />
          <Button type="submit" className="w-full">
            Load Map
          </Button>
        </form>
      </div>
    </div>
  );
};
