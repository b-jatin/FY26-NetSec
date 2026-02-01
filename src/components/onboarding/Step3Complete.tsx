'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase';

interface Step3CompleteProps {
  onComplete: () => void | Promise<void>;
  onBack: () => void;
}

export function Step3Complete({ onComplete, onBack }: Step3CompleteProps): JSX.Element {
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const supabase = createSupabaseBrowserClient();
        const { data: { user } } = await supabase.auth.getUser();
        setIsAuthenticated(!!user);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  const checkAuthAndNavigate = async (path: string): Promise<void> => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    try {
      // Complete onboarding first (this will close the modal)
      await onComplete();
      
      const supabase = createSupabaseBrowserClient();
      const { data: { user } } = await supabase.auth.getUser();
      
      // Small delay to ensure modal closes before navigation
      await new Promise(resolve => setTimeout(resolve, 150));
      
      if (user) {
        // User is logged in, navigate to the requested page
        router.push(path);
      } else {
        // User is not logged in, redirect to signup
        router.push('/signup');
      }
    } catch (error) {
      console.error('Error checking auth:', error);
      // On error, redirect to signup
      router.push('/signup');
    } finally {
      setIsNavigating(false);
    }
  };

  const handleStartWriting = async (): Promise<void> => {
    await checkAuthAndNavigate('/write');
  };

  const handleExploreDashboard = async (): Promise<void> => {
    await checkAuthAndNavigate('/dashboard');
  };

  const handleGetStarted = async (): Promise<void> => {
    if (isNavigating) return;
    
    setIsNavigating(true);
    try {
      // Complete onboarding first (this will close the modal)
      await onComplete();
      
      // Small delay to ensure modal closes before navigation
      await new Promise(resolve => setTimeout(resolve, 150));
      
      // Redirect to signup
      router.push('/signup');
    } catch (error) {
      console.error('Error completing onboarding:', error);
      router.push('/signup');
    } finally {
      setIsNavigating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <div className="flex justify-center mb-4">
          <div className="rounded-full bg-primary/10 p-4">
            <CheckCircle2 className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h2 className="text-2xl font-bold">You&apos;re All Set!</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          You&apos;re ready to start your journaling journey. Write your first entry and discover insights about yourself.
        </p>
      </div>

      <div className="space-y-3 pt-4">
        {isAuthenticated ? (
          <>
            <Button 
              onClick={handleStartWriting} 
              className="w-full" 
              size="lg"
              disabled={isNavigating}
            >
              Start Writing
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={handleExploreDashboard}
              className="w-full"
              disabled={isNavigating}
            >
              Explore Dashboard
            </Button>
          </>
        ) : (
          <>
            <Button 
              onClick={handleGetStarted} 
              className="w-full" 
              size="lg"
              disabled={isNavigating}
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                await onComplete();
                await new Promise(resolve => setTimeout(resolve, 150));
                router.push('/login');
              }}
              className="w-full"
              disabled={isNavigating}
            >
              Sign In
            </Button>
          </>
        )}
        <div className="flex justify-start pt-2">
          <Button
            variant="ghost"
            onClick={onBack}
            disabled={isNavigating}
          >
            Back
          </Button>
        </div>
      </div>
    </div>
  );
}
