import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "../../lib/utils";

const colorMap = {
  orange: { bg: "bg-orange-50", icon: "text-orange-500", border: "border-orange-100/60" },
  blue:   { bg: "bg-blue-50",   icon: "text-blue-500",   border: "border-blue-100/60"   },
  green:  { bg: "bg-green-50",  icon: "text-green-500",  border: "border-green-100/60"  },
  purple: { bg: "bg-purple-50", icon: "text-purple-500", border: "border-purple-100/60" },
  red:    { bg: "bg-red-50",    icon: "text-red-500",    border: "border-red-100/60"    },
};

const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = "orange", className }) => {
  const c = colorMap[color] || colorMap.orange;
  return (
    <div className={cn("bg-white rounded-2xl border p-5 shadow-sm", c.border, className)}>
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-slate-500 font-semibold uppercase tracking-wide mb-1">{title}</p>
          <p className="text-2xl font-black text-slate-800 tabular-nums">{value}</p>
        </div>
        {Icon && (
          <div className={cn("w-11 h-11 rounded-xl flex items-center justify-center", c.bg)}>
            <Icon size={20} className={c.icon} />
          </div>
        )}
      </div>
      {trendValue && (
        <div className="flex items-center gap-1.5">
          {trend === "up"
            ? <TrendingUp size={13} className="text-green-500" />
            : <TrendingDown size={13} className="text-red-500" />}
          <span className={cn("text-xs font-bold", trend === "up" ? "text-green-600" : "text-red-600")}>
            {trendValue}
          </span>
          <span className="text-xs text-slate-400">vs last month</span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
