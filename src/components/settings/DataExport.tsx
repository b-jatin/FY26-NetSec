'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Download } from 'lucide-react';

interface DataExportProps {
  userId: string;
}

export function DataExport({ userId }: DataExportProps): JSX.Element {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await fetch('/api/user/export');
      if (!response.ok) throw new Error('Failed to export data');

      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `mindfulspace-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Success',
        description: 'Data exported successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to export data',
        variant: 'destructive',
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div>
      <p className="text-sm text-muted-foreground mb-4">
        Download all your journal entries, analyses, and summaries as a JSON file.
      </p>
      <Button onClick={handleExport} disabled={isExporting}>
        <Download className="mr-2 h-4 w-4" />
        {isExporting ? 'Exporting...' : 'Export My Data'}
      </Button>
    </div>
  );
}
