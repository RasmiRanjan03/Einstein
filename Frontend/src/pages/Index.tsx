import { Suspense, lazy } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  HeartPulse,
  TreePine,
  Footprints,
  MapPin,
  Pill,
  Shield,
  Zap,
  Globe,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import ParticleBackground from "@/components/ParticleBackground";
import GlassCard from "@/components/GlassCard";

const Earth3D = lazy(() => import("@/components/Earth3D"));

const features = [
  { icon: HeartPulse, title: "Health Risk Analysis", desc: "AI-powered personal health risk scoring based on climate data.", color: "primary" as const },
  { icon: TreePine, title: "Environmental Monitoring", desc: "Real-time environmental risk assessment for your location.", color: "secondary" as const },
  { icon: Footprints, title: "Carbon Footprint", desc: "Track and reduce your personal carbon impact on the planet.", color: "warning" as const },
  { icon: MapPin, title: "Dustbin Locator", desc: "Find and report nearby waste disposal points with AR mapping.", color: "secondary" as const },
  { icon: Pill, title: "AI Prescriptions", desc: "Personalized sustainable health and lifestyle recommendations.", color: "primary" as const },
  { icon: Shield, title: "Climate Alerts", desc: "Early warning system for climate-related health hazards.", color: "danger" as const },
];

const steps = [
  { num: "01", title: "Connect", desc: "Sign up and share your location and basic health data." },
  { num: "02", title: "Analyze", desc: "Our AI processes climate, air quality, and health data in real-time." },
  { num: "03", title: "Protect", desc: "Receive personalized recommendations to safeguard your health." },
  { num: "04", title: "Impact", desc: "Track your carbon footprint and contribute to planetary health." },
];

const Landing = () => {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <ParticleBackground />
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-12 items-center w-full">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative z-10"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-xs text-primary mb-6"
            >
              <Zap className="w-3 h-3" />
              AI-Powered Climate Health Platform
            </motion.div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-tight mb-6">
              <span className="text-gradient-primary neon-text">CLIMACARE</span>
              <br />
              <span className="text-foreground">AI</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-md mb-8 leading-relaxed">
              Protect Your Health. Protect Your Planet. AI-driven insights connecting climate data to personal wellness.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                to="/dashboard"
                className="px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
              >
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/dashboard"
                className="px-8 py-3.5 rounded-xl glass text-foreground font-semibold hover:bg-muted/30 transition-colors"
              >
                View Dashboard
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="relative h-[400px] lg:h-[500px]"
          >
            <Suspense
              fallback={
                <div className="w-full h-full flex items-center justify-center">
                  <Globe className="w-24 h-24 text-primary animate-pulse-glow" />
                </div>
              }
            >
              <Earth3D />
            </Suspense>
          </motion.div>
        </div>

        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <ChevronDown className="w-6 h-6 text-muted-foreground" />
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Powerful <span className="text-gradient-primary">Features</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              A comprehensive suite of tools connecting planetary health to personal wellness.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <GlassCard key={f.title} glowColor={f.color} delay={i * 0.1}>
                <f.icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                About <span className="text-gradient-primary">ClimaCare AI</span>
              </h2>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                ClimaCare AI bridges the gap between climate science and personal health. Using advanced machine learning, 
                we analyze real-time environmental data — air quality, UV levels, temperature extremes — and translate them 
                into actionable health insights.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Our mission is to empower every individual to understand how their environment affects their health while 
                reducing their carbon footprint and contributing to a sustainable future.
              </p>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-2 gap-4"
            >
              {[
                { val: "98%", label: "Accuracy Rate" },
                { val: "50K+", label: "Active Users" },
                { val: "120+", label: "Cities Covered" },
                { val: "24/7", label: "Real-time Data" },
              ].map((s, i) => (
                <GlassCard key={s.label} delay={i * 0.1} className="text-center">
                  <div className="text-3xl font-bold text-gradient-primary mb-1">{s.val}</div>
                  <div className="text-sm text-muted-foreground">{s.label}</div>
                </GlassCard>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              How It <span className="text-gradient-primary">Works</span>
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <GlassCard key={s.num} delay={i * 0.15}>
                <div className="text-4xl font-extrabold text-gradient-primary mb-4 opacity-60">{s.num}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </GlassCard>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-gradient-primary font-bold text-lg">CLIMACARE AI</span>
          <p className="text-sm text-muted-foreground">
            © 2026 ClimaCare AI. Protecting health. Protecting the planet.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
