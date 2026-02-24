import React, { useState } from 'react';
import axios from 'axios';
import { Mail, Lock, User, Eye, EyeOff, ArrowRight, Loader2, Check, AlertCircle, Sparkles } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const SignupPage = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [validations, setValidations] = useState({
    length: false,
    uppercase: false,
    number: false,
    special: false,
  });

  const validatePassword = (pass) => {
    const newValidations = {
      length: pass.length >= 8,
      uppercase: /[A-Z]/.test(pass),
      number: /[0-9]/.test(pass),
      special: /[!@#$%^&*]/.test(pass),
    };
    setValidations(newValidations);
    setPasswordStrength(Object.values(newValidations).filter(Boolean).length);
    return newValidations;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    if (error) setError("");
    if (name === 'password') validatePassword(value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setAuthLoading(true);
    if (!formData.name || !formData.email || !formData.password) {
      setError("All fields are required");
      setAuthLoading(false);
      return;
    }
    if (!validations.length || !validations.uppercase || !validations.number) {
      setError("Password must contain 8+ characters, uppercase letter, and number");
      setAuthLoading(false);
      return;
    }
    try {
      const res = await axios.post(`${API_URL}/api/auth/signup`, formData);
      if (res.data.status === 'success') {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.data.user));
        navigate('/dashboard');
      } else {
        setError(res.data.message || 'Signup failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
    } finally {
      setAuthLoading(false);
    }
  };

  // ...existing animation and UI code from your sample...

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* ...existing animated background and grid code... */}
      <motion.div className="signup-container relative z-10 w-full max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-stretch">
          {/* ...existing left side graphics... */}
          <motion.div className="p-8 lg:p-12 rounded-3xl bg-gradient-to-br from-slate-800/50 to-purple-900/30 border border-purple-500/20 backdrop-blur-xl">
            <motion.div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={24} className="text-cyan-400" />
                <h2 className="text-3xl lg:text-4xl font-black text-white">Create Account</h2>
              </div>
              <p className="text-purple-300/70 font-medium">Join millions protecting our planet</p>
            </motion.div>
            {(error) && (
              <motion.div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm font-bold flex items-center gap-3 backdrop-blur-sm">
                <AlertCircle size={18} className="flex-shrink-0" />
                <span>{error}</span>
              </motion.div>
            )}
            <form onSubmit={handleSubmit} className="space-y-5">
              <motion.div className="form-input space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-purple-300/70 px-1 block">Full Name</label>
                <motion.div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400/50" size={20} />
                  <input type="text" name="name" value={formData.name} placeholder="John Doe" className="w-full bg-purple-950/30 border border-purple-500/20 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 focus:bg-purple-950/50 transition-all duration-300 text-white placeholder:text-purple-400/40 font-medium" onChange={handleChange} required />
                </motion.div>
              </motion.div>
              <motion.div className="form-input space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-purple-300/70 px-1 block">Email Address</label>
                <motion.div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400/50" size={20} />
                  <input type="email" name="email" value={formData.email} placeholder="you@company.com" className="w-full bg-purple-950/30 border border-purple-500/20 rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 focus:bg-purple-950/50 transition-all duration-300 text-white placeholder:text-purple-400/40 font-medium" onChange={handleChange} required />
                </motion.div>
              </motion.div>
              <motion.div className="form-input space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-purple-300/70 px-1 block">Password</label>
                <motion.div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400/50" size={20} />
                  <input type={showPassword ? "text" : "password"} name="password" value={formData.password} placeholder="••••••••••" className="w-full bg-purple-950/30 border border-purple-500/20 rounded-2xl py-4 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-cyan-400/50 focus:border-cyan-400/50 focus:bg-purple-950/50 transition-all duration-300 text-white placeholder:text-purple-400/40 font-medium" onChange={handleChange} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-400/50 hover:text-cyan-400 transition-colors duration-300">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                </motion.div>
                {formData.password && (
                  <motion.div className="space-y-3 mt-4 pt-4 border-t border-purple-500/20">
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <motion.div key={i} className="flex-1 h-1.5 rounded-full bg-purple-500/20" style={{ backgroundColor: i < passwordStrength ? '#22c55e' : undefined }} />
                      ))}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {Object.entries(validations).map(([key, value]) => (
                        <motion.div key={key} className={`flex items-center gap-2 ${value ? 'text-cyan-400' : 'text-purple-400/50'}`}>
                          <motion.div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${value ? 'border-cyan-400 bg-cyan-400/10' : 'border-purple-400/30'}`}>{value && <Check size={12} className="text-cyan-400" />}</motion.div>
                          <span className="font-medium capitalize">{key === 'length' ? '8+ chars' : key === 'uppercase' ? 'Uppercase' : key === 'number' ? 'Number' : 'Special char'}</span>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </motion.div>
              <motion.button type="submit" disabled={authLoading} className="w-full mt-8 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-400 hover:to-purple-500 disabled:from-purple-900 disabled:to-purple-800 disabled:cursor-not-allowed text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-xl shadow-purple-600/50 group relative overflow-hidden">
                {authLoading ? (<><Loader2 className="animate-spin" size={20} /><span>Creating Account...</span></>) : (<><span>Create Account</span><ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" /></>)}
              </motion.button>
            </form>
            <motion.p className="text-center mt-8 text-sm text-purple-300/70 font-medium">Already have an account?{' '}<Link to="/signin" className="text-cyan-400 font-bold hover:text-cyan-300 transition-colors duration-300">Sign In</Link></motion.p>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default SignupPage;
