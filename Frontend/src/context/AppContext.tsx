// src/context/AppContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';
// Define the shape of your context data here
export interface Dustbin {
  _id: string;
  name: string;
  lat: number;
  lng: number;
  imageUrl: string;
  reportedBy: string;
  createdAt: string;
  __v: number;
}
interface response{
    success: boolean;
    
}

type AppContextType = {
  user?: any;
  setUser: (user: any) => void;
  dustbins: Dustbin[];
  setDustbins: (dustbins: Dustbin[]) => void;
  addDustbin: (dustbin: Dustbin) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<any>(null);
  const [dustbins, setDustbins] = useState<Dustbin[]>([]);

  const addDustbin = (dustbin: Dustbin) => {
    setDustbins(prev => [...prev, dustbin]);
  };

  

  return (
    <AppContext.Provider value={{ user, setUser, dustbins, setDustbins, addDustbin }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
