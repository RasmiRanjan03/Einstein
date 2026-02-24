import { useState, useEffect } from "react";
import { useAppContext } from "@/context/AppContext";
import { getCurrentPosition } from "@/lib/geolocation";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Plus, X, Trash2, Navigation, Info } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import GlassCard from "@/components/GlassCard";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const userLocationIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const selectedLocationIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Handles map click to pick location
const MapClickHandler = ({
  enabled,
  onLocationPick,
}: {
  enabled: boolean;
  onLocationPick: (lat: number, lng: number) => void;
}) => {
  useMapEvents({
    click(e) {
      if (enabled) {
        onLocationPick(e.latlng.lat, e.latlng.lng);
      }
    },
  });
  return null;
};

const DustbinLocator = () => {
  const { dustbins, addDustbin, fetchNearbyDustbins, loading, error } = useAppContext();
  const [selected, setSelected] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [addForm, setAddForm] = useState({ name: "", image: null });
  const [addLoading, setAddLoading] = useState(false);
  const [nearest, setNearest] = useState<any[]>([]);

  // New states for map-click location picking
  const [pickingLocation, setPickingLocation] = useState(false);
  const [pickedLocation, setPickedLocation] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    getCurrentPosition()
      .then(setUserLocation)
      .catch(() => setUserLocation({ lat: 20.132025, lng: 85.596907 }));
  }, []);

  const handleAddDustbinClick = () => {
    setPickingLocation(true);
    setPickedLocation(null);
    setShowAddForm(false);
  };

  const handleLocationPick = (lat: number, lng: number) => {
    setPickedLocation({ lat, lng });
    setPickingLocation(false);
    setShowAddForm(true);
  };

  const handleAddDustbin = async (e: React.FormEvent) => {
    e.preventDefault();
    const location = pickedLocation || userLocation;
    if (!addForm.name || !addForm.image || !location) return;
    setAddLoading(true);
    const formData = new FormData();
    formData.append("name", addForm.name);
    formData.append("lat", String(location.lat));
    formData.append("lng", String(location.lng));
    formData.append("image", addForm.image);
    formData.append("reportedBy", "Anonymous");
    await addDustbin(formData);
    setShowAddForm(false);
    setPickedLocation(null);
    setAddForm({ name: "", image: null });
    setAddLoading(false);
  };

  const handleFindNearest = async () => {
    if (!userLocation) return;
    const bins = await fetchNearbyDustbins(userLocation.lat, userLocation.lng);
    setNearest(bins);
  };

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
          onClick={handleAddDustbinClick}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Dustbin
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleFindNearest}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary text-secondary-foreground font-semibold text-sm ml-2"
        >
          <Navigation className="w-4 h-4" />
          Find Nearest
        </motion.button>
      </div>

      {/* Picking location banner */}
      <AnimatePresence>
        {pickingLocation && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 flex items-center justify-between px-5 py-3 rounded-xl bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 text-sm font-medium"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Click on the map to select the dustbin location
            </div>
            <button
              onClick={() => setPickingLocation(false)}
              className="text-yellow-400 hover:text-yellow-200"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid lg:grid-cols-3 gap-6">
        <GlassCard
          className={`lg:col-span-2 min-h-[400px] relative overflow-hidden ${pickingLocation ? "ring-2 ring-yellow-500 cursor-crosshair" : ""}`}
          hover={false}
        >
          <MapContainer
            center={userLocation ? [userLocation.lat, userLocation.lng] : [20.132025, 85.596907]}
            zoom={15}
            scrollWheelZoom={true}
            className="h-[400px] w-full rounded-xl z-0"
          >
            <TileLayer
              attribution="&copy; OpenStreetMap contributors"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {/* Map click handler */}
            <MapClickHandler enabled={pickingLocation} onLocationPick={handleLocationPick} />

            {/* User location marker */}
            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]} icon={userLocationIcon}>
                <Popup>You are here</Popup>
              </Marker>
            )}

            {/* Picked location marker (green) */}
            {pickedLocation && (
              <Marker position={[pickedLocation.lat, pickedLocation.lng]} icon={selectedLocationIcon}>
                <Popup>Selected dustbin location</Popup>
              </Marker>
            )}

            {/* Dustbin markers */}
            {(nearest.length > 0 ? nearest : dustbins).map((d) => (
              <Marker
                key={d._id}
                position={[d.lat, d.lng]}
                eventHandlers={{ click: () => setSelected(d._id) }}
              >
                <Popup>
                  <b>{d.name}</b>
                  <br />
                  <img src={d.imageUrl} alt={d.name} className="w-32 h-20 object-cover rounded mb-2" />
                  <br />
                  Reported by: {d.reportedBy}
                  <br />
                  {new Date(d.createdAt).toLocaleString()}
                  <br />
                  <button
                    className="mt-2 px-3 py-1 bg-primary text-primary-foreground rounded text-sm"
                    onClick={() =>
                      window.open(
                        `https://www.google.com/maps/dir/?api=1&origin=${userLocation?.lat},${userLocation?.lng}&destination=${d.lat},${d.lng}`,
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
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-foreground mb-3">
            {nearest.length > 0 ? "Nearest Dustbins" : "All Dustbins"}
          </h3>
          {(nearest.length > 0 ? nearest : dustbins).map((d, i) => (
            <motion.div
              key={d._id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <GlassCard
                className={`cursor-pointer ${selected === d._id ? "glow-primary" : ""}`}
                hover
                glowColor="secondary"
              >
                <div onClick={() => setSelected(d._id)} className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-muted/50">
                    <Trash2 className="w-4 h-4 text-secondary" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">{d.name}</div>
                    <div className="text-xs text-muted-foreground">Reported by {d.reportedBy}</div>
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
                <form className="space-y-4" onSubmit={handleAddDustbin}>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Name</label>
                    <input
                      className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      value={addForm.name}
                      onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Photo</label>
                    <input
                      type="file"
                      accept="image/*"
                      className="w-full"
                      onChange={e => setAddForm(f => ({ ...f, image: e.target.files?.[0] || null }))}
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-muted-foreground mb-1 block">Selected Location</label>
                    <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-lg px-3 py-2.5">
                      <MapPin className="w-4 h-4 text-green-500" />
                      <span className="text-sm text-muted-foreground">
                        {pickedLocation
                          ? `${pickedLocation.lat.toFixed(5)}, ${pickedLocation.lng.toFixed(5)}`
                          : "No location selected"}
                      </span>
                      {/* Allow re-picking */}
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddForm(false);
                          setPickingLocation(true);
                        }}
                        className="ml-auto text-xs text-primary underline"
                      >
                        Change
                      </button>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity"
                    disabled={addLoading || !pickedLocation}
                  >
                    {addLoading ? "Submitting..." : "Submit Report"}
                  </button>
                </form>
              </GlassCard>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
};

export default DustbinLocator;