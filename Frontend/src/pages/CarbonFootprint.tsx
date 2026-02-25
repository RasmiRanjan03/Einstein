import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Footprints, Car, Zap, Utensils, ShoppingBag, TrendingDown, TrendingUp, Info, Leaf } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import GlassCard from "@/components/GlassCard";
import CircularProgress from "@/components/CircularProgress";
import axios from "axios";
import { toast } from "@/components/ui/sonner";

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const CarbonFootprint = () => {
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    annual_carbon_emission_kg: number;
    impact_level: string;
    sustainability_score: number;
  } | null>(null);

  const [form, setForm] = useState({
    privateVehicleKm: "",
    publicVehicleKm: "",
    electricityKwh: "",
    meatKg: "",
    dairyKg: "",
    vegKg: "",
    plasticWasteKg: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCalculate = async () => {
    const hasEmpty = Object.values(form).some(v => v === "");
    if (hasEmpty) {
      toast.error("Please fill in all fields");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        car_km_per_week: parseFloat(form.privateVehicleKm),
        public_transport_km: parseFloat(form.publicVehicleKm),
        electricity_kwh: parseFloat(form.electricityKwh),
        meat_meals_per_week: parseFloat(form.meatKg),
        dairy_consumption: parseFloat(form.dairyKg),
        veg_consumption: parseFloat(form.vegKg),
        plastic_waste_kg: parseFloat(form.plasticWasteKg),
      };

      const res = await axios.post(`${API_URL}/api/carbon/predict`, payload, {
        withCredentials: true,
      });

      console.log(res.data);
      setResult(res.data);
      toast.success("Carbon footprint calculated!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Calculation failed");
    } finally {
      setLoading(false);
    }
  };

  const isLowImpact = result?.impact_level?.includes("LOW");

  const categories = [
    { label: "Transport", icon: Car,       value: result ? (result.annual_carbon_emission_kg * 0.33).toFixed(1) : 0, percent: 33 },
    { label: "Energy",    icon: Zap,       value: result ? (result.annual_carbon_emission_kg * 0.25).toFixed(1) : 0, percent: 25 },
    { label: "Food",      icon: Utensils,  value: result ? (result.annual_carbon_emission_kg * 0.21).toFixed(1) : 0, percent: 21 },
    { label: "Waste",     icon: ShoppingBag, value: result ? (result.annual_carbon_emission_kg * 0.21).toFixed(1) : 0, percent: 21 },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Carbon Footprint</h1>
        <p className="text-muted-foreground">Track and reduce your environmental impact</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Carbon Score Card */}
        <GlassCard className="flex flex-col items-center justify-center" glowColor="warning" hover={false}>
          <h3 className="text-lg font-semibold text-foreground mb-6">Carbon Score</h3>
          <CircularProgress
            value={result ? result.annual_carbon_emission_kg : 0}
            max={10000}
            label="kg CO₂/yr"
            size={180}
            color="hsl(29, 100%, 50%)"
          />
          <div className="mt-4 text-center">
            <div className="text-2xl font-bold text-warning">
              {result ? `${result.annual_carbon_emission_kg} kg` : "0 kg"}
            </div>
            <div className="text-xs text-muted-foreground">Annual CO₂ Emission</div>
          </div>
          <div className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-full font-medium text-sm ${
            result
              ? (isLowImpact ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400")
              : "bg-muted/50 text-muted-foreground"
          }`}>
            {result
              ? (isLowImpact ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />)
              : <Info className="w-4 h-4" />
            }
            {result ? result.impact_level : "Not Calculated Yet"}
          </div>
        </GlassCard>

        {/* Right side */}
        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">

          {/* Sustainability Score */}
          <GlassCard glowColor="warning" className="sm:col-span-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-muted/50">
                  <Leaf className="w-5 h-5 text-green-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">Sustainability Score</div>
                  <div className="text-xs text-muted-foreground">Higher is better</div>
                </div>
              </div>
              <div className={`text-3xl font-bold ${result ? "text-green-400" : "text-muted-foreground"}`}>
                {result ? `${(result.sustainability_score * 100).toFixed(0)}%` : "0%"}
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5 mt-4">
              <motion.div
                className="h-2.5 rounded-full bg-green-400"
                style={{ boxShadow: result ? "0 0 8px #4ade80" : "none" }}
                initial={{ width: 0 }}
                animate={{ width: result ? `${result.sustainability_score * 100}%` : "0%" }}
                transition={{ duration: 1 }}
              />
            </div>
            {!result && (
              <p className="text-xs text-muted-foreground mt-2">Not Calculated Yet</p>
            )}
          </GlassCard>

          {/* Category breakdown */}
          {categories.map((c, i) => (
            <GlassCard key={c.label} glowColor="warning" delay={i * 0.1}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-muted/50">
                  <c.icon className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <div className="text-sm font-medium text-foreground">{c.label}</div>
                  <div className="text-xs text-muted-foreground">{c.value} kg CO₂</div>
                </div>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 mb-2">
                <motion.div
                  className="h-2.5 rounded-full bg-warning"
                  style={{ boxShadow: result ? "0 0 8px hsl(29, 100%, 50%)" : "none" }}
                  initial={{ width: 0 }}
                  animate={{ width: result ? `${c.percent}%` : "0%" }}
                  transition={{ duration: 1, delay: 0.2 + i * 0.1 }}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{c.percent}% of total</span>
                {!result && (
                  <span className="text-xs text-muted-foreground italic">Not Calculated Yet</span>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Details / Form */}
      <motion.div className="mt-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
        >
          <Info className="w-4 h-4" />
          {showDetails ? "Hide Details" : "Calculate My Footprint"}
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
                  {[
                    { label: "Weekly Commute in Private Vehicle (km)", name: "privateVehicleKm", placeholder: "e.g. 25" },
                    { label: "Weekly Commute in Public Vehicle (km)",  name: "publicVehicleKm",  placeholder: "e.g. 25" },
                    { label: "Monthly Electricity (kWh)",              name: "electricityKwh",   placeholder: "e.g. 300" },
                    { label: "Meat Consumption (meals/week)",          name: "meatKg",           placeholder: "e.g. 2" },
                    { label: "Dairy Consumption (kg/week)",            name: "dairyKg",          placeholder: "e.g. 3" },
                    { label: "Veg Consumption (kg/week)",              name: "vegKg",            placeholder: "e.g. 4" },
                    { label: "Plastic Waste (kg/week)",                name: "plasticWasteKg",   placeholder: "e.g. 1" },
                  ].map((field) => (
                    <div key={field.name}>
                      <label className="text-xs text-muted-foreground mb-1 block">{field.label}</label>
                      <input
                        type="number"
                        name={field.name}
                        value={form[field.name as keyof typeof form]}
                        onChange={handleChange}
                        placeholder={field.placeholder}
                        min="0"
                        className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                  ))}
                </div>
                <button
                  onClick={handleCalculate}
                  disabled={loading}
                  className="mt-4 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {loading ? "Calculating..." : "Calculate Footprint"}
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