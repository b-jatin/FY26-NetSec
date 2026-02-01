'use client';

import { Shield, Brain, BarChart3 } from 'lucide-react';

export function AuthPrivacyInfo(): JSX.Element {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <Brain className="h-4 w-4 mt-0.5 text-muted-foreground" />
        <div className="space-y-0.5">
          <p className="text-sm font-medium">AI Features</p>
          <p className="text-xs text-muted-foreground">
            Enable AI-powered writing inspiration, AI companion
          </p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <BarChart3 className="h-4 w-4 mt-0.5 text-muted-foreground" />
        <div className="space-y-0.5">
          <p className="text-sm font-medium">Analytics</p>
          <p className="text-xs text-muted-foreground">
            Enable summaries, sentiment and theme tracking
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-muted p-4">
        <div className="flex items-start gap-2">
          <Shield className="h-5 w-5 text-primary mt-0.5" />
          <div className="space-y-1">
            <p className="text-sm font-medium">Privacy First</p>
            <p className="text-xs text-muted-foreground">
              All AI features use PII masking. Your personal information is never sent to external services without masking. You can adjust these settings anytime in your account settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
