import { Routes, Route, Navigate } from "react-router-dom";
import { useAppContext } from "./context/AppContext";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import HealthRisk from "./pages/HealthRisk";
import Environment from "./pages/Environment";
import CarbonFootprint from "./pages/CarbonFootprint";
import DustbinLocator from "./pages/DustbinLocator";
import Prescription from "./pages/Prescription";
import HospitalLocator from "./pages/HospitalLocator"
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import SignupPage from "./pages/SignupPage";
import SigninPage from "./pages/SigninPage";

const App = () => {
  const { token } = useAppContext();

  return (
    <Routes>
      {/* Public Routes - accessible only when NOT logged in */}
      <Route path="/" element={!token ? <Index /> : <Navigate to="/dashboard" />} />
      <Route path="/signup" element={!token ? <SignupPage /> : <Navigate to="/dashboard" />} />
      <Route path="/signin" element={!token ? <SigninPage /> : <Navigate to="/dashboard" />} />

      {/* Protected Routes - accessible only when logged in */}
      <Route path="/dashboard" element={token ? <Dashboard /> : <Navigate to="/signin" />} />
      <Route path="/health" element={token ? <HealthRisk /> : <Navigate to="/signin" />} />
      <Route path="/environment" element={token ? <Environment /> : <Navigate to="/signin" />} />
      <Route path="/hospital" element={token?<HospitalLocator />:<Navigate to="/signin" />} />
      <Route path="/carbon" element={token ? <CarbonFootprint /> : <Navigate to="/signin" />} />
      <Route path="/dustbin" element={token ? <DustbinLocator /> : <Navigate to="/signin" />} />
      <Route path="/prescription" element={token ? <Prescription /> : <Navigate to="/signin" />} />
      <Route path="/profile" element={token ? <Profile /> : <Navigate to="/signin" />} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;