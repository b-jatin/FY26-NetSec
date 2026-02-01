'use client';

import { useState, useEffect } from 'react';

interface UseOnboardingReturn {
    isOnboardingOpen: boolean;
    completeOnboarding: () => Promise<void>;
    isLoading: boolean;
}

export function useOnboarding(): UseOnboardingReturn {
    const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function checkOnboardingStatus(): Promise<void> {
            try {
                const response = await fetch('/api/user/preferences');
                if (response.ok) {
                    const data = await response.json();
                    const onboardingCompleted = data.onboardingCompleted ?? false;
                    setIsOnboardingOpen(!onboardingCompleted);
                } else {
                    // If error, assume not completed to show onboarding
                    setIsOnboardingOpen(true);
                }
            } catch (error) {
                console.error('Error checking onboarding status:', error);
                // On error, assume not completed
                setIsOnboardingOpen(true);
            } finally {
                setIsLoading(false);
            }
        }

        checkOnboardingStatus();
    }, []);

    const completeOnboarding = async (): Promise<void> => {
        try {
            const response = await fetch('/api/user/preferences', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    onboardingCompleted: true,
                }),
            });

            if (response.ok) {
                setIsOnboardingOpen(false);
            } else {
                console.error('Failed to complete onboarding');
            }
        } catch (error) {
            console.error('Error completing onboarding:', error);
        }
    };

    return {
        isOnboardingOpen,
        completeOnboarding,
        isLoading,
    };
}
