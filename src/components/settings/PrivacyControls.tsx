'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Shield, Brain, BarChart3 } from 'lucide-react';

interface User {
  id: string;
  privacySettings: any;
}

interface PrivacyControlsProps {
  user: User;
}

export function PrivacyControls({ user }: PrivacyControlsProps): JSX.Element {
  const [allowAI, setAllowAI] = useState(
    user.privacySettings?.allowAI !== false
  );
  const [allowAnalytics, setAllowAnalytics] = useState(
    user.privacySettings?.allowAnalytics !== false
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast, dismiss } = useToast();
  const router = useRouter();
  const pathname = usePathname();
  const prevPathnameRef = useRef<string>(pathname);
  const dismissRef = useRef(dismiss);

  // Keep dismiss ref updated
  useEffect(() => {
    dismissRef.current = dismiss;
  }, [dismiss]);

  // Sync state with user prop when it changes
  useEffect(() => {
    setAllowAI(user.privacySettings?.allowAI !== false);
    setAllowAnalytics(user.privacySettings?.allowAnalytics !== false);
  }, [user.privacySettings]);

  // Dismiss all toasts when navigating away (only when pathname actually changes)
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      dismissRef.current();
      prevPathnameRef.current = pathname;
    }
  }, [pathname]);

  const updateSetting = async (setting: string, value: boolean) => {
    setIsUpdating(true);
    try {
      const currentSettings = (user.privacySettings as Record<string, any>) || {};
      const response = await fetch('/api/user/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          privacySettings: {
            ...currentSettings,
            [setting]: value,
          },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to update setting');
      }

      const data = await response.json();
      
      // Update local state immediately
      if (setting === 'allowAI') {
        setAllowAI(value);
      } else if (setting === 'allowAnalytics') {
        setAllowAnalytics(value);
      }

      // Show toast first with 1 second duration
      const toastResult = toast({
        title: 'Success',
        description: 'Privacy setting updated',
      });
      
      // Auto-dismiss after 1 second
      setTimeout(() => {
        toastResult.dismiss();
      }, 1000);

      // Refresh the page data after a short delay to allow toast to show
      setTimeout(() => {
        router.refresh();
      }, 100);
    } catch (error) {
      // Revert state on error
      if (setting === 'allowAI') {
        setAllowAI(!value);
      } else if (setting === 'allowAnalytics') {
        setAllowAnalytics(!value);
      }
      
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update setting',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="allow-ai" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Allow AI Features
          </Label>
          <p className="text-sm text-muted-foreground">
            Enable AI-powered prompts, suggestions, and summaries
          </p>
        </div>
        <Switch
          id="allow-ai"
          checked={allowAI}
          disabled={isUpdating}
          onCheckedChange={(checked) => {
            updateSetting('allowAI', checked);
          }}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="allow-analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Allow Analytics
          </Label>
          <p className="text-sm text-muted-foreground">
            Enable sentiment analysis and theme tracking
          </p>
        </div>
        <Switch
          id="allow-analytics"
          checked={allowAnalytics}
          disabled={isUpdating}
          onCheckedChange={(checked) => {
            updateSetting('allowAnalytics', checked);
          }}
        />
      </div>

      <div className="rounded-lg bg-muted p-4">
        <div className="flex items-start gap-2">
          <Shield className="h-5 w-5 text-primary mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Privacy First</p>
            <p className="text-xs text-muted-foreground">
              All AI features use PII masking. Your personal information is never sent to external services without masking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
