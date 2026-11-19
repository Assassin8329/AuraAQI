import { cn } from "./button";

const BANDS: { key: string; label: string; color: string; min: number; max: number }[] = [
  { key: "good", label: "Good", color: "#0E9F6E", min: 0, max: 50 },
  { key: "moderate", label: "Moderate", color: "#F2C744", min: 51, max: 100 },
  { key: "unhealthy", label: "Unhealthy for Sensitive Groups", color: "#F7941D", min: 101, max: 150 },
  { key: "unhealthy", label: "Unhealthy", color: "#E0523C", min: 151, max: 200 },
  { key: "hazardous", label: "Hazardous", color: "#8E1B2E", min: 201, max: 500 },
];

const CX = 100;
const CY = 100;
const R = 70;
const START_DEG = 225;
const END_DEG = 315;

function pointOnArc(deg: number, radius: number) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: CX + radius * Math.cos(rad), y: CY + radius * Math.sin(rad) };
}

export function RiskGauge({
  aqi,
  className,
}: {
  aqi: number;
  className?: string;
}) {
  const band = BANDS.find((b) => aqi >= b.min && aqi <= b.max) ?? BANDS[4];

  const start = pointOnArc(START_DEG, R);
  const end = pointOnArc(END_DEG, R);
  const arcPath = `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${R} ${R} 0 1 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`;
  const arcLength = (R * 2 * Math.PI) / 360 * (END_DEG - START_DEG);
  const progress = Math.max(0.02, Math.min(1, aqi / 300));
  const fillLength = arcLength * progress;

  // Tick marks along the arc
  const ticks = [25, 50, 75].map((pct) => {
    const deg = START_DEG + (END_DEG - START_DEG) * (pct / 100);
    const inner = pointOnArc(deg, R - 10);
    const outer = pointOnArc(deg, R);
    return (
      <line
        key={pct}
        x1={inner.x}
        y1={inner.y}
        x2={outer.x}
        y2={outer.y}
        stroke={band.color}
        strokeWidth={pct === 50 ? 2 : 1}
        strokeLinecap="round"
        opacity={pct === 50 ? 0.9 : 0.45}
      />
    );
  });

  return (
    <div className={cn("relative", className)}>
      <svg viewBox="0 0 200 200" className="h-full w-full" role="img" aria-label={`${band.label}, AQI ${aqi}`}>
        {/* Track */}
        <path
          d={arcPath}
          fill="none"
          stroke="rgba(22, 32, 12, 0.08)"
          strokeWidth={16}
          strokeLinecap="round"
        />
        {/* Fill */}
        <path
          d={arcPath}
          fill="none"
          stroke={band.color}
          strokeWidth={16}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${fillLength} 100`}
          className="animate-aura-sweep"
        />
        {/* Highlight sweep */}
        <path
          d={arcPath}
          fill="none"
          stroke="#FFFFFF"
          strokeWidth={5}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${Math.max(6, fillLength * 0.12)} 100`}
          className="animate-aura-sweep"
          opacity="0.9"
        />
        {/* Ticks */}
        {ticks}
      </svg>

      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[2.75rem] font-semibold leading-none tracking-tight text-foreground">
          {aqi}
        </span>
        <span className="mt-1 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {band.label}
        </span>
      </div>
    </div>
  );
}