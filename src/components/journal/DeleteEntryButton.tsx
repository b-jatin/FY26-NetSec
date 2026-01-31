'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Trash2 } from 'lucide-react';

interface DeleteEntryButtonProps {
  entryId: string;
}

export function DeleteEntryButton({ entryId }: DeleteEntryButtonProps): JSX.Element {
  const router = useRouter();
  const { toast } = useToast();

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this entry?')) {
      return;
    }

    try {
      const response = await fetch(`/api/entries/${entryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete entry');

      toast({
        title: 'Success',
        description: 'Entry deleted successfully',
      });

      router.push('/entries');
      router.refresh();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete entry',
        variant: 'destructive',
      });
    }
  };

  return (
    <Button onClick={handleDelete} variant="destructive">
      <Trash2 className="mr-2 h-4 w-4" />
      Delete
    </Button>
  );
}
