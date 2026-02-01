'use client';

import { useState } from 'react';
import useSWR from 'swr';
import { EntryEditor } from '@/components/journal/EntryEditor';
import { AIPromptCard } from '@/components/journal/AIPromptCard';
import { AICompanion } from '@/components/journal/AICompanion';

interface PrivacySettings {
  allowAI?: boolean;
  allowAnalytics?: boolean;
}

const fetcher = async (url: string): Promise<PrivacySettings> => {
  const res = await fetch(url, { credentials: 'include' });
  if (!res.ok) {
    throw new Error('Failed to fetch preferences');
  }
  const data = await res.json();
  return data.privacySettings || { allowAI: true, allowAnalytics: true };
};

export default function WritePage(): JSX.Element {
  const [currentText, setCurrentText] = useState('');
  const [promptRefreshTrigger, setPromptRefreshTrigger] = useState<number>(Date.now());

  // Fetch user's current privacy settings
  const { data: privacySettings } = useSWR<PrivacySettings>(
    '/api/user/preferences',
    fetcher,
    {
      revalidateOnFocus: false,
      fallbackData: { allowAI: true, allowAnalytics: true },
    }
  );

  const allowAI = privacySettings?.allowAI !== false;

  const handleEntrySaved = (entryId: string) => {
    // Trigger prompt refresh by updating the trigger timestamp
    setPromptRefreshTrigger(Date.now());
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          {allowAI && <AIPromptCard refreshTrigger={promptRefreshTrigger} allowAI={allowAI} />}
          <div>
            <EntryEditor 
              onContentChange={setCurrentText} 
              onEntrySaved={handleEntrySaved}
              allowAI={allowAI}
            />
          </div>
        </div>
        <div className="lg:col-span-1">
          {allowAI && <AICompanion currentText={currentText} allowAI={allowAI} />}
        </div>
      </div>
    </div>
  );
}
