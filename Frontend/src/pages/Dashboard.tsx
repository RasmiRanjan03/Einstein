import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  HeartPulse,
  TreePine,
  Footprints,
  AlertTriangle,
  Pill,
  Activity,
  TrendingUp,
  TrendingDown,
  Info,
} from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import GlassCard from "@/components/GlassCard";

const metrics = [
  {
    title: "Health Risk Score",
    value: "72",
    unit: "/100",
    change: "+3%",
    trend: "up" as const,
    icon: HeartPulse,
    glow: "primary" as const,
    desc: "Low-moderate risk",
  },
  {
    title: "Environmental Risk",
    value: "45",
    unit: "/100",
    change: "-8%",
    trend: "down" as const,
    icon: TreePine,
    glow: "secondary" as const,
    desc: "Air quality: Good",
  },
  {
    title: "Carbon Footprint",
    value: "2.4",
    unit: " tons",
    change: "-12%",
    trend: "down" as const,
    icon: Footprints,
    glow: "warning" as const,
    desc: "Below average",
  },
  {
    title: "Climate Alert",
    value: "2",
    unit: " active",
    change: "+1",
    trend: "up" as const,
    icon: AlertTriangle,
    glow: "danger" as const,
    desc: "Heat advisory",
  },
  {
    title: "AI Prescription",
    value: "5",
    unit: " active",
    change: "New",
    trend: "up" as const,
    icon: Pill,
    glow: "primary" as const,
    desc: "Updated today",
  },
];

const Dashboard = () => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Your climate-adaptive health overview</p>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {metrics.map((m, i) => (
          <GlassCard key={m.title} glowColor={m.glow} delay={i * 0.1}>
            <div className="flex items-start justify-between mb-4">
              <div className="p-2.5 rounded-lg bg-muted/50">
                <m.icon className="w-5 h-5 text-primary" />
              </div>
              <span className={`flex items-center gap-1 text-xs font-medium ${
                m.trend === "down" ? "text-secondary" : m.glow === "danger" ? "text-destructive" : "text-primary"
              }`}>
                {m.trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {m.change}
              </span>
            </div>
            <div className="text-3xl font-bold text-foreground mb-1">
              {m.value}
              <span className="text-lg text-muted-foreground font-normal">{m.unit}</span>
            </div>
            <div className="text-sm text-muted-foreground">{m.title}</div>
            <div className="mt-3 pt-3 border-t border-border/50">
              <div className="flex items-center gap-2">
                <Activity className="w-3 h-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{m.desc}</span>
              </div>
            </div>
          </GlassCard>
        ))}
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
                <h3 className="text-lg font-semibold text-foreground mb-4">Personal Information</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Full Name</label>
                    <input className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Enter your name" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Location</label>
                    <input className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Enter your city" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Age</label>
                    <input type="number" className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Enter age" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Health Conditions</label>
                    <input className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. Asthma" />
                  </div>
                </div>
                <button className="mt-4 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
                  Update Profile
                </button>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Quick Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="mt-8"
      >
        <GlassCard hover={false}>
          <h3 className="text-lg font-semibold text-foreground mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {[
              { text: "Health risk score updated", time: "2 min ago", icon: HeartPulse },
              { text: "New climate alert: Heat advisory", time: "15 min ago", icon: AlertTriangle },
              { text: "Carbon footprint reduced by 0.3 tons", time: "1 hour ago", icon: Footprints },
              { text: "New AI prescription available", time: "3 hours ago", icon: Pill },
            ].map((a, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-border/30 last:border-0">
                <div className="p-2 rounded-lg bg-muted/30">
                  <a.icon className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">{a.text}</p>
                  <p className="text-xs text-muted-foreground">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </DashboardLayout>
  );
};

export default Dashboard;
