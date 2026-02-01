'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import { Filter, X, Calendar } from 'lucide-react';
import { format } from 'date-fns';

export interface EntryFilters {
  sentiment?: 'very happy' | 'happy' | 'neutral' | 'sad' | 'depressed';
  themes: string[];
  dateFrom?: string;
  dateTo?: string;
}

interface EntryFiltersProps {
  availableThemes: string[];
  filters: EntryFilters;
  onFiltersChange: (filters: EntryFilters) => void;
}

const sentimentLabels: Record<string, string> = {
  'very happy': 'Very Happy',
  'happy': 'Happy',
  'neutral': 'Neutral',
  'sad': 'Sad',
  'depressed': 'Depressed',
};

export function EntryFiltersComponent({
  availableThemes,
  filters,
  onFiltersChange,
}: EntryFiltersProps): JSX.Element {
  const [selectedThemes, setSelectedThemes] = useState<string[]>(filters.themes || []);

  const handleSentimentChange = (sentiment: 'very happy' | 'happy' | 'neutral' | 'sad' | 'depressed' | 'all'): void => {
    onFiltersChange({
      ...filters,
      sentiment: sentiment === 'all' ? undefined : sentiment,
    });
  };

  const handleThemeToggle = (theme: string): void => {
    const newThemes = selectedThemes.includes(theme)
      ? selectedThemes.filter((t) => t !== theme)
      : [...selectedThemes, theme];
    setSelectedThemes(newThemes);
    onFiltersChange({
      ...filters,
      themes: newThemes,
    });
  };

  const handleDateFromChange = (date: string): void => {
    onFiltersChange({
      ...filters,
      dateFrom: date || undefined,
    });
  };

  const handleDateToChange = (date: string): void => {
    onFiltersChange({
      ...filters,
      dateTo: date || undefined,
    });
  };

  const handleClearAll = (): void => {
    setSelectedThemes([]);
    onFiltersChange({
      sentiment: undefined,
      themes: [],
      dateFrom: undefined,
      dateTo: undefined,
    });
  };

  const activeFilterCount =
    (filters.sentiment ? 1 : 0) +
    filters.themes.length +
    (filters.dateFrom ? 1 : 0) +
    (filters.dateTo ? 1 : 0);

  return (
    <div className="flex flex-wrap items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Sentiment
            {filters.sentiment && (
              <span className="ml-2 rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-xs">
                {sentimentLabels[filters.sentiment]}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          <DropdownMenuLabel>Filter by Sentiment</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleSentimentChange('all')}>
            All Sentiments
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          {(['very happy', 'happy', 'neutral', 'sad', 'depressed'] as const).map((sentiment) => (
            <DropdownMenuItem
              key={sentiment}
              onClick={() => handleSentimentChange(sentiment)}
            >
              {sentimentLabels[sentiment]}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {availableThemes.length > 0 && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              Themes
              {selectedThemes.length > 0 && (
                <span className="ml-2 rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-xs">
                  {selectedThemes.length}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Filter by Themes</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {availableThemes.map((theme) => (
              <DropdownMenuCheckboxItem
                key={theme}
                checked={selectedThemes.includes(theme)}
                onCheckedChange={() => handleThemeToggle(theme)}
              >
                {theme}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      <div className="flex items-center gap-2">
        <input
          type="date"
          value={filters.dateFrom || ''}
          onChange={(e) => handleDateFromChange(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="From date"
        />
        <span className="text-muted-foreground">to</span>
        <input
          type="date"
          value={filters.dateTo || ''}
          onChange={(e) => handleDateToChange(e.target.value)}
          className="h-9 rounded-md border border-input bg-background px-3 py-2 text-sm"
          placeholder="To date"
        />
      </div>

      {activeFilterCount > 0 && (
        <Button variant="ghost" size="sm" onClick={handleClearAll}>
          <X className="h-4 w-4 mr-2" />
          Clear ({activeFilterCount})
        </Button>
      )}
    </div>
  );
}
