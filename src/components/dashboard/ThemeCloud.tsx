'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tag } from 'lucide-react';

interface Entry {
  themes: string[];
}

interface ThemeCloudProps {
  entries: Entry[];
}

export function ThemeCloud({ entries }: ThemeCloudProps): JSX.Element {
  const themeFrequency: Record<string, number> = {};
  entries.forEach((entry) => {
    entry.themes.forEach((theme) => {
      themeFrequency[theme] = (themeFrequency[theme] || 0) + 1;
    });
  });

  const sortedThemes = Object.entries(themeFrequency)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20);

  if (sortedThemes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Themes</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No themes identified yet</p>
        </CardContent>
      </Card>
    );
  }

  const maxFrequency = Math.max(...sortedThemes.map(([, freq]) => freq));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Themes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {sortedThemes.map(([theme, frequency]) => {
            const size = Math.max(12, (frequency / maxFrequency) * 24);
            return (
              <span
                key={theme}
                className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-sm"
                style={{ fontSize: `${size}px` }}
              >
                <Tag className="h-3 w-3" />
                {theme} ({frequency})
              </span>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
