import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Plus, X, Trash2, Navigation, Info } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import GlassCard from "@/components/GlassCard";

const dustbins = [
  { id: 1, type: "Recyclable", distance: "120m", condition: "Good", lat: 28.6139, lng: 77.209 },
  { id: 2, type: "General Waste", distance: "350m", condition: "Fair", lat: 28.6145, lng: 77.2105 },
  { id: 3, type: "E-Waste", distance: "500m", condition: "New", lat: 28.6128, lng: 77.208 },
  { id: 4, type: "Organic", distance: "200m", condition: "Good", lat: 28.615, lng: 77.2115 },
  { id: 5, type: "Recyclable", distance: "750m", condition: "Needs Repair", lat: 28.611, lng: 77.207 },
];

const DustbinLocator = () => {
  const [selected, setSelected] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Dustbin Locator</h1>
          <p className="text-muted-foreground">Find and report nearby waste disposal points</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowAddForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Dustbin
        </motion.button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map placeholder */}
        <GlassCard className="lg:col-span-2 min-h-[400px] relative overflow-hidden" hover={false}>
          <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-background rounded-xl">
            <div className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: "linear-gradient(hsl(183 100% 50% / 0.2) 1px, transparent 1px), linear-gradient(90deg, hsl(183 100% 50% / 0.2) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            {dustbins.map((d, i) => (
              <motion.button
                key={d.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1, type: "spring" }}
                onClick={() => setSelected(d.id)}
                className={`absolute p-2 rounded-full transition-all ${
                  selected === d.id ? "bg-primary glow-primary" : "bg-muted/80 hover:bg-primary/50"
                }`}
                style={{
                  left: `${15 + (i * 18) % 70}%`,
                  top: `${20 + (i * 23) % 55}%`,
                }}
              >
                <Trash2 className="w-4 h-4 text-foreground" />
              </motion.button>
            ))}
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
            >
              <div className="relative">
                <div className="w-4 h-4 rounded-full bg-primary glow-primary" />
                <div className="absolute inset-0 rounded-full bg-primary/30 animate-ping" />
              </div>
            </motion.div>
          </div>
          <div className="absolute bottom-4 left-4 flex items-center gap-2 glass rounded-lg px-3 py-2">
            <Navigation className="w-4 h-4 text-primary" />
            <span className="text-xs text-foreground">Your Location</span>
          </div>
        </GlassCard>

        {/* List */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground mb-3">Nearby Dustbins</h3>
          {dustbins.map((d, i) => (
            <motion.div
              key={d.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <GlassCard
                className={`cursor-pointer ${selected === d.id ? "glow-primary" : ""}`}
                hover
                glowColor="secondary"
              >
                <div onClick={() => setSelected(d.id)} className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted/50">
                    <Trash2 className="w-4 h-4 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">{d.type}</div>
                    <div className="text-xs text-muted-foreground">{d.distance} away · {d.condition}</div>
                  </div>
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                </div>
              </GlassCard>
            </motion.div>
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
                <h3 className="text-lg font-semibold text-foreground mb-4">Search Filters</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Waste Type</label>
                    <select className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                      <option>All Types</option>
                      <option>Recyclable</option>
                      <option>General Waste</option>
                      <option>E-Waste</option>
                      <option>Organic</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Max Distance (m)</label>
                    <input type="number" className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="e.g. 500" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Condition</label>
                    <select className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                      <option>Any</option>
                      <option>New</option>
                      <option>Good</option>
                      <option>Fair</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Sort By</label>
                    <select className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                      <option>Distance</option>
                      <option>Condition</option>
                      <option>Type</option>
                    </select>
                  </div>
                </div>
                <button className="mt-4 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
                  Apply Filters
                </button>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Add Dustbin Modal */}
      <AnimatePresence>
        {showAddForm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddForm(false)}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md"
            >
              <GlassCard hover={false} className="glass-strong">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-foreground">Report New Dustbin</h3>
                  <button onClick={() => setShowAddForm(false)} className="text-muted-foreground hover:text-foreground">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Type</label>
                    <select className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                      <option>Recyclable</option>
                      <option>General Waste</option>
                      <option>E-Waste</option>
                      <option>Organic</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Condition</label>
                    <select className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                      <option>New</option>
                      <option>Good</option>
                      <option>Fair</option>
                      <option>Needs Repair</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Location</label>
                    <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-lg px-3 py-2.5">
                      <MapPin className="w-4 h-4 text-primary" />
                      <span className="text-sm text-muted-foreground">Use current location</span>
                    </div>
                  </div>
                  <button className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
                    Submit Report
                  </button>
                </div>
              </GlassCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default DustbinLocator;
