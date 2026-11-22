import { useState, useRef, useEffect } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { type Language, languageNames } from "@/lib/translations";

interface LanguageSelectorProps {
  currentLang: Language;
  onChange: (lang: Language) => void;
  className?: string;
}

const LANGUAGES: Language[] = ["en", "hi", "es", "fr", "de", "ja", "ko", "ar"];

// Position-aware popover: measures button rect and places dropdown to avoid clipping
function getPopoverStyle(buttonRect: DOMRect): React.CSSProperties {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const popoverW = 180;
  const popoverH = 320;

  let left = buttonRect.right;
  let top = buttonRect.bottom;

  // If it would go off the right edge, show left-aligned
  if (left + popoverW > vw - 8) {
    left = buttonRect.left - popoverW;
  }
  // Clamp to viewport edges
  left = Math.max(8, Math.min(left, vw - popoverW - 8));

  // If it would go off the bottom edge, show above the button
  if (top + popoverH > vh - 8) {
    top = buttonRect.top - popoverH;
  }
  top = Math.max(8, top);

  return {
    position: "fixed" as const,
    left,
    top,
    zIndex: 1000,
  };
}

export function LanguageSelector({ currentLang, onChange, className }: LanguageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({
    position: "fixed",
    left: 0,
    top: 0,
    zIndex: 1000,
  });

  useEffect(() => {
    if (!isOpen) return;
    const rect = triggerRef.current?.getBoundingClientRect();
    if (rect) {
      setPopoverStyle(getPopoverStyle(rect));
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node) &&
        triggerRef.current &&
        !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  // Reposition on scroll/resize
  useEffect(() => {
    if (!isOpen) return;
    const onMove = () => {
      const rect = triggerRef.current?.getBoundingClientRect();
      if (rect) setPopoverStyle(getPopoverStyle(rect));
    };
    window.addEventListener("scroll", onMove, true);
    window.addEventListener("resize", onMove);
    return () => {
      window.removeEventListener("scroll", onMove, true);
      window.removeEventListener("resize", onMove);
    };
  }, [isOpen]);

  return (
    <div className={className}>
      <button
        ref={triggerRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 rounded-lg border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-accent"
        aria-label="Change language"
        aria-expanded={isOpen}
      >
        <Globe className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">{languageNames[currentLang]}</span>
        <ChevronDown className="h-3 w-3 text-muted-foreground" />
      </button>

      {isOpen && (
        <div
          ref={popoverRef}
          style={popoverStyle}
          className="w-[180px] rounded-xl border bg-card shadow-xl"
        >
          <div className="border-b px-3 py-2 text-[0.625rem] font-medium uppercase tracking-wider text-muted-foreground">
            Language
          </div>
          {LANGUAGES.map((lang) => (
            <button
              key={lang}
              onClick={() => {
                onChange(lang);
                setIsOpen(false);
              }}
              className={`flex w-full items-center justify-between px-3 py-2.5 text-left text-xs transition-colors ${
                lang === currentLang
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-foreground hover:bg-accent"
              }`}
            >
              <span>{languageNames[lang]}</span>
              {lang === currentLang && <Check className="h-3.5 w-3.5" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default LanguageSelector;
