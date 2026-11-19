import { useState } from "react";
import { UserProfileForm } from "@/components/UserProfileForm";
import { Dashboard } from "@/components/Dashboard";
import { type UserProfile } from "@/lib/ai-service";

export default function App() {
  const [view, setView] = useState<"form" | "dashboard">("form");
  const [profile, setProfile] = useState<UserProfile | null>(null);

  const handleProfile = (next: UserProfile) => {
    setProfile(next);
    setView("dashboard");
  };

  if (view === "dashboard" && profile) {
    return (
      <Dashboard
        profile={profile}
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
