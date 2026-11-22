import { useState, useRef, useEffect, useCallback } from "react";
import { Search, X, MapPin } from "lucide-react";
import { cn } from "@/components/ui/button";

export interface GeoResult {
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  country?: string;
  countryName?: string;
}

interface AutocompleteSearchProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (result: GeoResult) => void;
  placeholder?: string;
  className?: string;
  label?: string;
  error?: string;
  autoFocus?: boolean;
}

export function AutocompleteSearch({
  value,
  onChange,
  onSelect,
  placeholder,
  className,
  label,
  error,
  autoFocus,
}: AutocompleteSearchProps) {
  const [results, setResults] = useState<GeoResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIdx, setHighlightedIdx] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchCities = useCallback(async (query: string) => {
    if (!query || query.length < 2) {
      setResults([]);
      setIsOpen(false);
      return;
    }
    setIsLoading(true);
    try {
      // Use Photon API (OpenStreetMap-based) — free, no key, fast, excellent city/region coverage
      const res = await fetch(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&limit=8&layer=city,region,state,country`
      );
      if (!res.ok) {
        // Fallback to server proxy
        const params = new URLSearchParams({
          name: query,
          count: "8",
          language: "en",
          format: "json",
        });
        const proxyRes = await fetch(`/api/geocode?${params}`);
        if (!proxyRes.ok) {
          setResults([]);
          setIsOpen(false);
          return;
        }
        const data = await proxyRes.json();
        const places = data.results || [];
        setResults(
          places.map((p: any) => ({
            name: p.name,
            latitude: p.latitude,
            longitude: p.longitude,
            admin1: p.admin1 || "",
            country: p.country || "",
          }))
        );
        setIsOpen(places.length > 0);
        return;
      }
      const data = await res.json();
      const features = data.features || [];
      const mapped = features.map((f: any) => {
        const props = f.properties;
        const coords = f.geometry?.coordinates || [0, 0];
        // Photon returns [lon, lat]
        return {
          name: props.name || "",
          latitude: coords[1],
          longitude: coords[0],
          admin1: props.state || props.region || "",
          country: props.country || "",
          countryName: props.country,
        };
      });
      setResults(mapped);
      setIsOpen(mapped.length > 0);
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    setHighlightedIdx(-1);

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      searchCities(val);
    }, 200);
  };

  const handleSelect = (result: GeoResult) => {
    const display = result.country
      ? `${result.name}, ${result.country}`
      : result.name;
    onChange(display);
    onSelect(result);
    setIsOpen(false);
    setResults([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightedIdx((prev) => Math.min(prev + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightedIdx((prev) => Math.max(prev - 1, -1));
    } else if (e.key === "Enter" && highlightedIdx >= 0) {
      e.preventDefault();
      handleSelect(results[highlightedIdx]);
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  return (
    <div ref={wrapperRef} className={cn("relative w-full", className)}>
      {label && (
        <label className="mb-1 block text-sm font-medium text-foreground">
          {label}
        </label>
      )}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder || "Type to search…"}
          autoFocus={autoFocus}
          className={cn(
            "w-full rounded-lg border bg-background pl-10 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring",
            error && "border-destructive"
          )}
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          role="combobox"
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange("");
              setResults([]);
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        {isLoading && (
          <div className="absolute right-10 top-1/2 -translate-y-1/2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-primary" />
          </div>
        )}
      </div>

      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}

      {isOpen && results.length > 0 && (
        <ul
          className="absolute z-[100] mt-1 max-h-64 w-full overflow-auto rounded-lg border bg-card shadow-lg"
          role="listbox"
        >
          {results.map((result, idx) => (
            <li
              key={`${result.latitude}-${result.longitude}`}
              role="option"
              aria-selected={idx === highlightedIdx}
              onClick={() => handleSelect(result)}
              className={cn(
                "flex cursor-pointer items-center gap-3 px-3 py-2.5 text-sm transition-colors",
                idx === highlightedIdx
                  ? "bg-primary/10 text-primary"
                  : "text-foreground hover:bg-accent"
              )}
            >
              <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1">
                <p className="font-medium truncate">{result.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {[result.admin1, result.countryName || result.country].filter(Boolean).join(", ")}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}

      {isOpen && results.length === 0 && !isLoading && (
        <div className="absolute z-[100] mt-1 w-full rounded-lg border bg-card p-4 text-center text-sm text-muted-foreground shadow-lg">
          No results found
        </div>
      )}

      {isLoading && (
        <div className="absolute z-[100] mt-1 w-full rounded-lg border bg-card p-3 text-center text-sm text-muted-foreground shadow-lg">
          Searching…
        </div>
      )}
    </div>
  );
}

export default AutocompleteSearch;
