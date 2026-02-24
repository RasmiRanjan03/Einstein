import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { TreePine, Wind, Thermometer, Droplets, Sun, CloudRain, AlertTriangle, Building2, Info } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import GlassCard from "@/components/GlassCard";
import CircularProgress from "@/components/CircularProgress";

const envMetrics = [
  { label: "AQI", value: "67", status: "Moderate", icon: Wind, color: "warning" as const },
  { label: "Temperature", value: "34°C", status: "Above Normal", icon: Thermometer, color: "danger" as const },
  { label: "Humidity", value: "62%", status: "Normal", icon: Droplets, color: "secondary" as const },
  { label: "UV Index", value: "7", status: "High", icon: Sun, color: "warning" as const },
];

const Environment = () => {
  const navigate = useNavigate();
  const [showDetails, setShowDetails] = useState(false);
  const [showRiskAlert, setShowRiskAlert] = useState(true);
  const riskScore = 45;
  const isHighRisk = riskScore > 40;

  return (
    <DashboardLayout>
      {/* High Risk Popup */}
      <AnimatePresence>
        {isHighRisk && showRiskAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onClick={() => navigate("/hospital")}
            className="mb-6 cursor-pointer"
          >
            <div className="flex items-center gap-3 px-5 py-4 rounded-xl border border-destructive/50 bg-destructive/10 backdrop-blur-sm hover:bg-destructive/20 transition-colors">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-destructive">⚠️ High Environmental Risk Detected!</p>
                <p className="text-xs text-muted-foreground mt-0.5">Temperature and UV levels are dangerously high. Click here to find nearest hospitals.</p>
              </div>
              <Building2 className="w-5 h-5 text-destructive shrink-0" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Environment Monitor</h1>
        <p className="text-muted-foreground">Real-time environmental conditions in your area</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <GlassCard className="flex flex-col items-center justify-center" hover={false}>
          <h3 className="text-lg font-semibold text-foreground mb-6">Environmental Risk</h3>
          <CircularProgress value={riskScore} label="Risk Score" size={180} color="hsl(158, 100%, 50%)" />
          <div className="mt-6 flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary">
            <TreePine className="w-4 h-4" />
            <span className="text-sm font-medium">{isHighRisk ? "Elevated Risk" : "Low Risk"}</span>
          </div>
        </GlassCard>

        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          {envMetrics.map((m, i) => (
            <GlassCard key={m.label} glowColor={m.color} delay={i * 0.1}>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-muted/50">
                  <m.icon className="w-5 h-5 text-primary" />
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  m.color === "danger" ? "bg-destructive/10 text-destructive" : 
                  m.color === "warning" ? "bg-warning/10 text-warning" : 
                  "bg-secondary/10 text-secondary"
                }`}>
                  {m.status}
                </span>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">{m.value}</div>
              <div className="text-sm text-muted-foreground">{m.label}</div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Details Button */}
      <motion.div className="mt-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
        >
          <Info className="w-4 h-4" />
          {showDetails ? "Hide Details" : "Details"}
        </motion.button>

        <AnimatePresence>
          {showDetails && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <GlassCard className="mt-4" hover={false}>
                <h3 className="text-lg font-semibold text-foreground mb-4">Enter Your Location Details</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">City</label>
                    <input className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Enter city" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Pin Code</label>
                    <input className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Enter pin code" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Latitude</label>
                    <input type="number" className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. 28.6139" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Longitude</label>
                    <input type="number" className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. 77.2090" />
                  </div>
                </div>
                <button className="mt-4 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
                  Update Location
                </button>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-8">
        <GlassCard hover={false}>
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <CloudRain className="w-5 h-5 text-primary" />
            7-Day Forecast
          </h3>
          <div className="grid grid-cols-7 gap-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => {
              const temps = [32, 34, 31, 29, 33, 35, 30];
              return (
                <motion.div
                  key={day}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  className="flex flex-col items-center gap-2 py-3 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <span className="text-xs text-muted-foreground">{day}</span>
                  <Sun className="w-4 h-4 text-warning" />
                  <span className="text-sm font-medium text-foreground">{temps[i]}°</span>
                </motion.div>
              );
            })}
          </div>
        </GlassCard>
      </motion.div>
    </DashboardLayout>
  );
};

export default Environment;
