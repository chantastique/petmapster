
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Camera, Map, UserRound } from 'lucide-react';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 animate-slide-up">
      <nav className="blur-backdrop border-t border-border/30 mx-4 mb-4 rounded-2xl shadow-lg">
        <div className="flex items-center justify-around h-16">
          <NavItem 
            to="/discover" 
            icon={<Map />} 
            label="Discover" 
            isActive={isActive('/discover')} 
          />
          
          <NavItem 
            to="/camera" 
            icon={<Camera />} 
            label="Camera" 
            isActive={isActive('/camera')}
            isPrimary
          />
          
          <NavItem 
            to="/profile" 
            icon={<UserRound />} 
            label="Profile" 
            isActive={isActive('/profile')} 
          />
        </div>
      </nav>
    </div>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  isPrimary?: boolean;
}

const NavItem = ({ to, icon, label, isActive, isPrimary }: NavItemProps) => {
  return (
    <Link 
      to={to} 
      className={cn(
        "flex flex-col items-center justify-center px-4 py-2 rounded-xl transition-all",
        isActive ? "text-pet-dark" : "text-muted-foreground",
        isPrimary ? "scale-110" : "",
        "hover:text-primary"
      )}
    >
      <div className={cn(
        "relative p-2 rounded-full transition-colors", 
        isActive ? "bg-pet-light text-pet-dark" : "bg-transparent",
        "hover:bg-muted/50"
      )}>
        {icon}
        {isActive && (
          <span className="absolute inset-0 rounded-full bg-pet-accent/10 animate-pulse-light" />
        )}
      </div>
      <span className={cn(
        "text-xs mt-1 font-medium", 
        isPrimary ? "text-pet-dark" : "",
        isActive ? "opacity-100" : "opacity-80"
      )}>
        {label}
      </span>
    </Link>
  );
};

export default Navbar;
