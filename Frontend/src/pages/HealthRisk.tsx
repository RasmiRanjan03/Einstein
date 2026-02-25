import { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { HeartPulse, Activity, Thermometer, Droplets, Wind, Shield, Info, Loader2, CheckCircle2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import GlassCard from "@/components/GlassCard";
import CircularProgress from "@/components/CircularProgress";

const HealthRisk = () => {
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // 1. State for all 11 required AI features
  const [formData, setFormData] = useState({
    age: "",
    gender: "1",
    bmi: "",
    systolic_bp: "",
    diastolic_bp: "",
    cholesterol: "",
    glucose: "",
    smoking: "0",
    physical_activity: "",
    aqi_exposure: "",
    heat_exposure: ""
  });

  // 2. State for AI Response
  const [results, setResults] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const analyzeRisk = async () => {
    setLoading(true);
    try {
      // Connecting to your Node backend Port 5000
      const response = await axios.post("http://localhost:5000/api/healths/predict", formData);
      setResults(response.data);
      setShowDetails(false); // Hide form on success to show results
    } catch (error) {
      console.error("Analysis Error:", error);
      alert("Failed to connect to Health AI. Ensure Node and FastAPI are running.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Mapping AI results to your UI cards
  // Fixed: Map results to the actual keys returned by your FastAPI
  const riskFactors = results ? [
    { 
        label: "Cardiovascular Risk", 
        value: results.cardiovascular_risk.probability * 100, 
        icon: HeartPulse, 
        color: "hsl(0, 77%, 62%)" 
    },
    { 
        label: "Respiratory Risk", 
        value: results.respiratory_risk.probability * 100, 
        icon: Wind, 
        color: "hsl(29, 100%, 50%)" 
    },
    { 
        label: "Heat Vulnerability", 
        value: results.heat_vulnerability.probability * 100, 
        icon: Thermometer, 
        color: "hsl(183, 100%, 50%)" 
    },
    { 
        label: "Physical Activity", 
        // Showing physical activity as a percentage of a "target" (e.g., 10 hrs/week)
        value: Math.min((parseFloat(formData.physical_activity) || 0) * 10, 100), 
        icon: Activity, 
        color: "hsl(158, 100%, 50%)" 
    }
  ] : [
    // Default static data for initial load
    { label: "Cardiovascular Risk", value: 0, icon: HeartPulse, color: "hsl(0, 77%, 62%)" },
    { label: "Respiratory Risk", value: 0, icon: Wind, color: "hsl(29, 100%, 50%)" },
    { label: "Heat Vulnerability", value: 0, icon: Thermometer, color: "hsl(183, 100%, 50%)" },
    { label: "Physical Activity", value: 0, icon: Activity, color: "hsl(158, 100%, 50%)" },
  ];

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Health Risk Assessment</h1>
        <p className="text-muted-foreground">AI-driven personal health risk analysis</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <GlassCard className="lg:col-span-1 flex flex-col items-center justify-center" hover={false}>
          <h3 className="text-lg font-semibold text-foreground mb-6">Overall Health Score</h3>
          <CircularProgress 
            // Fixed: Changed from * 1000 to * 100 for correct percentage scale
            value={results ? results.overall_health_score.score * 100 : 0} 
            label={results ? results.overall_health_score.level : "No Data"} 
            size={180} 
            color="hsl(183, 100%, 50%)" 
          />
          <div className="mt-6 flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary">
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium">{results ? results.overall_health_score.level : "Awaiting Analysis"}</span>
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
                  animate={{ width: `${f.value}%` }}
                  transition={{ duration: 1, delay: 0.2 + i * 0.1 }}
                />
              </div>
              <span className="text-xs text-muted-foreground">{Math.round(f.value)}%</span>
            </GlassCard>
          ))}
        </div>
      </div>

      <motion.div className="mt-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm"
        >
          <Info className="w-4 h-4" />
          {showDetails ? "Hide Form" : "Update Health Details"}
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
                <h3 className="text-lg font-semibold text-foreground mb-4">Enter Health Metrics</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Age</label>
                    <input name="age" type="number" onChange={handleInputChange} className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none" placeholder="e.g. 45" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Gender</label>
                    <select name="gender" onChange={handleInputChange} className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none">
                        <option value="1">Male</option>
                        <option value="0">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">BMI</label>
                    <input name="bmi" type="number" step="0.1" onChange={handleInputChange} className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none" placeholder="26.5" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Systolic BP</label>
                    <input name="systolic_bp" type="number" onChange={handleInputChange} className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none" placeholder="120" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Diastolic BP</label>
                    <input name="diastolic_bp" type="number" onChange={handleInputChange} className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none" placeholder="80" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Cholesterol</label>
                    <input name="cholesterol" type="number" onChange={handleInputChange} className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none" placeholder="mg/dL" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Glucose</label>
                    <input name="glucose" type="number" onChange={handleInputChange} className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none" placeholder="mg/dL" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Smoking</label>
                    <select name="smoking" onChange={handleInputChange} className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none">
                        <option value="0">Non-Smoker</option>
                        <option value="1">Smoker</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Physical Activity</label>
                    <input name="physical_activity" type="number" onChange={handleInputChange} className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none" placeholder="Hrs/Week" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">AQI Exposure</label>
                    <input name="aqi_exposure" type="number" onChange={handleInputChange} className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none" placeholder="Current AQI" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Heat Exposure</label>
                    <input name="heat_exposure" type="number" onChange={handleInputChange} className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:ring-1 focus:ring-primary outline-none" placeholder="Temp °C" />
                  </div>
                </div>
                
                <button 
                    disabled={loading}
                    onClick={analyzeRisk}
                    className="mt-6 flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Activity className="w-4 h-4" />}
                  {loading ? "AI Analyzing..." : "Run Health Diagnosis"}
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
            AI Health Recommendations
          </h3>
          <div className="space-y-3">
            {results ? (
                [
                    `Your cardio risk level is ${results.cardiovascular_risk.level}. Consider monitoring blood pressure.`,
                    `Respiratory vulnerability is ${results.respiratory_risk.level}. Avoid high AQI areas.`,
                    `Your heat vulnerability score is ${Math.round(results.heat_vulnerability.probability * 100)}%. Stay hydrated!`,
                    "Analysis complete: Recommendations updated based on your vitals."
                ].map((r, i) => (
                    <div key={i} className="flex items-start gap-3 py-2">
                      <CheckCircle2 className="w-4 h-4 text-primary mt-1 shrink-0" />
                      <p className="text-sm text-muted-foreground">{r}</p>
                    </div>
                ))
            ) : (
                ["Enter your health metrics above to generate personalized AI recommendations."].map((r, i) => (
                    <div key={i} className="flex items-start gap-3 py-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0" />
                      <p className="text-sm text-muted-foreground italic">{r}</p>
                    </div>
                ))
            )}
          </div>
        </GlassCard>
      </motion.div>
    </DashboardLayout>
  );
};

export default HealthRisk;