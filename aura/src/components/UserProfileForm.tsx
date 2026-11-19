import { useState } from "react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button, cn } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input, Label } from "@/components/ui/input";
import type { UserProfile } from "@/lib/ai-service";

type Choice = { value: string; label: string; description: string; icon: string };

const LIFESTYLES: Choice[] = [
  { value: "Budget", label: "Budget", description: "Low-cost, everyday swaps", icon: "₹" },
  {
    value: "Time Availability",
    label: "Time Availability",
    description: "You have time to invest",
    icon: "◷",
  },
];

const CONCERNS: Choice[] = [
  {
    value: "Health focus",
    label: "Health focus",
    description: "Protect yourself and family",
    icon: "♥",
  },
  {
    value: "Environmental focus",
    label: "Environmental focus",
    description: "Reduce your footprint",
    icon: "♻",
  },
];

const STYLES: Choice[] = [
  { value: "Direct", label: "Direct", description: "Short, to the point", icon: "↯" },
  { value: "Detailed", label: "Detailed", description: "Explain the why", icon: "◍" },
  { value: "Friendly", label: "Friendly", description: "Warm and encouraging", icon: "☀" },
];

const MAX_INPUT_LEN = 150;

export function UserProfileForm({
  onBack,
  onDone,
}: {
  onBack: () => void;
  onDone: (profile: UserProfile) => void;
}) {
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [lifestyle, setLifestyle] = useState<UserProfile["lifestyle"]>("Budget");
  const [concern, setConcern] = useState<UserProfile["concern"]>("Health focus");
  const [style, setStyle] =
    useState<UserProfile["communicationStyle"]>("Direct");
  const [formError, setFormError] = useState<string | null>(null);

  const submit = () => {
    const trimmedName = name.trim();
    const trimmedLocation = location.trim();
    if (!trimmedName || !trimmedLocation) {
      setFormError("Please fill in both fields.");
      return;
    }
    if (trimmedName.length > MAX_INPUT_LEN || trimmedLocation.length > MAX_INPUT_LEN) {
      setFormError(`Please keep each field under ${MAX_INPUT_LEN} characters.`);
      return;
    }
    setFormError(null);
    onDone({
      name: trimmedName,
      location: trimmedLocation,
      lifestyle,
      concern,
      communicationStyle: style,
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto flex min-h-screen flex-col justify-between px-4 py-6 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="grid h-8 w-8 place-items-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="h-4 w-4" />
            </span>
            AuraGuide
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="hidden sm:inline-flex"
          >
            <ArrowRight className="h-4 w-4 rotate-180" />
            Back
          </Button>
        </header>

        <main className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[1fr_420px]">
          <section className="max-w-xl">
            <p className="mb-3 text-sm font-medium text-muted-foreground">
              Step 1 of 2
            </p>
            <h1 className="mb-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Tell us a little about you
            </h1>
            <p className="mb-8 text-sm leading-6 text-muted-foreground">
              We use your context to tailor the advice AuraGuide gives you — nothing
              is shared with anyone else.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
              className="space-y-6"
            >
              {formError && (
                <p className="text-sm text-destructive" role="alert">
                  {formError}
                </p>
              )}

              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Alex Rivera"
                  autoComplete="name"
                  maxLength={MAX_INPUT_LEN}
                  className={formError && name.trim() ? "border-destructive" : ""}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {name.length}/{MAX_INPUT_LEN}
                </p>
              </div>

              <div>
                <Label htmlFor="location">Location (City or Region)</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Bengaluru"
                  autoComplete="address-level2"
                  maxLength={MAX_INPUT_LEN}
                  className={formError && location.trim() ? "border-destructive" : ""}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  {location.length}/{MAX_INPUT_LEN}
                </p>
              </div>

              <fieldset>
                <Legend
                  title="Lifestyle"
                  description="What can you realistically do?"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  {LIFESTYLES.map((l) => (
                    <ChoiceButton
                      key={l.value}
                      choice={l}
                      selected={lifestyle === l.value}
                      onClick={() =>
                        setLifestyle(l.value as UserProfile["lifestyle"])
                      }
                    />
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <Legend
                  title="Primary concern"
                  description="What matters most to you?"
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  {CONCERNS.map((c) => (
                    <ChoiceButton
                      key={c.value}
                      choice={c}
                      selected={concern === c.value}
                      onClick={() =>
                        setConcern(c.value as UserProfile["concern"])
                      }
                    />
                  ))}
                </div>
              </fieldset>

              <fieldset>
                <Legend
                  title="Preferred communication style"
                  description="How do you like advice?"
                />
                <div className="grid gap-3 sm:grid-cols-3">
                  {STYLES.map((s) => (
                    <ChoiceButton
                      key={s.value}
                      choice={s}
                      selected={style === s.value}
                      onClick={() =>
                        setStyle(
                          s.value as UserProfile["communicationStyle"],
                        )
                      }
                    />
                  ))}
                </div>
              </fieldset>

              <Button type="submit" size="lg" className="w-full">
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </section>

          <aside className="hidden lg:block">
            <Card className="bg-accent/40">
              <CardContent className="p-6">
                <p className="text-sm font-semibold">Why this matters</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  AuraGuide shapes its guidance around your priorities — whether
                  that means protecting your family's health or cutting your
                  environmental impact.
                </p>
                <div className="mt-6 space-y-4 border-t border-border pt-5">
                  <Stat label="Personalised" value="✓" />
                  <Stat label="Community-first" value="✓" />
                  <Stat label="Source-backed" value="✓" />
                </div>
              </CardContent>
            </Card>
          </aside>
        </main>

        <footer className="text-xs text-muted-foreground">
          AuraGuide · GenAI demo · Air quality guidance is not a substitute for
          medical advice.
        </footer>
      </div>
    </div>
  );
}

function Legend({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-2 flex items-baseline justify-between">
      <h2 className="text-sm font-semibold">{title}</h2>
      <span className="text-xs text-muted-foreground">{description}</span>
    </div>
  );
}

function ChoiceButton({
  choice,
  selected,
  onClick,
}: {
  choice: Choice;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={cn(
        "flex h-12 items-center gap-3 rounded-md border px-4 text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        selected
          ? "border-primary bg-primary/10 text-primary"
          : "border-input bg-background text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      )}
    >
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-muted text-sm font-semibold text-muted-foreground">
        {choice.icon}
      </span>
      <span>
        <span className="block text-sm font-medium">{choice.label}</span>
        <span className="mt-0.5 block text-xs leading-4 text-muted-foreground">
          {choice.description}
        </span>
      </span>
    </button>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground">
      <span className="grid h-5 w-5 place-items-center rounded-full bg-primary/10 text-primary">
        {value}
      </span>
      {label}
    </div>
  );
}
