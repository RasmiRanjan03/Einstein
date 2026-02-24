import { User, Mail, MapPin, Calendar, Edit3 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import GlassCard from "@/components/GlassCard";

const Profile = () => {
  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Profile</h1>
        <p className="text-muted-foreground">Manage your account information</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Avatar section */}
        <GlassCard className="flex flex-col items-center" hover={false}>
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
            <User className="w-10 h-10 text-primary-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Alex Johnson</h3>
          <p className="text-sm text-muted-foreground">Climate Advocate</p>
          <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            Joined Feb 2026
          </div>
        </GlassCard>

        {/* Info */}
        <GlassCard className="lg:col-span-2" hover={false}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-foreground">Personal Information</h3>
            <button className="flex items-center gap-2 text-sm text-primary hover:opacity-80 transition-opacity">
              <Edit3 className="w-4 h-4" />
              Edit
            </button>
          </div>
          <div className="space-y-5">
            {[
              { label: "Full Name", value: "Alex Johnson", icon: User },
              { label: "Email", value: "alex@climacare.ai", icon: Mail },
              { label: "Location", value: "New Delhi, India", icon: MapPin },
            ].map((f) => (
              <div key={f.label}>
                <label className="text-xs text-muted-foreground mb-1 block">{f.label}</label>
                <div className="flex items-center gap-3 bg-muted/30 border border-border rounded-lg px-4 py-3">
                  <f.icon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">{f.value}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
