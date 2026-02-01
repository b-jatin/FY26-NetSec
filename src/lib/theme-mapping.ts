/**
 * Theme Mapping Dictionary
 * Maps related terms to canonical theme names for better classification
 */

export const themeMapping: Record<string, string[]> = {
  // Technology & Development
  project: [
    'project',
    'projects',
    'web app',
    'webapp',
    'application',
    'app',
    'software',
    'development',
    'code',
    'programming',
    'program',
    'website',
    'site',
    'build',
    'building',
  ],
  
  // Work & Career
  work: [
    'work',
    'job',
    'office',
    'career',
    'employment',
    'workplace',
    'boss',
    'colleague',
    'colleagues',
    'coworker',
    'coworkers',
    'manager',
    'meeting',
    'meetings',
    'deadline',
    'deadlines',
    'task',
    'tasks',
    'assignment',
    'assignments',
  ],
  
  // Family
  family: [
    'family',
    'mom',
    'dad',
    'mother',
    'father',
    'parents',
    'parent',
    'sibling',
    'siblings',
    'brother',
    'sister',
    'grandma',
    'grandpa',
    'grandmother',
    'grandfather',
    'aunt',
    'uncle',
    'cousin',
    'cousins',
  ],
  
  // Health & Fitness
  health: [
    'health',
    'exercise',
    'fitness',
    'workout',
    'workouts',
    'gym',
    'running',
    'diet',
    'nutrition',
    'yoga',
    'meditation',
    'wellness',
    'doctor',
    'medical',
    'medicine',
    'therapy',
  ],
  
  // Relationships & Social
  relationships: [
    'relationship',
    'relationships',
    'friend',
    'friends',
    'friendship',
    'friendships',
    'partner',
    'dating',
    'love',
    'boyfriend',
    'girlfriend',
    'spouse',
    'husband',
    'wife',
  ],
  
  // Education & Learning
  education: [
    'school',
    'university',
    'college',
    'study',
    'studying',
    'learning',
    'class',
    'classes',
    'homework',
    'exam',
    'exams',
    'test',
    'tests',
    'course',
    'courses',
    'student',
    'students',
    'teacher',
    'professor',
  ],
  
  // Travel & Adventure
  travel: [
    'travel',
    'trip',
    'trips',
    'vacation',
    'vacations',
    'journey',
    'journeys',
    'flight',
    'flights',
    'hotel',
    'hotels',
    'airport',
    'destination',
    'destinations',
  ],
  
  // Hobbies & Interests
  hobbies: [
    'hobby',
    'hobbies',
    'interest',
    'interests',
    'passion',
    'passions',
    'activity',
    'activities',
  ],
  
  // Food & Cooking
  food: [
    'food',
    'cooking',
    'recipe',
    'recipes',
    'meal',
    'meals',
    'restaurant',
    'restaurants',
    'dinner',
    'lunch',
    'breakfast',
    'cafe',
  ],
  
  // Finance & Money
  finance: [
    'money',
    'finance',
    'financial',
    'budget',
    'budgeting',
    'saving',
    'savings',
    'investment',
    'investments',
    'salary',
    'income',
    'expense',
    'expenses',
    'bill',
    'bills',
  ],
  
  // Home & Living
  home: [
    'home',
    'house',
    'apartment',
    'room',
    'rooms',
    'furniture',
    'decor',
    'decoration',
    'cleaning',
    'maintenance',
  ],
  
  // Entertainment & Media
  entertainment: [
    'movie',
    'movies',
    'film',
    'films',
    'tv',
    'television',
    'show',
    'shows',
    'series',
    'book',
    'books',
    'reading',
    'music',
    'song',
    'songs',
    'game',
    'games',
    'gaming',
  ],
  
  // Sports
  sports: [
    'sport',
    'sports',
    'football',
    'soccer',
    'basketball',
    'tennis',
    'baseball',
    'golf',
    'swimming',
    'cycling',
    'biking',
  ],
  
  // Pets & Animals
  pets: [
    'pet',
    'pets',
    'dog',
    'dogs',
    'cat',
    'cats',
    'animal',
    'animals',
  ],
  
  // Nature & Outdoors
  nature: [
    'nature',
    'outdoor',
    'outdoors',
    'park',
    'parks',
    'garden',
    'gardening',
    'hiking',
    'camping',
    'beach',
    'mountain',
    'mountains',
  ],
  
  // Shopping
  shopping: [
    'shopping',
    'store',
    'stores',
    'shop',
    'shops',
    'purchase',
    'purchases',
    'buy',
    'buying',
  ],
  
  // Sleep & Rest
  sleep: [
    'sleep',
    'sleeping',
    'rest',
    'nap',
    'naps',
    'bed',
    'bedtime',
    'insomnia',
  ],
  
  // Stress & Emotions
  stress: [
    'stress',
    'stressed',
    'anxiety',
    'anxious',
    'worry',
    'worries',
    'pressure',
    'tension',
    'overwhelmed',
  ],
  
  // Goals & Plans
  goals: [
    'goal',
    'goals',
    'plan',
    'plans',
    'planning',
    'objective',
    'objectives',
    'target',
    'targets',
    'aim',
    'ambition',
    'ambitions',
  ],
  
  // Time & Schedule
  time: [
    'time',
    'schedule',
    'scheduling',
    'calendar',
    'appointment',
    'appointments',
    'event',
    'events',
  ],
};

/**
 * Get canonical theme name for a given phrase
 * Returns the canonical theme if found, otherwise returns null
 */
export function getCanonicalTheme(phrase: string): string | null {
  const normalized = phrase.toLowerCase().trim();
  
  // Remove possessive determiners and articles
  const cleaned = normalized.replace(/^(my|the|a|an|this|that|these|those)\s+/i, '').trim();
  
  if (!cleaned || cleaned.length < 2) {
    return null;
  }
  
  // Check theme mapping
  for (const [canonicalTheme, variations] of Object.entries(themeMapping)) {
    for (const variation of variations) {
      const vLower = variation.toLowerCase();
      
      // Exact match (most precise)
      if (cleaned === vLower) {
        return canonicalTheme;
      }
      
      // For multi-word phrases, check if one contains the other
      // This handles "web app" matching "web app" or "my project" matching "project"
      const cleanedWords = cleaned.split(/\s+/);
      const vWords = vLower.split(/\s+/);
      
      if (cleanedWords.length > 1 || vWords.length > 1) {
        // Multi-word: check if all words from shorter phrase are in longer phrase
        const shorter = cleanedWords.length <= vWords.length ? cleanedWords : vWords;
        const longer = cleanedWords.length > vWords.length ? cleanedWords : vWords;
        
        if (shorter.every(word => longer.some(lw => lw === word || lw.includes(word) || word.includes(lw)))) {
          return canonicalTheme;
        }
      } else {
        // Single word: only match if exact or one starts with the other (for plurals/variants)
        if (cleaned.startsWith(vLower) || vLower.startsWith(cleaned)) {
          // Only if the difference is small (handles plurals like "project" vs "projects")
          if (Math.abs(cleaned.length - vLower.length) <= 2) {
            return canonicalTheme;
          }
        }
      }
    }
  }
  
  return null;
}

/**
 * Normalize a theme phrase to its canonical form
 * Returns canonical theme if found, otherwise returns cleaned original
 */
export function normalizeTheme(phrase: string): string {
  const canonical = getCanonicalTheme(phrase);
  if (canonical) {
    return canonical;
  }
  
  // Return cleaned version if no mapping found
  const normalized = phrase.toLowerCase().trim();
  return normalized.replace(/^(my|the|a|an|this|that|these|those)\s+/i, '');
}
