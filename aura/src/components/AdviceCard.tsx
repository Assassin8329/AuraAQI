import { ArrowUpRight, Copy, ShieldCheck } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/components/ui/button";
import type { AdviceCard as AdviceCardType } from "@/lib/ai-service";

const TONE_STYLES = {
  action: {
    accent: "bg-primary/10 text-primary",
    icon: "ArrowUpRight",
    border: "border-primary/20",
  },
  community: {
    accent: "bg-accent text-accent-foreground",
    icon: "Copy",
    border: "border-accent",
  },
  official: {
    accent: "bg-muted text-muted-foreground",
    icon: "ShieldCheck",
    border: "border-muted",
  },
} as const;

export function AdviceCard({ card }: { card: AdviceCardType }) {
  const tone = TONE_STYLES[card.tone];

  return (
    <Card className={cn("animate-aura-in", tone.border)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {card.kicker}
            </p>
            <h3 className="mt-1 text-base font-semibold">{card.title}</h3>
          </div>
          <span
            className={cn(
              "grid h-8 w-8 shrink-0 place-items-center rounded-md",
              tone.accent,
            )}
          >
            {tone.icon === "ArrowUpRight" ? (
              <ArrowUpRight className="h-4 w-4" />
            ) : tone.icon === "Copy" ? (
              <Copy className="h-4 w-4" />
            ) : (
              <ShieldCheck className="h-4 w-4" />
            )}
          </span>
        </div>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">{card.body}</p>
        {card.detail && (
          <p className="mt-3 rounded-md bg-secondary px-3 py-2 text-xs font-medium text-secondary-foreground">
            {card.detail}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export default AdviceCard;
