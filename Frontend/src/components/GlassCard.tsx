import { ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: "primary" | "secondary" | "warning" | "danger";
  hover?: boolean;
  delay?: number;
}

const glowMap = {
  primary: "glow-primary",
  secondary: "glow-secondary",
  warning: "glow-warning",
  danger: "glow-danger",
};

export default function GlassCard({ children, className, glowColor = "primary", hover = true, delay = 0 }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { y: -5, scale: 1.02 } : undefined}
      className={cn(
        "glass gradient-border rounded-xl p-6",
        glowMap[glowColor],
        hover && "transition-shadow duration-300",
        className
      )}
    >
      {children}
    </motion.div>
  );
}
