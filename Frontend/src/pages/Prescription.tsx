import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Pill, HeartPulse, TreePine, Leaf, Sparkles, Info } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import GlassCard from "@/components/GlassCard";

const prescriptions = [
  {
    category: "Health",
    icon: HeartPulse,
    glow: "primary" as const,
    items: [
      { title: "Hydration Plan", desc: "Increase water intake to 3.5L daily due to rising temperatures in your area." },
      { title: "Indoor Exercise", desc: "Shift workouts indoors between 11AM–4PM. UV index exceeds safe levels." },
    ],
  },
  {
    category: "Environment",
    icon: TreePine,
    glow: "secondary" as const,
    items: [
      { title: "Air Purification", desc: "Use HEPA air purifier indoors. AQI in your zone is moderate-poor." },
      { title: "Green Commute", desc: "Switch to cycling or public transport 3 days/week to reduce exposure and emissions." },
    ],
  },
  {
    category: "Sustainability",
    icon: Leaf,
    glow: "warning" as const,
    items: [
      { title: "Composting Plan", desc: "Start composting organic waste. Reduces landfill contribution by 40%." },
      { title: "Energy Optimization", desc: "Set AC to 24°C and use smart plugs to reduce energy consumption by 20%." },
    ],
  },
];

const Prescription = () => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2 flex items-center gap-3">
          <Sparkles className="w-7 h-7 text-primary" />
          AI Prescriptions
        </h1>
        <p className="text-muted-foreground">Personalized sustainable health and lifestyle recommendations</p>
      </div>

      {/* Details Button */}
      <motion.div className="mb-6">
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
                <h3 className="text-lg font-semibold text-foreground mb-4">Your Health Profile</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Allergies</label>
                    <input className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. Pollen, Dust" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Current Medications</label>
                    <input className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. Inhaler, Vitamins" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Activity Level</label>
                    <select className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                      <option>Sedentary</option>
                      <option>Lightly Active</option>
                      <option>Moderately Active</option>
                      <option>Very Active</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Health Goal</label>
                    <input className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. Reduce exposure risk" />
                  </div>
                </div>
                <button className="mt-4 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
                  Get Prescription
                </button>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="space-y-8">
        {prescriptions.map((cat, ci) => (
          <motion.div
            key={cat.category}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: ci * 0.15 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-muted/50">
                <cat.icon className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">{cat.category}</h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {cat.items.map((item, i) => (
                <GlassCard key={item.title} glowColor={cat.glow} delay={i * 0.1}>
                  <div className="flex items-start gap-3">
                    <Pill className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-semibold text-foreground mb-1">{item.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default Prescription;
