// src/context/AppContext.tsx
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import axios from 'axios';
import { toast } from '@/components/ui/sonner';

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

export interface Hospital {
  id: number;
  name: string;
  address: string;
  phone: string;
  lat: number;
  lon: number;
}

type AppContextType = {
  token: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  user?: any;
  setUser: (user: any) => void;
  dustbins: Dustbin[];
  setDustbins: (dustbins: Dustbin[]) => void;
  addDustbin: (form: FormData) => Promise<any>;
  fetchAllDustbins: () => Promise<void>;
  fetchNearbyDustbins: (lat: number, lng: number) => Promise<Dustbin[]>;
  hospitals: Hospital[];
  fetchAllHospitals: () => Promise<void>;
  fetchNearbyHospitals: (lat: number, lon: number, radius?: number) => Promise<Hospital[]>;
  location: { lat: number; lng: number } | null;
  loading: boolean;
  error: string;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

const getCookie = (name: string): string | null => {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
  const value = match ? decodeURIComponent(match[2]) : null;
  return value === 'undefined' ? null : value;
};

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [token, setToken] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [user, setUser] = useState<any>(() => {
    try {
      const stored = getCookie('user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [dustbins, setDustbins] = useState<Dustbin[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  axios.defaults.withCredentials = true;

  const getCurrentLocation = () => {
    if (!navigator.geolocation) { setError("Geolocation not supported"); return; }
    navigator.geolocation.getCurrentPosition(
      (position) => setLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
      (err) => setError(err.message),
      { enableHighAccuracy: true }
    );
  };

  const checkAuth = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/users/checkauth`, { withCredentials: true });
      if (res.data.status === 'success') {
        setToken(true);
        setUser(res.data.data.user);
      } else {
        setToken(false);
        setUser(null);
      }
    } catch {
      setToken(false);
      setUser(null);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data } = await axios.post(`${API_URL}/api/auth/login`, { email, password }, { withCredentials: true });
      if (data.status === 'success') {
        setToken(true);
        setUser(data.data.user);
        document.cookie = `user=${encodeURIComponent(JSON.stringify(data.data.user))}; path=/; max-age=${7 * 24 * 60 * 60}`;
        toast.success('Logged in successfully!');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  const logout = async () => {
    try { await axios.post(`${API_URL}/api/auth/logout`); } catch (_) {}
    document.cookie = 'token=; path=/; max-age=0';
    document.cookie = 'user=; path=/; max-age=0';
    setToken(false);
    setUser(null);
    toast.success('Logged out successfully!');
  };

  const fetchAllDustbins = async () => {
    setLoading(true); setError("");
    try {
      const res = await axios.get(`${API_URL}/api/dustbins`);
      setDustbins(res.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch dustbins');
    } finally { setLoading(false); }
  };

  const fetchNearbyDustbins = async (lat: number, lng: number): Promise<Dustbin[]> => {
    setLoading(true); setError("");
    try {
      const res = await axios.post(`${API_URL}/api/dustbins/get-bin`, { lat, lng });
      return res.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch nearby dustbins');
      return [];
    } finally { setLoading(false); }
  };

  const addDustbin = async (form: FormData) => {
    setLoading(true); setError("");
    try {
      const res = await axios.post(`${API_URL}/api/dustbins/add`, form, {
        withCredentials: true,
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (res.data?.data) {
        setDustbins(prev => [res.data.data, ...prev]);
        toast.success('Dustbin added successfully!');
        return res.data;
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to add dustbin';
      setError(msg);
      toast.error(msg);
    } finally { setLoading(false); }
  };

  // ✅ Fetch all hospitals in Bhubaneswar region
  const fetchAllHospitals = async () => {
    setLoading(true); setError("");
    try {
      const res = await axios.get(`${API_URL}/api/hospital/all-hospitals`);
      if (res.data.success) {
        setHospitals(res.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch hospitals');
    } finally { setLoading(false); }
  };

  // ✅ Fetch nearby hospitals by user location
  const fetchNearbyHospitals = async (lat: number, lon: number, radius = 10000): Promise<Hospital[]> => {
    setLoading(true); setError("");
    try {
      const res = await axios.get(`${API_URL}/api/hospital/nearby`, {
        params: { lat, lon, radius }
      });
      if (res.data.success) {
        setHospitals(res.data.data);
        return res.data.data;
      }
      return [];
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch nearby hospitals');
      return [];
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchAllDustbins(); }, []);
  useEffect(() => { getCurrentLocation(); }, []);
  useEffect(() => { checkAuth(); }, []);
  useEffect(() => { fetchAllHospitals(); }, []);

  useEffect(() => {
    if (user) {
      document.cookie = `user=${encodeURIComponent(JSON.stringify(user))}; path=/; max-age=${7 * 24 * 60 * 60}`;
    } else {
      document.cookie = 'user=; path=/; max-age=0';
    }
  }, [user]);

  return (
    <AppContext.Provider value={{
      token, login, logout,
      user, setUser,
      dustbins, setDustbins, addDustbin, fetchAllDustbins, fetchNearbyDustbins,
      hospitals, fetchAllHospitals, fetchNearbyHospitals,
      location, loading, error,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useAppContext must be used within an AppProvider');
  return context;
};