import { cn } from "@/lib/utils";

export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export function RiskBadge({ level, className }: { level: RiskLevel; className?: string }) {
  const map: Record<RiskLevel, string> = {
    Low: "bg-risk-low text-risk-low-foreground ring-1 ring-risk-low/40",
    Medium: "bg-risk-medium text-risk-medium-foreground ring-1 ring-risk-medium/40",
    High: "bg-risk-high text-risk-high-foreground ring-1 ring-risk-high/40",
    Critical: "bg-risk-critical text-risk-critical-foreground ring-1 ring-risk-critical/40",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold shadow-sm",
        map[level],
        className,
      )}
      aria-label={`Risk level ${level}`}
    >
      {level}
    </span>
  );
}
