'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { SentimentIndicator } from './SentimentIndicator';
import { analyzeSentiment, type SentimentResult } from '@/lib/sentiment';
import { useDebounce } from '@/hooks/use-debounce';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';

interface EntryEditorProps {
  initialContent?: string;
  entryId?: string;
  onContentChange?: (content: string) => void;
  onEntrySaved?: (entryId: string) => void;
  allowAI?: boolean;
}

export function EntryEditor({ initialContent = '', entryId, onContentChange, onEntrySaved, allowAI = true }: EntryEditorProps): JSX.Element {
  const [content, setContent] = useState(initialContent);
  const [sentiment, setSentiment] = useState<SentimentResult | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  // Notify parent of initial content
  useEffect(() => {
    if (initialContent && onContentChange) {
      onContentChange(initialContent);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run on mount to set initial content

  // Real-time sentiment analysis (only if AI features are enabled)
  useEffect(() => {
    if (allowAI && content.trim().length > 0) {
      const result = analyzeSentiment(content);
      setSentiment(result);
    } else {
      setSentiment(null);
    }
  }, [content, allowAI]);

  const handleSave = async () => {
    if (!content.trim()) {
      toast({
        title: 'Error',
        description: 'Please write something before saving',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);

    try {
      const url = entryId ? `/api/entries/${entryId}` : '/api/entries';
      const method = entryId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMsg = errorData.details 
          ? `${errorData.error}: ${errorData.details}`
          : errorData.error || `Failed to save entry: ${response.status} ${response.statusText}`;
        throw new Error(errorMsg);
      }

      const data = await response.json();

      toast({
        title: 'Success',
        description: entryId ? 'Entry updated successfully' : 'Entry saved successfully',
      });

      // Notify parent component
      if (onEntrySaved && data.entry?.id) {
        onEntrySaved(data.entry.id);
      }

      if (!entryId) {
        router.push(`/entries/${data.entry.id}`);
      } else {
        router.refresh();
      }
    } catch (error) {
      console.error('Save error:', error);
      let errorMessage = 'Failed to save entry';
      
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Write Entry</h2>
        <div className="flex items-center gap-4">
          {allowAI && <SentimentIndicator sentiment={sentiment} allowAI={allowAI} />}
          <Button onClick={handleSave} disabled={isSaving || !content.trim()}>
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : entryId ? 'Update' : 'Save'}
          </Button>
        </div>
      </div>
      <Textarea
        value={content}
        onChange={(e) => {
          setContent(e.target.value);
          onContentChange?.(e.target.value);
        }}
        placeholder="Start writing your thoughts..."
        className="min-h-[400px] text-lg"
      />
      <div className="text-sm text-muted-foreground">
        {content.split(/\s+/).filter(Boolean).length} words
      </div>
    </div>
  );
}
