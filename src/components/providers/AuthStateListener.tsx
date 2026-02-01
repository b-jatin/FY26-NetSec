'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { clearAllCache } from '@/lib/cache-utils';

/**
 * AuthStateListener
 * CRITICAL: Monitors auth state changes and clears cache to prevent cross-user data leakage
 * This ensures that when a user logs out or a new user logs in, all cached data is cleared
 */
export function AuthStateListener(): JSX.Element {
  const router = useRouter();

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      // Clear cache on sign out or when session changes
      if (event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        clearAllCache();
      }

      // If user signs in, clear any stale cache from previous session
      if (event === 'SIGNED_IN' && session) {
        clearAllCache();
        // Refresh to ensure fresh data loads
        router.refresh();
      }

      // If token is refreshed, ensure cache is still valid
      if (event === 'TOKEN_REFRESHED') {
        // Optionally clear cache on token refresh to ensure fresh data
        // This is more aggressive but ensures no stale data
        clearAllCache();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  return <></>;
}
