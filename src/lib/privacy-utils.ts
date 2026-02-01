import { prisma } from './prisma';

export interface PrivacySettings {
  allowAI: boolean;
  allowAnalytics: boolean;
}

/**
 * Get user's current privacy settings
 */
export async function getUserPrivacySettings(userId: string): Promise<PrivacySettings> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { privacySettings: true },
  });

  const defaultSettings: PrivacySettings = {
    allowAI: true,
    allowAnalytics: true,
  };

  if (!user || !user.privacySettings) {
    return defaultSettings;
  }

  const currentSettings = user.privacySettings as Record<string, any>;
  return {
    allowAI: currentSettings.allowAI !== false,
    allowAnalytics: currentSettings.allowAnalytics !== false,
  };
}
