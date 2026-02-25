import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Building2, Navigation, Phone, Clock, Star, X } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { getCurrentPosition } from "@/lib/geolocation";
import DashboardLayout from "@/components/DashboardLayout";
import GlassCard from "@/components/GlassCard";
import { useAppContext } from "@/context/AppContext";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const userLocationIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const hospitalIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-blue.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const HospitalLocator = () => {
  // ✅ useAppContext inside component
  const { hospitals, fetchNearbyHospitals, loading } = useAppContext();

  const [selected, setSelected] = useState<number | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    getCurrentPosition()
      .then(setUserLocation)
      .catch(() => setUserLocation({ lat: 20.132025, lng: 85.596907 }));
  }, []);

  // ✅ Find nearest hospitals using user location
  const handleFindNearest = async () => {
    if (!userLocation) return;
    await fetchNearbyHospitals(userLocation.lat, userLocation.lng, 10000);
  };

  // ✅ API returns `lon` not `lng`
  const selectedHospital = hospitals.find((h) => h.id === selected);

  return (
    <DashboardLayout>
      <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Nearest Hospitals</h1>
          <p className="text-muted-foreground">Find hospitals and medical facilities near you</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleFindNearest}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm disabled:opacity-50"
        >
          <Navigation className="w-4 h-4" />
          {loading ? "Searching..." : "Find Nearest"}
        </motion.button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Map */}
        <GlassCard className="lg:col-span-2 min-h-[400px] relative overflow-hidden" hover={false}>
          <MapContainer
            center={userLocation ? [userLocation.lat, userLocation.lng] : [20.132025, 85.596907]}
            zoom={14}
            scrollWheelZoom={true}
            className="h-[400px] w-full rounded-xl z-0"
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* User location marker */}
            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
                <Popup>You are here</Popup>
              </Marker>
            )}

            {/* Hospital markers — API uses `lon` */}
            {hospitals.map((h) => (
              <Marker
                key={h.id}
                position={[h.lat, h.lon]}
                icon={hospitalIcon}
                eventHandlers={{ click: () => setSelected(h.id) }}
              >
                <Popup>
                  <b>{h.name}</b><br />
                  📍 {h.address}<br />
                  📞 {h.phone}<br />
                  <button
                    className="mt-2 px-3 py-1 bg-primary text-primary-foreground rounded text-sm"
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps/dir/?api=1&origin=${userLocation?.lat},${userLocation?.lng}&destination=${h.lat},${h.lon}`,
                        "_blank"
                      )
                    }
                  >
                    Get Direction
                  </button>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </GlassCard>

        {/* List */}
        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          <h3 className="text-lg font-semibold text-foreground mb-3">
            {hospitals.length > 0 ? `${hospitals.length} Hospitals Found` : "All Hospitals"}
          </h3>
          {hospitals.length === 0 && (
            <p className="text-sm text-muted-foreground">Click "Find Nearest" to load hospitals near you.</p>
          )}
          {hospitals.map((h, i) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
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
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">{h.name}</div>
                    <div className="text-xs text-muted-foreground truncate">{h.address}</div>
                  </div>
                  <MapPin className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Selected hospital details */}
      <AnimatePresence>
        {selectedHospital && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="mt-6"
          >
            <GlassCard hover={false} glowColor="primary">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-foreground">{selectedHospital.name}</h3>
                <button onClick={() => { setSelected(null); setShowDetails(false); }} className="text-muted-foreground hover:text-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm text-muted-foreground">{selectedHospital.address}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm text-muted-foreground">{selectedHospital.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm text-muted-foreground">24/7</span>
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowDetails(!showDetails)}
                  className="px-5 py-2 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
                >
                  {showDetails ? "Hide Details" : "Book Appointment"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&origin=${userLocation?.lat},${userLocation?.lng}&destination=${selectedHospital.lat},${selectedHospital.lon}`,
                      "_blank"
                    )
                  }
                  className="flex items-center gap-2 px-5 py-2 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm"
                >
                  <Navigation className="w-4 h-4" />
                  Get Direction
                </motion.button>
              </div>

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