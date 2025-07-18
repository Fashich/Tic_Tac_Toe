"use client";
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { LoginForm } from "@/components/LoginForm";
import { SignupForm } from "@/components/SignupForm";
import { MainMenu } from "@/components/MainMenu";
import { GameHistory } from "@/components/GameHistory";
import { TutorialModal } from "@/components/TutorialModal";
import { LoadingSpinner } from "@/components/LoadingSpinner";
type ViewState = "menu" | "history" | "tutorial";
export default function HomePage() {
  const { user, loading } = useAuth();
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [currentView, setCurrentView] = useState<ViewState>("menu");
  const [showTutorial, setShowTutorial] = useState(false);
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }
  if (!user) {
    if (authMode === "login") {
      return <LoginForm onSwitchToSignup={() => setAuthMode("signup")} />;
    } else {
      return <SignupForm onSwitchToLogin={() => setAuthMode("login")} />;
    }
  }
  const handleStartTutorial = () => {
    setShowTutorial(true);
  };
  const handleShowHistory = () => {
    setCurrentView("history");
  };
  const handleBackToMenu = () => {
    setCurrentView("menu");
  };
  const renderCurrentView = () => {
    switch (currentView) {
      case "history":
        return <GameHistory onBack={handleBackToMenu} />;
      case "menu":
      default:
        return (
          <MainMenu
            onStartTutorial={handleStartTutorial}
            onShowHistory={handleShowHistory}
          />
        );
    }
  };
  return (
    <>
      {renderCurrentView()}
      <TutorialModal
        isOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </>
  );
}
