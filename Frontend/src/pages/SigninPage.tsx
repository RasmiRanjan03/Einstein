import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowRight, Sparkles } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppContext } from '@/context/AppContext';
import { toast } from 'sonner';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SigninPage = () => {
  const { login } = useAppContext();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  

const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }
    login(email,password);
    
  };

  // ...existing animation and UI code from your sample...

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* ...existing animated background and grid code... */}
      <motion.div className="signin-container relative z-10 w-full max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* ...existing left side graphics... */}
          <motion.div className="p-8 lg:p-12 rounded-3xl bg-gradient-to-br from-slate-800/50 to-purple-900/30 border border-purple-500/20 backdrop-blur-xl">
            <motion.div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={24} className="text-cyan-400" />
                <h2 className="text-3xl lg:text-4xl font-black text-white">Sign In</h2>
              </div>
              <p className="text-purple-300/70 font-medium">Access your dashboard and make an impact</p>
            </motion.div>
            {(error) && (
              <motion.div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm font-bold flex items-center gap-3 backdrop-blur-sm">
                <AlertCircle size={18} className="flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
            <form onSubmit={handleLogin} className="space-y-5">
              <motion.div className="form-field space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-purple-300/70 px-1 block">Email Address</label>
                <motion.div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400/50" size={20} />
                  <input type="email" name="email" value={email} placeholder="you@company.com" className="w-full bg-purple-950/30 border border-purple-500/20 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 focus:bg-purple-950/50 transition-all duration-300 text-white placeholder:text-purple-400/40 font-medium" onChange={(e) => setEmail(e.target.value)   } required />
                </motion.div>
              </motion.div>
              <motion.div className="form-field space-y-2">
                <div className="flex items-center justify-between px-1">
                  <label className="text-xs font-bold uppercase tracking-widest text-purple-300/70 block">Password</label>
                  <Link to="/forgot-password" className="text-xs text-cyan-400 hover:text-cyan-300 font-bold transition-colors duration-300">Forgot?</Link>
                </div>
                <motion.div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400/50" size={20} />
                  <input type={showPassword ? "text" : "password"} name="password" value={password} placeholder="••••••••••" className="w-full bg-purple-950/30 border border-purple-500/20 rounded-2xl py-4 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 focus:bg-purple-950/50 transition-all duration-300 text-white placeholder:text-purple-400/40 font-medium" onChange={(e) => setPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400/50 hover:text-cyan-400 transition-colors duration-300">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                </motion.div>
              </motion.div>
              <motion.button type="submit" disabled={authLoading} className="w-full mt-8 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 disabled:from-purple-900 disabled:to-purple-800 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-xl shadow-purple-600/50 group relative overflow-hidden">
                {authLoading ? (<><Loader2 className="animate-spin" size={20} /><span>Signing In...</span></>) : (<><span>Sign In</span><ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" /></>)}
              </motion.button>
            </form>
            <motion.p className="text-center mt-8 text-sm text-purple-300/70 font-medium">Don't have an account?{' '}<Link to="/signup" className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors duration-300">Create one</Link></motion.p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default SigninPage;
