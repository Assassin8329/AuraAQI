import { useEffect, useRef, useState } from "react";

// AQI color bands
const AQI_BANDS = [
  { max: 50, color: "#0E9F6E", label: "Good" },
  { max: 100, color: "#F2C744", label: "Moderate" },
  { max: 150, color: "#F7941D", label: "Unhealthy (Sensitive)" },
  { max: 200, color: "#E0523C", label: "Unhealthy" },
  { max: 300, color: "#8E1B2E", label: "Very Unhealthy" },
  { max: 500, color: "#5B0E1A", label: "Hazardous" },
];

function aqiBand(aqi: number) {
  return AQI_BANDS.find((b) => aqi <= b.max) || AQI_BANDS[AQI_BANDS.length - 1];
}

// Major world cities with representative AQI values
const CITIES = [
  { name: "Delhi", lat: 28.61, lng: 77.21, aqi: 310, country: "India" },
  { name: "Beijing", lat: 39.90, lng: 116.40, aqi: 95, country: "China" },
  { name: "New York", lat: 40.71, lng: -74.01, aqi: 42, country: "USA" },
  { name: "London", lat: 51.51, lng: -0.13, aqi: 38, country: "UK" },
  { name: "Sydney", lat: -33.87, lng: 151.21, aqi: 28, country: "Australia" },
  { name: "São Paulo", lat: -23.55, lng: -46.63, aqi: 55, country: "Brazil" },
  { name: "Dubai", lat: 25.20, lng: 55.27, aqi: 110, country: "UAE" },
  { name: "Jakarta", lat: -6.21, lng: 106.85, aqi: 78, country: "Indonesia" },
  { name: "Cairo", lat: 30.04, lng: 31.24, aqi: 145, country: "Egypt" },
  { name: "Lagos", lat: 6.52, lng: 3.38, aqi: 88, country: "Nigeria" },
  { name: "Mexico City", lat: 19.43, lng: -99.13, aqi: 92, country: "Mexico" },
  { name: "Paris", lat: 48.86, lng: 2.35, aqi: 45, country: "France" },
  { name: "Tokyo", lat: 35.68, lng: 139.69, aqi: 52, country: "Japan" },
  { name: "Moscow", lat: 55.76, lng: 37.62, aqi: 65, country: "Russia" },
  { name: "Cape Town", lat: -33.92, lng: 18.42, aqi: 35, country: "South Africa" },
  { name: "Lahore", lat: 31.55, lng: 74.35, aqi: 280, country: "Pakistan" },
  { name: "Bangkok", lat: 13.76, lng: 100.50, aqi: 85, country: "Thailand" },
  { name: "Los Angeles", lat: 34.05, lng: -118.24, aqi: 58, country: "USA" },
  { name: "Berlin", lat: 52.52, lng: 13.41, aqi: 40, country: "Germany" },
  { name: "Karachi", lat: 24.86, lng: 67.01, aqi: 195, country: "Pakistan" },
];

interface WorldMapProps {
  className?: string;
}

// Inline Leaflet CSS (avoids build issues with import)
const LEAFLET_CSS = `
  .leaflet-container { width: 100%; height: 380px; border-radius: 0.75rem; z-index: 1; }
  .leaflet-container a { color: inherit !important; }
  .leaflet-control-zoom a { background: white !important; color: #333 !important; border: none !important; box-shadow: 0 1px 4px rgba(0,0,0,0.15) !important; }
  .leaflet-control-attribution { font-size: 9px !important; background: rgba(255,255,255,0.7) !important; }
  .aqi-tooltip { font-family: system-ui, sans-serif; font-size: 12px; white-space: nowrap; }
  .aqi-tooltip .city { font-weight: 600; color: #1a1a2e; }
  .aqi-tooltip .aqi-val { font-weight: 700; margin-left: 4px; }
  .aqi-legend-item { display: flex; align-items: center; gap: 4px; }
  .aqi-legend-swatch { width: 12px; height: 12px; border-radius: 2px; flex-shrink: 0; }
`;

export function WorldMap({ className }: WorldMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    if (initialized) return;
    setInitialized(true);
  }, [initialized]);

  useEffect(() => {
    if (!containerRef.current || !initialized) return;

    // Dynamically load Leaflet CSS + JS
    const loadLeaflet = () => {
      return new Promise<void>((resolve, reject) => {
        // Inject CSS
        const styleId = "auraguide-leaflet-css";
        if (!document.getElementById(styleId)) {
          const style = document.createElement("style");
          style.id = styleId;
          style.textContent = LEAFLET_CSS;
          document.head.appendChild(style);
        }

        // Inject JS
        if ((window as any).L) {
          resolve();
          return;
        }

        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        link.onload = () => {
          const script = document.createElement("script");
          script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
          script.onload = () => resolve();
          script.onerror = reject;
          document.head.appendChild(script);
        };
        link.onerror = reject;
        document.head.appendChild(link);
      });
    };

    loadLeaflet()
      .then(() => {
        const L = (window as any).L;
        if (!L || !containerRef.current) return;

        const map = L.map(containerRef.current, {
          center: [20, 0],
          zoom: 2,
          zoomControl: true,
          attributionControl: true,
          worldCopyJump: true,
        });

        L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 19,
        }).addTo(map);

        mapRef.current = map;

        // Add city markers
        const markers: any[] = [];
        CITIES.forEach((city) => {
          const band = aqiBand(city.aqi);
          const radius = Math.max(8, Math.min(30, city.aqi / 10));

          // Colored circle marker
          const circle = L.circleMarker([city.lat, city.lng], {
            radius: radius,
            fillColor: band.color,
            fillOpacity: 0.75,
            color: band.color,
            weight: 1,
            opacity: 0.9,
          }).addTo(map);

          // Tooltip
          circle.bindTooltip(
            `<div class="aqi-tooltip"><span class="city">${city.name}</span>, ${city.country}<br><span class="aqi-val" style="color:${band.color}">AQI ${city.aqi}</span> — ${band.label}</div>`,
            {
              className: "aqi-tooltip",
              direction: "top",
              offset: [0, -10],
            }
          );

          markers.push(circle);
        });
        markersRef.current = markers;
      })
      .catch((err) => {
        console.error("Failed to load Leaflet:", err);
      });

    return () => {
      markersRef.current.forEach((m) => {
        if (m && m.remove) m.remove();
      });
      markersRef.current = [];
      if (mapRef.current && mapRef.current.remove) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [initialized]);

  return (
    <div className={className}>
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Global Air Quality Map</h3>
          <p className="text-xs text-muted-foreground">Representative AQI at major cities</p>
        </div>
      </div>

      <div ref={containerRef} className="w-full overflow-hidden rounded-xl border bg-slate-50" />

      {/* Legend */}
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
        {AQI_BANDS.map((band) => (
          <div key={band.max} className="aqi-legend-item">
            <div className="aqi-legend-swatch" style={{ backgroundColor: band.color }} />
            <span className="text-[0.625rem] text-muted-foreground">
              0–{band.max} {band.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default WorldMap;
