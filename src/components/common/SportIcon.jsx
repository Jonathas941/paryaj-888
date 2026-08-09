import React from "react";
import { Trophy, Shield, Activity, CircleDot, Dumbbell, Target, Gamepad2, Zap, Star, Flag } from "lucide-react";

const MAP = {
  soccer: Trophy, basketball: Activity, tennis: Target, baseball: CircleDot,
  football: Trophy, hockey: Shield, boxing: Dumbbell, mma: Dumbbell, cricket: Trophy,
  volleyball: Zap, "table-tennis": CircleDot, esports: Gamepad2,
  other: Star, league: Flag
};

export default function SportIcon({ sport, className = "w-5 h-5" }) {
  const Icon = MAP[sport] || Star;
  return <Icon className={className} />;
}