import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  HeartPulse,
  TreePine,
  Footprints,
  MapPin,
  Building2,
  Pill,
  User,
  ChevronLeft,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { title: "Health Risk", path: "/health", icon: HeartPulse },
  { title: "Environment", path: "/environment", icon: TreePine },
  { title: "Carbon Impact", path: "/carbon", icon: Footprints },
  { title: "Dustbin Locator", path: "/dustbin", icon: MapPin },
  { title: "Hospitals", path: "/hospital", icon: Building2 },
  { title: "Prescription", path: "/prescription", icon: Pill },
  { title: "Profile", path: "/profile", icon: User },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const SidebarContent = () => (
    <nav className="flex flex-col gap-1 mt-4">
      {navItems.map((item) => {
        const active = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group",
              active
                ? "bg-primary/10 text-primary glow-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            )}
          >
            <item.icon className={cn("w-5 h-5 shrink-0", active && "text-primary")} />
            {!collapsed && (
              <span className="text-sm font-medium truncate">{item.title}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 256 }}
        transition={{ duration: 0.3 }}
        className="hidden lg:flex flex-col border-r border-border bg-sidebar fixed top-0 left-0 h-full z-40"
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          {!collapsed && (
            <Link to="/" className="text-lg font-bold text-gradient-primary">
              CLIMACARE
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ChevronLeft className={cn("w-4 h-4 transition-transform", collapsed && "rotate-180")} />
          </button>
        </div>
        <SidebarContent />
      </motion.aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-14 glass-strong flex items-center px-4 gap-3">
        <button onClick={() => setMobileOpen(true)} className="text-foreground">
          <Menu className="w-6 h-6" />
        </button>
        <span className="font-bold text-gradient-primary">CLIMACARE</span>
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-background/80 backdrop-blur-sm z-50"
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="lg:hidden fixed top-0 left-0 h-full w-[280px] bg-sidebar border-r border-border z-50 p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <Link to="/" className="text-lg font-bold text-gradient-primary">
                  CLIMACARE
                </Link>
                <button onClick={() => setMobileOpen(false)} className="text-muted-foreground">
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </div>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <main
        className={cn(
          "flex-1 min-h-screen pt-14 lg:pt-0 transition-all duration-300",
          collapsed ? "lg:ml-[72px]" : "lg:ml-[256px]"
        )}
      >
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="p-4 md:p-8"
        >
          {children}
        </motion.div>
      </main>
    </div>
  );
}
