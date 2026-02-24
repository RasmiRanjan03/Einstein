import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Footprints, Car, Zap, Utensils, ShoppingBag, TrendingDown, Info } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import GlassCard from "@/components/GlassCard";
import CircularProgress from "@/components/CircularProgress";

const categories = [
  { label: "Transport", value: 0.8, icon: Car, percent: 33 },
  { label: "Energy", value: 0.6, icon: Zap, percent: 25 },
  { label: "Food", value: 0.5, icon: Utensils, percent: 21 },
  { label: "Shopping", value: 0.5, icon: ShoppingBag, percent: 21 },
];

const CarbonFootprint = () => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Carbon Footprint</h1>
        <p className="text-muted-foreground">Track and reduce your environmental impact</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <GlassCard className="flex flex-col items-center justify-center" glowColor="warning" hover={false}>
          <h3 className="text-lg font-semibold text-foreground mb-6">Carbon Score</h3>
          <CircularProgress value={2.4} max={10} label="tons CO₂/yr" size={180} color="hsl(29, 100%, 50%)" />
          <div className="mt-6 flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 text-secondary">
            <TrendingDown className="w-4 h-4" />
            <span className="text-sm font-medium">Below Average</span>
          </div>
        </GlassCard>

        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          {categories.map((c, i) => (
            <GlassCard key={c.label} glowColor="warning" delay={i * 0.1}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-muted/50">
                  <c.icon className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">{c.label}</div>
                  <div className="text-xs text-muted-foreground">{c.value} tons CO₂</div>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 mb-2">
                <motion.div
                  className="h-2.5 rounded-full bg-warning"
                  style={{ boxShadow: "0 0 8px hsl(29, 100%, 50%)" }}
                  initial={{ width: 0 }}
                  whileInView={{ width: `${c.percent}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.2 + i * 0.1 }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{c.percent}% of total</span>
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
                <h3 className="text-lg font-semibold text-foreground mb-4">Enter Carbon Details</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Daily Commute (km)</label>
                    <input type="number" className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. 25" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Vehicle Type</label>
                    <select className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                      <option>Car (Petrol)</option>
                      <option>Car (Diesel)</option>
                      <option>Electric Vehicle</option>
                      <option>Public Transport</option>
                      <option>Bicycle/Walk</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Monthly Electricity (kWh)</label>
                    <input type="number" className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. 300" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Diet Type</label>
                    <select className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                      <option>Omnivore</option>
                      <option>Vegetarian</option>
                      <option>Vegan</option>
                    </select>
                  </div>
                </div>
                <button className="mt-4 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
                  Calculate Footprint
                </button>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="mt-8">
        <GlassCard hover={false}>
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <Footprints className="w-5 h-5 text-warning" />
            Reduction Tips
          </h3>
          <div className="space-y-3">
            {[
              "Switch to public transport 2 days/week to reduce transport emissions by 30%.",
              "Reduce meat consumption to 3 days/week — saves ~0.3 tons CO₂/year.",
              "Switch to LED bulbs and smart thermostats for 15% energy savings.",
              "Buy local produce to reduce food transport carbon footprint.",
            ].map((t, i) => (
              <div key={i} className="flex items-start gap-3 py-2">
                <div className="w-1.5 h-1.5 rounded-full bg-warning mt-2 shrink-0" />
                <p className="text-sm text-muted-foreground">{t}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </DashboardLayout>
  );
};

export default CarbonFootprint;
