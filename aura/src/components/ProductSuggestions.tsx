import { useMemo } from "react";
import { ShoppingBag, Package, ShieldCheck, Leaf, Heart, Droplets, Monitor, Flower2, Wind, MapPin, ExternalLink as ExternalLinkIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { type RiskBand, type UserProfile } from "@/lib/ai-service";

export interface ProductSuggestion {
  id: string;
  name: string;
  description: string;
  price: string;
  priceNum: number;
  category: string;
  icon: string;
  imageUrl: string;
  buyLinks: Array<{ name: string; url: string; locale: string }>;
  why: string;
  relevanceScore: number;
}

interface ProductSuggestionsProps {
  aqi: number;
  riskBand: RiskBand;
  city: string;
  profile: UserProfile;
  language?: string;
  country?: string;
}

// Product database with contextual recommendations
const PRODUCT_CATALOG: Record<string, ProductSuggestion[]> = {
  good: [
    {
      id: "good-1",
      name: "Smart Air Quality Monitor",
      description: "Track air quality in real-time at home with smartphone connectivity.",
      price: "$89–$150",
      priceNum: 89,
      category: "Monitoring",
      icon: "Monitor",
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd22c430649?w=400&h=300&fit=crop&auto=format",
      buyLinks: [],
      why: "Maintain awareness even on clean days — helps you plan ahead.",
      relevanceScore: 7,
    },
    {
      id: "good-2",
      name: "Air-Purifying Houseplants (Set)",
      description: "Snake Plant, Spider Plant, and Peace Lily — natural air purifiers.",
      price: "$25–$45",
      priceNum: 25,
      category: "Natural",
      icon: "Flower2",
      imageUrl: "https://images.unsplash.com/photo-1459411552884-841db9b3cc2a?w=400&h=300&fit=crop&auto=format",
      buyLinks: [],
      why: "NASA-confirmed air-cleaning plants for natural indoor purification.",
      relevanceScore: 8,
    },
    {
      id: "good-3",
      name: "E-Bike for Short Commutes",
      description: "Zero-emission commute for short distances — save money and stay fit.",
      price: "$300–$1,200",
      priceNum: 300,
      category: "Transport",
      icon: "Wind",
      imageUrl: "https://images.unsplash.com/photo-1571068316344-75bc76f77890?w=400&h=300&fit=crop&auto=format",
      buyLinks: [],
      why: "Replaces car trips, cuts CO2, and improves cardiovascular health.",
      relevanceScore: 9,
    },
    {
      id: "good-4",
      name: "Outdoor Exercise Mat & Gear",
      description: "Quality yoga/exercise mat for outdoor workouts in clean air.",
      price: "$20–$60",
      priceNum: 20,
      category: "Fitness",
      icon: "Leaf",
      imageUrl: "https://images.unsplash.com/photo-1601925260368-ae2883474277?w=400&h=300&fit=crop&auto=format",
      buyLinks: [],
      why: "Take advantage of good air days for outdoor fitness.",
      relevanceScore: 6,
    },
  ],
  moderate: [
    {
      id: "mod-1",
      name: "N95/FFP2 Respirator Masks (Pack)",
      description: "Certified particulate-filtering masks for outdoor protection.",
      price: "$15–$30",
      priceNum: 15,
      category: "Protection",
      icon: "ShieldCheck",
      imageUrl: "https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=400&h=300&fit=crop&auto=format",
      buyLinks: [],
      why: "Filters 95% of airborne particulates — essential for moderate AQI days.",
      relevanceScore: 9,
    },
    {
      id: "mod-2",
      name: "Portable Air Quality Monitor",
      description: "Personal AQI tracker that syncs to your phone in real time.",
      price: "$100–$200",
      priceNum: 100,
      category: "Monitoring",
      icon: "Monitor",
      imageUrl: "https://images.unsplash.com/photo-1586528716150-83390a828482?w=400&h=300&fit=crop&auto=format",
      buyLinks: [],
      why: "Know your exact exposure level — not just the city average.",
      relevanceScore: 8,
    },
    {
      id: "mod-3",
      name: "HEPA Window Screen Kit",
      description: "Install HEPA filters on windows to reduce outdoor particulate ingress.",
      price: "$30–$80",
      priceNum: 30,
      category: "Home",
      icon: "Package",
      imageUrl: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400&h=300&fit=crop&auto=format",
      buyLinks: [],
      why: "Low-cost way to improve indoor air without running a purifier 24/7.",
      relevanceScore: 7,
    },
    {
      id: "mod-4",
      name: "Cool Mist Humidifier",
      description: "Maintain 40–60% indoor humidity to reduce dust suspension.",
      price: "$40–$90",
      priceNum: 40,
      category: "Home",
      icon: "Droplets",
      imageUrl: "https://images.unsplash.com/photo-1618941716939-55383320f967?w=400&h=300&fit=crop&auto=format",
      buyLinks: [],
      why: "Proper humidity reduces how long particulates stay suspended indoors.",
      relevanceScore: 6,
    },
  ],
  unhealthy: [
    {
      id: "unh-1",
      name: "HEPA Air Purifier (Room Size)",
      description: "True HEPA + activated carbon purifier for rooms up to 400 sq ft.",
      price: "$100–$300",
      priceNum: 100,
      category: "Protection",
      icon: "Wind",
      imageUrl: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=300&fit=crop&auto=format",
      buyLinks: [],
      why: "Reduces indoor PM2.5 by up to 90% — your #1 investment on bad days.",
      relevanceScore: 10,
    },
    {
      id: "unh-2",
      name: "N95 Respirator Masks (Pack of 20)",
      description: "Certified N95 masks for essential outdoor trips during poor air.",
      price: "$20–$40",
      priceNum: 20,
      category: "Protection",
      icon: "ShieldCheck",
      imageUrl: "https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=400&h=300&fit=crop&auto=format",
      buyLinks: [],
      why: "Every outdoor trip in unhealthy air should include an N95 mask.",
      relevanceScore: 10,
    },
    {
      id: "unh-3",
      name: "Smart Air Quality Monitor with Alerts",
      description: "WiFi-connected monitor that sends alerts when AQI spikes indoors.",
      price: "$130–$250",
      priceNum: 130,
      category: "Monitoring",
      icon: "Monitor",
      imageUrl: "https://images.unsplash.com/photo-1558618666-fcd22c430649?w=400&h=300&fit=crop&auto=format",
      buyLinks: [],
      why: "Know when to seal windows and activate purifiers in real time.",
      relevanceScore: 9,
    },
    {
      id: "unh-4",
      name: "Door & Window Seal Kit",
      description: "Weatherstripping to seal gaps and prevent outdoor smog infiltration.",
      price: "$15–$35",
      priceNum: 15,
      category: "Home",
      icon: "Package",
      imageUrl: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400&h=300&fit=crop&auto=format",
      buyLinks: [],
      why: "Cheap and effective — seals gaps where smog leaks through.",
      relevanceScore: 8,
    },
  ],
  hazardous: [
    {
      id: "haz-1",
      name: "Medical-Grade P100 Respirator",
      description: "Highest-level filtration for hazardous air — used in industrial settings.",
      price: "$25–$50",
      priceNum: 25,
      category: "Protection",
      icon: "ShieldCheck",
      imageUrl: "https://images.unsplash.com/photo-1584634731339-252c581abfc5?w=400&h=300&fit=crop&auto=format",
      buyLinks: [],
      why: "N95 is not enough for hazardous air — P100 filters 99.97% of particles.",
      relevanceScore: 10,
    },
    {
      id: "haz-2",
      name: "Whole-Home HEPA Air Purification",
      description: "HVAC-integrated purifier that cleans air throughout your entire home.",
      price: "$500–$2,000",
      priceNum: 500,
      category: "Protection",
      icon: "Wind",
      imageUrl: "https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=400&h=300&fit=crop&auto=format",
      buyLinks: [],
      why: "When AQI exceeds 400, whole-home protection is essential for your family.",
      relevanceScore: 10,
    },
    {
      id: "haz-3",
      name: "DIY Clean-Room Sealing Kit",
      description: "Foam tape, plastic sheeting, and tape to create a clean air room.",
      price: "$30–$60",
      priceNum: 30,
      category: "Home",
      icon: "Package",
      imageUrl: "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400&h=300&fit=crop&auto=format",
      buyLinks: [],
      why: "Create a sealed clean room — the most cost-effective hazardous-air strategy.",
      relevanceScore: 10,
    },
    {
      id: "haz-4",
      name: "Emergency Shelter Kit (72 hr)",
      description: "Masks, water, medications, and non-perishable food for sheltering.",
      price: "$50–$120",
      priceNum: 50,
      category: "Emergency",
      icon: "Heart",
      imageUrl: "https://images.unsplash.com/photo-1516216628859-9bccecab13ca?w=400&h=300&fit=crop&auto=format",
      buyLinks: [],
      why: "During hazardous AQI events, you may need to shelter indoors for days.",
      relevanceScore: 9,
    },
  ],
};

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  ShieldCheck,
  Monitor,
  Wind,
  Package,
  Droplets,
  Heart,
  Flower2,
  Leaf,
};

