import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ArrowRight, Zap } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAppContext } from '@/context/AppContext';
import { toast } from 'sonner';
import ParticleBackground from '@/components/ParticleBackground';
import Navbar from '@/components/Navbar';

const SigninPage = () => {
  const { login } = useAppContext();
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
    setAuthLoading(true);
    await login(email, password);
    setAuthLoading(false);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col">
      <ParticleBackground />
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-12 items-center">

          {/* Left Side - Branding */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="hidden lg:flex flex-col gap-6"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs text-primary w-fit"
            >
              <Zap className="w-3 h-3" />
              AI-Powered Climate Health Platform
            </motion.div>

            <h1 className="text-5xl font-extrabold leading-tight">
              <span className="text-gradient-primary neon-text">CLIMACARE</span>
              <br />
              <span className="text-foreground">AI</span>
            </h1>

            <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
              Protect Your Health. Protect Your Planet. AI-driven insights connecting climate data to personal wellness.
            </p>

            <div className="grid grid-cols-2 gap-4 mt-4">
              {[
                { val: "98%", label: "Accuracy Rate" },
                { val: "50K+", label: "Active Users" },
                { val: "120+", label: "Cities Covered" },
                { val: "24/7", label: "Real-time Data" },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="glass rounded-xl p-4 text-center"
                >
                  <div className="text-2xl font-bold text-gradient-primary mb-1">{s.val}</div>
                  <div className="text-xs text-muted-foreground">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Side - Form */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="glass rounded-2xl p-8 border border-border">
              {/* Header */}
              <div className="mb-8">
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full glass text-xs text-primary mb-4"
                >
                  <Zap className="w-3 h-3" />
                  Welcome Back
                </motion.div>
                <h2 className="text-3xl font-extrabold text-foreground">Sign In</h2>
                <p className="text-muted-foreground mt-1">Access your dashboard and make an impact</p>
              </div>

              {/* Error */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-center gap-3"
                >
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </motion.div>
              )}

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-5">
                {/* Email */}
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground block">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full bg-muted/50 border border-border rounded-xl py-3 pl-11 pr-4 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground block">
                      Password
                    </label>
                    <Link to="/forgot-password" className="text-xs text-primary hover:opacity-80 transition-opacity font-medium">
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••"
                      required
                      className="w-full bg-muted/50 border border-border rounded-xl py-3 pl-11 pr-11 text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Submit */}
                <motion.button
                  type="submit"
                  disabled={authLoading}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-2 px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {authLoading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /><span>Signing In...</span></>
                  ) : (
                    <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>
                  )}
                </motion.button>
              </form>

              <p className="text-center mt-6 text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/signup" className="text-primary font-semibold hover:opacity-80 transition-opacity">
                  Create one
                </Link>
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SigninPage;