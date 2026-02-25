import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Building2, Navigation, Phone, Clock, Star } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import GlassCard from "@/components/GlassCard";

const hospitals = [
  { id: 1, name: "City General Hospital", distance: "0.8 km", type: "Government", rating: 4.2, phone: "+91-11-2345678", hours: "24/7", beds: 120 },
  { id: 2, name: "Apollo Clinic", distance: "1.2 km", type: "Private", rating: 4.5, phone: "+91-11-3456789", hours: "24/7", beds: 85 },
  { id: 3, name: "Green Park Medical Center", distance: "2.1 km", type: "Private", rating: 4.0, phone: "+91-11-4567890", hours: "8AM - 10PM", beds: 60 },
  { id: 4, name: "Community Health Center", distance: "2.8 km", type: "Government", rating: 3.8, phone: "+91-11-5678901", hours: "24/7", beds: 45 },
  { id: 5, name: "LifeCare Hospital", distance: "3.5 km", type: "Private", rating: 4.7, phone: "+91-11-6789012", hours: "24/7", beds: 200 },
];

const HospitalLocator = () => {
  const [selected, setSelected] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  const selectedHospital = hospitals.find((h) => h.id === selected);

  return (
    <DashboardLayout>
      <div className="mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Nearest Hospitals</h1>
          <p className="text-muted-foreground">Find hospitals and medical facilities near you</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map placeholder */}
        <GlassCard className="lg:col-span-2 min-h-[400px] relative overflow-hidden" hover={false}>
          <div className="absolute inset-0 bg-gradient-to-br from-muted/30 to-background rounded-xl">
            <div
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage:
                  "linear-gradient(hsl(183 100% 50% / 0.2) 1px, transparent 1px), linear-gradient(90deg, hsl(183 100% 50% / 0.2) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />
            {/* Hospital markers */}
            {hospitals.map((h, i) => (
              <motion.button
                key={h.id}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.1, type: "spring" }}
                onClick={() => setSelected(h.id)}
                className={`absolute p-2 rounded-full transition-all ${
                  selected === h.id ? "bg-primary glow-primary" : "bg-muted/80 hover:bg-primary/50"
                }`}
                style={{
                  left: `${12 + (i * 20) % 70}%`,
                  top: `${18 + (i * 25) % 55}%`,
                }}
              >
                <Building2 className="w-4 h-4 text-foreground" />
              </motion.button>
            ))}
            {/* User location */}
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
          <h3 className="text-lg font-semibold text-foreground mb-3">Nearby Hospitals</h3>
          {hospitals.map((h, i) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <GlassCard
                className={`cursor-pointer ${selected === h.id ? "glow-primary" : ""}`}
                hover
                glowColor="primary"
              >
                <div onClick={() => setSelected(h.id)} className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted/50">
                    <Building2 className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">{h.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {h.distance} away · {h.type}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 text-warning fill-warning" />
                    <span className="text-xs text-muted-foreground">{h.rating}</span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Selected hospital details popup */}
      <AnimatePresence>
        {selectedHospital && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-6"
          >
            <GlassCard hover={false} glowColor="primary">
              <h3 className="text-lg font-semibold text-foreground mb-4">{selectedHospital.name}</h3>
              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">{selectedHospital.distance}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">{selectedHospital.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">{selectedHospital.hours}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">{selectedHospital.beds} beds available</span>
                </div>
              </div>

              {/* Details toggle */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowDetails(!showDetails)}
                className="mt-4 px-5 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
              >
                {showDetails ? "Hide Details" : "Details"}
              </motion.button>

              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 space-y-3 overflow-hidden"
                  >
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Patient Name</label>
                      <input className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Enter your name" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Reason for Visit</label>
                      <input className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" placeholder="Describe your condition" />
                    </div>
                    <div>
                      <label className="text-xs text-muted-foreground mb-1 block">Preferred Time</label>
                      <input type="time" className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                    <button className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity">
                      Book Appointment
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default HospitalLocator;
