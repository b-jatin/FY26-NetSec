'use client';

import { useState } from 'react';
import { EntryEditor } from '@/components/journal/EntryEditor';
import { AIPromptCard } from '@/components/journal/AIPromptCard';
import { AICompanion } from '@/components/journal/AICompanion';

export default function WritePage(): JSX.Element {
  const [currentText, setCurrentText] = useState('');

  return (
    <div className="max-w-6xl mx-auto">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <AIPromptCard />
          <div>
            <EntryEditor onContentChange={setCurrentText} />
          </div>
        </div>
        <div className="lg:col-span-1">
          <AICompanion currentText={currentText} />
        </div>
      </div>
    </div>
  );
}
