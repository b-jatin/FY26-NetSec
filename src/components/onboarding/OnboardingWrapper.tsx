'use client';

// OnboardingWrapper - Currently not in use
// TODO: Implement OnboardingModal component if needed
import { useOnboarding } from '@/hooks/use-onboarding';

export function OnboardingWrapper(): JSX.Element {
  const { isLoading } = useOnboarding();

  if (isLoading) {
    return <></>;
  }

  // OnboardingModal component not yet implemented
  // Return empty fragment for now
  return <></>;
}
