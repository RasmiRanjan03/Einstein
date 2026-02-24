// src/context/AppContext.tsx
import React, { createContext, useContext, useState, ReactNode } from 'react';
import axios from 'axios';
import { useEffect } from 'react';
import { toast } from '@/components/ui/sonner';
import { set } from 'date-fns';
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
  token: boolean;
  login: (email: string, password: string) => Promise<void>;

  user?: any;
  setUser: (user: any) => void;

  dustbins: Dustbin[];
  setDustbins: (dustbins: Dustbin[]) => void;

  addDustbin: (form: FormData) => Promise<any>;
  fetchAllDustbins: () => Promise<void>;

  fetchNearbyDustbins: (lat: number, lng: number) => Promise<Dustbin[]>;

  location: { lat: number; lng: number } | null;

  loading: boolean;
  error: string;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [token, settoken] = useState(false)
    const [location, setLocation] = useState<{
  lat: number;
  lng: number;
} | null>(null);
  const [user, setUser] = useState<any>(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [dustbins, setDustbins] = useState<Dustbin[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const getCurrentLocation = () => {
  if (!navigator.geolocation) {
    setError("Geolocation not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      setLocation({ lat, lng });

      console.log("User Location:", lat, lng);
    },
    (error) => {
      setError(error.message);
    },
    {
      enableHighAccuracy: true,
    }
  );
};
  const login=async (email:string,password:string)=>{
    try{
        const {data} = await axios.post(`${API_URL}/api/auth/login`, { email, password },{withCredentials: true});
        if (data.status === 'success') {
            console.log("Login successful:", data);
            settoken(true)
            setUser(data.data.user);
            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
        }
       console.log(token)
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  }

  const fetchAllDustbins = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.get("http://localhost:5000/api/dustbins");
      setDustbins(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch dustbins');
    } finally {
      setLoading(false);
    }
  };

  const fetchNearbyDustbins = async (lat: number, lng: number) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API_URL}/api/dustbins/get-bin`, { lat, lng });
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch nearby dustbins');
      return [];
    } finally {
      setLoading(false);
    }
  };

  const addDustbin = async (form: FormData) => {
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${API_URL}/api/dustbins/add`, form, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data',
      }});
      if (res.data?.data){
        setDustbins(prev => [res.data.data, ...prev]);
        return res.data;
      } else{
        console.log(res.data)
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add dustbin');
      return { status: 'error', message: error };
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchAllDustbins();
  }, []);
useEffect(() => {
  getCurrentLocation();
}, []);
  // Keep user in sync with localStorage
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
    }
  }, [user]);

  return (
    <AppContext.Provider
  value={{
    token,
    login,
    user,
    setUser,
    dustbins,
    setDustbins,
    addDustbin,
    fetchAllDustbins,
    fetchNearbyDustbins,
    location,
    loading,
    error,
  }}
>
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
