'use client';

import { OnboardingModal } from './OnboardingModal';
import { useOnboarding } from '@/hooks/use-onboarding';
import { useState } from 'react';

export function OnboardingWrapper(): JSX.Element {
  const { isOnboardingOpen, completeOnboarding, isLoading } = useOnboarding();
  const [allowAI, setAllowAI] = useState(true);
  const [allowAnalytics, setAllowAnalytics] = useState(true);

  const handleSettingsChange = async (ai: boolean, analytics: boolean): Promise<void> => {
    setAllowAI(ai);
    setAllowAnalytics(analytics);
    
    // Save privacy settings immediately
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          privacySettings: {
            allowAI: ai,
            allowAnalytics: analytics,
          },
        }),
      });
      
      if (!response.ok) {
        console.error('Failed to save privacy settings');
      }
    } catch (error) {
      console.error('Error saving privacy settings:', error);
    }
  };

  const handleComplete = async (): Promise<void> => {
    await completeOnboarding();
  };

  if (isLoading) {
    return <></>;
  }

  return (
    <OnboardingModal
      open={isOnboardingOpen}
      onComplete={handleComplete}
      initialAllowAI={allowAI}
      initialAllowAnalytics={allowAnalytics}
      onSettingsChange={handleSettingsChange}
    />
  );
}