// Build location-aware shopping links based on country
function buildBuyLinks(product: ProductSuggestion, country: string | undefined, city: string): Array<{ name: string; url: string; locale: string }> {
  const locale = (country || "").toLowerCase();
  const isIndia = locale === "in" || locale === "india";
  const isUS = locale === "us" || locale === "usa" || locale === "united states";

  const links: Array<{ name: string; url: string; locale: string }> = [];

  if (isIndia) {
    links.push({
      name: "Amazon.in",
      url: `https://www.amazon.in/s?k=${encodeURIComponent(`${product.name} ${city}`)}`,
      locale: "IN",
    });
    links.push({
      name: "Flipkart",
      url: `https://www.flipkart.com/search?q=${encodeURIComponent(`${product.name} ${city}`)}`,
      locale: "IN",
    });
    links.push({
      name: "Meesho",
      url: `https://www.meesho.com/search?q=${encodeURIComponent(product.name)}`,
      locale: "IN",
    });
  } else if (isUS) {
    links.push({
      name: "Amazon",
      url: `https://www.amazon.com/s?k=${encodeURIComponent(`${product.name} ${city}`)}`,
      locale: "US",
    });
    links.push({
      name: "Walmart",
      url: `https://www.walmart.com/search?q=${encodeURIComponent(`${product.name} ${city}`)}`,
      locale: "US",
    });
    links.push({
      name: "Target",
      url: `https://www.target.com/s?searchTerm=${encodeURIComponent(`${product.name} ${city}`)}`,
      locale: "US",
    });
  } else {
    links.push({
      name: "Amazon",
      url: `https://www.amazon.${locale === "uk" ? "co.uk" : locale === "de" ? "de" : locale === "fr" ? "fr" : locale === "jp" ? "co.jp" : "s"}?url=search-alias%3Daps&field-keywords=${encodeURIComponent(`${product.name} ${city}`)}`,
      locale: locale.toUpperCase() || "GLOBAL",
    });
    links.push({
      name: "eBay",
      url: `https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(`${product.name} ${city}`)}`,
      locale: "GLOBAL",
    });
  }

  return links;
}

