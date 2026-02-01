'use client';

import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Shield, Brain, BarChart3 } from 'lucide-react';

interface AuthPrivacyControlsProps {
  allowAI: boolean;
  allowAnalytics: boolean;
  onAllowAIChange: (value: boolean) => void;
  onAllowAnalyticsChange: (value: boolean) => void;
}

export function AuthPrivacyControls({
  allowAI,
  allowAnalytics,
  onAllowAIChange,
  onAllowAnalyticsChange,
}: AuthPrivacyControlsProps): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="auth-allow-ai" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Allow AI Features
          </Label>
          <p className="text-sm text-muted-foreground">
            Enable AI-powered writing inspiration, AI companion
          </p>
        </div>
        <Switch
          id="auth-allow-ai"
          checked={allowAI}
          onCheckedChange={onAllowAIChange}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="auth-allow-analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Allow Analytics
          </Label>
          <p className="text-sm text-muted-foreground">
            Enable summaries, sentiment and theme tracking
          </p>
        </div>
        <Switch
          id="auth-allow-analytics"
          checked={allowAnalytics}
          onCheckedChange={onAllowAnalyticsChange}
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
