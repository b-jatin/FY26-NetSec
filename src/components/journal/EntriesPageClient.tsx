'use client';

import { useState, useMemo } from 'react';
import { EntryList } from './EntryList';
import { SearchBar } from './SearchBar';
import { EntryFiltersComponent, type EntryFilters } from './EntryFilters';

interface Entry {
  id: string;
  content: string;
  wordCount: number;
  sentimentScore: number | null;
  sentimentLabel: string | null;
  themes: string[];
  createdAt: Date | string;
}

interface EntriesPageClientProps {
  entries: Entry[];
}

export function EntriesPageClient({ entries }: EntriesPageClientProps): JSX.Element {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<EntryFilters>({
    sentiment: undefined,
    themes: [],
    dateFrom: undefined,
    dateTo: undefined,
  });

  // Extract all unique themes from entries
  const availableThemes = useMemo(() => {
    const themeSet = new Set<string>();
    entries.forEach((entry) => {
      entry.themes.forEach((theme) => themeSet.add(theme));
    });
    return Array.from(themeSet).sort();
  }, [entries]);

  // Filter entries based on search query and filters
  const filteredEntries = useMemo(() => {
    return entries.filter((entry) => {
      // Search filter (content + themes)
      if (searchQuery.trim()) {
        const lowerQuery = searchQuery.toLowerCase();
        const matchesContent = entry.content.toLowerCase().includes(lowerQuery);
        const matchesThemes = entry.themes.some((theme) =>
          theme.toLowerCase().includes(lowerQuery)
        );
        if (!matchesContent && !matchesThemes) {
          return false;
        }
      }

      // Sentiment filter
      if (filters.sentiment && entry.sentimentLabel !== filters.sentiment) {
        return false;
      }

      // Date range filter
      const entryDate = new Date(entry.createdAt);
      if (filters.dateFrom) {
        const fromDate = new Date(filters.dateFrom);
        fromDate.setHours(0, 0, 0, 0);
        if (entryDate < fromDate) {
          return false;
        }
      }
      if (filters.dateTo) {
        const toDate = new Date(filters.dateTo);
        toDate.setHours(23, 59, 59, 999); // Include entire end date
        if (entryDate > toDate) {
          return false;
        }
      }

      // Themes filter (entry must have at least one selected theme)
      if (filters.themes.length > 0) {
        const hasMatchingTheme = filters.themes.some((theme) =>
          entry.themes.includes(theme)
        );
        if (!hasMatchingTheme) {
          return false;
        }
      }

      return true;
    });
  }, [entries, searchQuery, filters]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <SearchBar onSearch={setSearchQuery} />
        <EntryFiltersComponent
          availableThemes={availableThemes}
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>
      <EntryList entries={filteredEntries} />
    </div>
  );
}