function generateProductSuggestions(
  _aqi: number,
  riskBand: RiskBand,
  _city: string,
  profile: UserProfile,
): ProductSuggestion[] {
  let baseProducts: ProductSuggestion[];
  if (riskBand === "good") baseProducts = PRODUCT_CATALOG.good;
  else if (riskBand === "moderate") baseProducts = PRODUCT_CATALOG.moderate;
  else if (riskBand === "unhealthy") baseProducts = PRODUCT_CATALOG.unhealthy;
  else baseProducts = PRODUCT_CATALOG.hazardous;

  let suggestions = [...baseProducts].sort((a, b) => b.relevanceScore - a.relevanceScore);

  if (profile.lifestyle === "Budget") {
    suggestions = [...suggestions].sort((a, b) => a.priceNum - b.priceNum);
  }

  if (profile.concern === "Health focus") {
    suggestions = [...suggestions].sort((a, b) => {
      const aPriority = ["Protection", "Health"].includes(a.category) ? 1 : 0;
      const bPriority = ["Protection", "Health"].includes(b.category) ? 1 : 0;
      return bPriority - aPriority;
    });
  }

  if (profile.concern === "Environmental focus") {
    suggestions = [...suggestions].sort((a, b) => {
      const aPriority = a.category === "Transport" ? 1 : 0;
      const bPriority = b.category === "Transport" ? 1 : 0;
      return bPriority - aPriority;
    });
  }

  return suggestions.slice(0, 4);
}

export function ProductSuggestions({ aqi, riskBand, city, profile, country }: ProductSuggestionsProps) {
  const products = useMemo(() => {
    const suggestions = generateProductSuggestions(aqi, riskBand, city, profile);
    // Add location-aware buy links
    return suggestions.map((p) => ({
      ...p,
      buyLinks: buildBuyLinks(p, country, city),
    }));
  }, [aqi, riskBand, city, profile, country]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <ShoppingBag className="h-4 w-4 text-primary" />
        <h3 className="text-sm font-semibold">Recommended Products</h3>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[0.625rem] font-medium text-primary">
          AQI {aqi}
        </span>
      </div>

      <div className="space-y-3">
        {products.map((product) => {
          const IconComp = ICON_MAP[product.icon] || Package;
          return (
            <Card key={product.id} className="overflow-hidden border-border/50">
              {/* Product image */}
              <div className="relative h-36 w-full overflow-hidden bg-muted/30">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = "none";
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove("hidden");
                  }}
                />
                <div className="hidden absolute inset-0 flex items-center justify-center bg-muted/50">
                  <IconComp className="h-8 w-8 text-muted-foreground" />
                </div>
                <div className="absolute top-2 right-2 rounded-full bg-background/80 px-2 py-0.5 text-[0.55rem] font-medium text-muted-foreground backdrop-blur-sm">
                  {product.category}
                </div>
              </div>

              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-semibold leading-tight">{product.name}</h4>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {product.description}
                    </p>
                    <p className="mt-1 text-[0.625rem] font-medium text-foreground">
                      → {product.why}
                    </p>
                  </div>
                  <span className="shrink-0 text-sm font-bold text-primary">
                    {product.price}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {product.buyLinks.map((link) => (
                    <a
                      key={link.name}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 rounded-md bg-accent px-2.5 py-1 text-[0.6rem] font-medium text-accent-foreground transition-colors hover:bg-accent/80"
                    >
                      <MapPin className="h-3 w-3" />
                      {link.name}
                      <ExternalLinkIcon className="h-3 w-3" />
                    </a>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-[0.6rem] text-muted-foreground">
        Prices are estimates. Links open local shopping sites for your area — browse and compare before buying.
      </p>
    </div>
  );
}

export default ProductSuggestions;
