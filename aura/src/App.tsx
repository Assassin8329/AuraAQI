import { useState } from "react";
import { UserProfileForm } from "@/components/UserProfileForm";
import { Dashboard } from "@/components/Dashboard";
import { type UserProfile, type ProviderConfig } from "@/lib/ai-service";

export default function App() {
  const [view, setView] = useState<"form" | "dashboard">("form");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [provider, setProvider] = useState<ProviderConfig | null>(null);

  const handleProfile = (next: UserProfile, prov: ProviderConfig) => {
    setProfile(next);
    setProvider(prov);
    setView("dashboard");
  };

  if (view === "dashboard" && profile && provider) {
    return (
      <Dashboard
        profile={profile}
        provider={provider}
        onEditProfile={() => setView("form")}
      />
    );
  }

  return (
    <UserProfileForm
      onBack={() => setView("form")}
      onDone={handleProfile}
    />
  );
}
