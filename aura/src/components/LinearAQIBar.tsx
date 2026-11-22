import { cn } from "@/components/ui/button";

const BANDS = [
  { max: 50, label: "Good", color: "#0E9F6E", bg: "bg-emerald-500" },
  { max: 100, label: "Moderate", color: "#F2C744", bg: "bg-yellow-500" },
  { max: 150, label: "Unhealthy (Sensitive)", color: "#F7941D", bg: "bg-orange-500" },
  { max: 200, label: "Unhealthy", color: "#E0523C", bg: "bg-red-500" },
  { max: 300, label: "Very Unhealthy", color: "#8E1B2E", bg: "bg-purple-600" },
  { max: 500, label: "Hazardous", color: "#5B0E1A", bg: "bg-red-900" },
];

function getBand(aqi: number) {
  return BANDS.find((b) => aqi <= b.max) || BANDS[BANDS.length - 1];
}

function getProgress(aqi: number) {
  return Math.min(100, Math.max(2, (aqi / 500) * 100));
}

export function LinearAQIBar({
  aqi,
  className,
}: {
  aqi: number;
  className?: string;
}) {
  const band = getBand(aqi);
  const progress = getProgress(aqi);

  return (
    <div className={cn("w-full", className)}>
      {/* AQI value */}
      <div className="mb-2 flex items-end justify-between">
        <div>
          <span className="text-3xl font-bold tracking-tight text-foreground">{aqi}</span>
          <span className="ml-1.5 text-xs font-medium text-muted-foreground">AQI</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: band.color }}
          />
          <span
            className="text-xs font-semibold"
            style={{ color: band.color }}
          >
            {band.label}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="relative h-3 w-full overflow-hidden rounded-full bg-muted/50">
        {/* Background bands */}
        <div className="absolute inset-0 flex">
          <div className="h-full bg-emerald-500/30" style={{ width: "10%" }} />
          <div className="h-full bg-yellow-500/30" style={{ width: "10%" }} />
          <div className="h-full bg-orange-500/30" style={{ width: "10%" }} />
          <div className="h-full bg-red-500/30" style={{ width: "10%" }} />
          <div className="h-full bg-purple-600/30" style={{ width: "20%" }} />
          <div className="h-full bg-red-900/30" style={{ width: "40%" }} />
        </div>

        {/* Fill */}
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${progress}%`,
            backgroundColor: band.color,
          }}
        />

        {/* Marker */}
        <div
          className="absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm"
          style={{
            left: `${progress}%`,
            backgroundColor: band.color,
          }}
        />
      </div>

      {/* Scale labels */}
      <div className="mt-1 flex justify-between text-[0.55rem] text-muted-foreground">
        <span>0</span>
        <span>50</span>
        <span>100</span>
        <span>150</span>
        <span>200</span>
        <span>300</span>
        <span>500+</span>
      </div>

      {/* Band legend */}
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5">
        {BANDS.map((b) => (
          <div key={b.max} className="flex items-center gap-1">
            <div
              className="h-2 w-2 rounded-sm"
              style={{ backgroundColor: b.color }}
            />
            <span className="text-[0.55rem] text-muted-foreground">
              {b.max === 500 ? "401–500" : b.max === 300 ? "201–300" : b.max === 200 ? "151–200" : b.max === 150 ? "101–150" : b.max === 100 ? "51–100" : "0–50"} {b.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default LinearAQIBar;
