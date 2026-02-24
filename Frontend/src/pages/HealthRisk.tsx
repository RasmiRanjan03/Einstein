import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HeartPulse, Activity, Thermometer, Droplets, Wind, Shield, Info } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import GlassCard from "@/components/GlassCard";
import CircularProgress from "@/components/CircularProgress";

const riskFactors = [
  { label: "Air Quality Impact", value: 65, icon: Wind, color: "hsl(29, 100%, 50%)" },
  { label: "UV Exposure", value: 42, icon: Thermometer, color: "hsl(183, 100%, 50%)" },
  { label: "Hydration Level", value: 78, icon: Droplets, color: "hsl(158, 100%, 50%)" },
  { label: "Heat Stress", value: 35, icon: Activity, color: "hsl(0, 77%, 62%)" },
];

const HealthRisk = () => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Health Risk Assessment</h1>
        <p className="text-muted-foreground">AI-driven personal health risk analysis</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-1 flex flex-col items-center justify-center" hover={false}>
          <h3 className="text-lg font-semibold text-foreground mb-6">Overall Health Score</h3>
          <CircularProgress value={72} label="out of 100" size={180} color="hsl(183, 100%, 50%)" />
          <div className="mt-6 flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">Low-Moderate Risk</span>
          </div>
        </GlassCard>

        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          {riskFactors.map((f, i) => (
            <GlassCard key={f.label} delay={i * 0.1}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-muted/50">
                  <f.icon className="w-5 h-5 text-primary" />
                </div>
                <span className="text-sm font-medium text-foreground">{f.label}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 mb-2">
                <motion.div
                  className="h-2.5 rounded-full"
                  style={{ backgroundColor: f.color, boxShadow: `0 0 8px ${f.color}` }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${f.value}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.2 + i * 0.1 }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{f.value}%</span>
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
                <h3 className="text-lg font-semibold text-foreground mb-4">Enter Health Details</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Age</label>
                    <input type="number" className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Enter age" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Weight (kg)</label>
                    <input type="number" className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Enter weight" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Blood Pressure</label>
                    <input className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. 120/80" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Pre-existing Conditions</label>
                    <input className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. Asthma, Diabetes" />
                  </div>
                </div>
                <button className="mt-4 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
                  Analyze Risk
                </button>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-8">
        <GlassCard hover={false}>
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <HeartPulse className="w-5 h-5 text-primary" />
            Health Recommendations
          </h3>
          <div className="space-y-3">
            {[
              "Stay hydrated — drink at least 3L of water today due to high temperatures.",
              "Limit outdoor activity between 12 PM – 3 PM to reduce UV exposure.",
              "Consider wearing an N95 mask — AQI is above moderate levels.",
              "Schedule a health checkup — your risk trend has increased this month.",
            ].map((r, i) => (
              <div key={i} className="flex items-start gap-3 py-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                <p className="text-sm text-muted-foreground">{r}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </DashboardLayout>
  );
};

export default HealthRisk;
