import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { HeartPulse, Activity, Thermometer, Droplets, Wind, Shield, Info, Loader2, AlertCircle } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import GlassCard from "@/components/GlassCard";
import CircularProgress from "@/components/CircularProgress";

interface HealthData {
  age: number;
  gender: 'male' | 'female' | 'other';
  bmi: number;
  systolic_bp: number;
  diastolic_bp: number;
  cholesterol: number;
  glucose: number;
  smoking: 'never' | 'former' | 'current';
  physical_activity: 'low' | 'moderate' | 'high';
  aqi_exposure: number;
  heat_exposure: number;
}

interface RiskAssessment {
  overall_score: number;
  risk_level: 'low' | 'moderate' | 'high' | 'very_high';
  cardiovascular_risk: number;
  respiratory_risk: number;
  metabolic_risk: number;
  environmental_risk: number;
  recommendations: string[];
  key_factors: {
    factor: string;
    impact: 'positive' | 'negative';
    value: number;
  }[];
}

const HealthRisk = () => {
  const [showDetails, setShowDetails] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [assessment, setAssessment] = useState<RiskAssessment | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [healthData, setHealthData] = useState<HealthData>({
    age: 30,
    gender: 'male',
    bmi: 22.5,
    systolic_bp: 120,
    diastolic_bp: 80,
    cholesterol: 180,
    glucose: 90,
    smoking: 'never',
    physical_activity: 'moderate',
    aqi_exposure: 50,
    heat_exposure: 25
  });

  const handleInputChange = (field: keyof HealthData, value: any) => {
    setHealthData(prev => ({ ...prev, [field]: value }));
  };

  const analyzeRisk = async () => {
    setIsAnalyzing(true);
    setError(null);
    
    try {
      const response = await fetch('http://localhost:5002/api/health/assess-risk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(healthData),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze health risk');
      }

      const result = await response.json();
      setAssessment(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'hsl(158, 100%, 50%)';
      case 'moderate': return 'hsl(43, 100%, 50%)';
      case 'high': return 'hsl(29, 100%, 50%)';
      case 'very_high': return 'hsl(0, 77%, 62%)';
      default: return 'hsl(183, 100%, 50%)';
    }
  };

  const displayAssessment = assessment || {
    overall_score: 72,
    risk_level: 'moderate',
    cardiovascular_risk: 35,
    respiratory_risk: 42,
    metabolic_risk: 28,
    environmental_risk: 65,
    recommendations: [
      "Stay hydrated — drink at least 3L of water today due to high temperatures.",
      "Limit outdoor activity between 12 PM – 3 PM to reduce UV exposure.",
      "Consider wearing an N95 mask — AQI is above moderate levels.",
      "Schedule a health checkup — your risk trend has increased this month.",
    ],
    key_factors: [
      { factor: "Air Quality Impact", impact: "negative", value: 65 },
      { factor: "UV Exposure", impact: "negative", value: 42 },
      { factor: "Hydration Level", impact: "positive", value: 78 },
      { factor: "Heat Stress", impact: "negative", value: 35 },
    ]
  };

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
            value={displayAssessment.overall_score} 
            label="out of 100" 
            size={180} 
            color={getRiskColor(displayAssessment.risk_level)} 
          />
          <div className="mt-6 flex items-center gap-2 px-4 py-2 rounded-full" 
               style={{ backgroundColor: `${getRiskColor(displayAssessment.risk_level)}20`, color: getRiskColor(displayAssessment.risk_level) }}>
            <Shield className="w-4 h-4" />
            <span className="text-sm font-medium capitalize">
              {displayAssessment.risk_level.replace('_', '-')} Risk
            </span>
          </div>
        </GlassCard>

        <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
          {displayAssessment.key_factors.map((f, i) => (
            <GlassCard key={f.factor} delay={i * 0.1}>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-lg bg-muted/50">
                  {f.factor.includes("Air") && <Wind className="w-5 h-5 text-primary" />}
                  {f.factor.includes("UV") && <Thermometer className="w-5 h-5 text-primary" />}
                  {f.factor.includes("Hydration") && <Droplets className="w-5 h-5 text-primary" />}
                  {f.factor.includes("Heat") && <Activity className="w-5 h-5 text-primary" />}
                </div>
                <span className="text-sm font-medium text-foreground">{f.factor}</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5 mb-2">
                <motion.div
                  className="h-2.5 rounded-full"
                  style={{ 
                    backgroundColor: f.impact === 'positive' ? 'hsl(158, 100%, 50%)' : 'hsl(0, 77%, 62%)',
                    boxShadow: `0 0 8px ${f.impact === 'positive' ? 'hsl(158, 100%, 50%)' : 'hsl(0, 77%, 62%)'}`
                  }}
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
          {showDetails ? "Hide Details" : "Enter Health Data"}
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
                
                {error && (
                  <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <span className="text-sm text-red-500">{error}</span>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Age</label>
                    <input 
                      type="number" 
                      className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" 
                      placeholder="Enter age"
                      value={healthData.age}
                      onChange={(e) => handleInputChange('age', parseInt(e.target.value) || 0)}
                    />
                  </div>
                  
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Gender</label>
                    <select 
                      className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      value={healthData.gender}
                      onChange={(e) => handleInputChange('gender', e.target.value)}
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">BMI</label>
                    <input 
                      type="number" 
                      step="0.1"
                      className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" 
                      placeholder="Enter BMI"
                      value={healthData.bmi}
                      onChange={(e) => handleInputChange('bmi', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Systolic BP</label>
                    <input 
                      type="number" 
                      className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" 
                      placeholder="Systolic"
                      value={healthData.systolic_bp}
                      onChange={(e) => handleInputChange('systolic_bp', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Diastolic BP</label>
                    <input 
                      type="number" 
                      className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" 
                      placeholder="Diastolic"
                      value={healthData.diastolic_bp}
                      onChange={(e) => handleInputChange('diastolic_bp', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Cholesterol (mg/dL)</label>
                    <input 
                      type="number" 
                      className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" 
                      placeholder="Cholesterol"
                      value={healthData.cholesterol}
                      onChange={(e) => handleInputChange('cholesterol', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Glucose (mg/dL)</label>
                    <input 
                      type="number" 
                      className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" 
                      placeholder="Glucose"
                      value={healthData.glucose}
                      onChange={(e) => handleInputChange('glucose', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Smoking Status</label>
                    <select 
                      className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      value={healthData.smoking}
                      onChange={(e) => handleInputChange('smoking', e.target.value)}
                    >
                      <option value="never">Never</option>
                      <option value="former">Former</option>
                      <option value="current">Current</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Physical Activity</label>
                    <select 
                      className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      value={healthData.physical_activity}
                      onChange={(e) => handleInputChange('physical_activity', e.target.value)}
                    >
                      <option value="low">Low</option>
                      <option value="moderate">Moderate</option>
                      <option value="high">High</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">AQI Exposure</label>
                    <input 
                      type="number" 
                      className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" 
                      placeholder="AQI Level"
                      value={healthData.aqi_exposure}
                      onChange={(e) => handleInputChange('aqi_exposure', parseInt(e.target.value) || 0)}
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Heat Exposure (%)</label>
                    <input 
                      type="number" 
                      className="w-full bg-muted/50 border border-border rounded-lg px-3 py-2.5 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" 
                      placeholder="Heat Exposure"
                      value={healthData.heat_exposure}
                      onChange={(e) => handleInputChange('heat_exposure', parseInt(e.target.value) || 0)}
                    />
                  </div>
                </div>

                <button 
                  onClick={analyzeRisk}
                  disabled={isAnalyzing}
                  className="mt-4 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    'Analyze Risk'
                  )}
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
            {displayAssessment.recommendations.map((r, i) => (
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
