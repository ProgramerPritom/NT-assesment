import React from "react";
import Link from "next/link";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: "default" | "critical" | "warning" | "success";
  pulseBadge?: string;
  href?: string;
}

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "default",
  pulseBadge,
  href,
}: MetricCardProps) {
  const cardStyles = {
    default: "border-slate-800 bg-slate-900/90 text-slate-100 hover:border-slate-700",
    critical: "border-rose-800/80 bg-rose-950/30 text-rose-100 hover:border-rose-700",
    warning: "border-amber-800/80 bg-amber-950/30 text-amber-100 hover:border-amber-700",
    success: "border-emerald-800/80 bg-emerald-950/30 text-emerald-100 hover:border-emerald-700",
  };

  const iconStyles = {
    default: "bg-slate-800/80 text-indigo-400 border border-slate-700/50",
    critical: "bg-rose-900/40 text-rose-400 border border-rose-800/60",
    warning: "bg-amber-900/40 text-amber-400 border border-amber-800/60",
    success: "bg-emerald-900/40 text-emerald-400 border border-emerald-800/60",
  };

  const content = (
    <div
      className={`p-5 rounded-xl border transition-all duration-200 shadow-sm relative overflow-hidden group ${cardStyles[variant]}`}
    >
      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium uppercase tracking-wider text-slate-400">
            {title}
          </span>
          <div className="mt-2 text-2xl font-bold tracking-tight text-slate-50 flex items-center gap-2">
            <span>{value}</span>
            {pulseBadge && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-rose-950/80 text-rose-400 border border-rose-800/80">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" />
                {pulseBadge}
              </span>
            )}
          </div>
        </div>

        <div className={`p-2.5 rounded-lg transition-transform group-hover:scale-105 ${iconStyles[variant]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs">
        {trend && (
          <div
            className={`flex items-center gap-1 font-medium ${
              trend.isPositive ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {trend.isPositive ? (
              <TrendingUp className="w-3.5 h-3.5" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5" />
            )}
            <span>{trend.value}</span>
          </div>
        )}

        {subtitle && <span className="text-slate-400 ml-auto">{subtitle}</span>}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
