/**
 * Navigation Config Utility
 * Reads nav visibility config from localStorage (set by admin dashboard)
 * Applies across web and mobile platforms
 */

export interface NavConfig {
  dashboard?: boolean;
  profile?: boolean;
  leaderboard?: boolean;
  events?: boolean;
  quizzes?: boolean;
  library?: boolean;
  sports?: boolean;
  scanQr?: boolean;
  info?: boolean;
}

const DEFAULT_NAV_CONFIG: NavConfig = {
  dashboard: true,      // maps to 'home' in web
  profile: true,
  leaderboard: true,
  events: true,
  quizzes: true,
  library: true,
  sports: true,
  scanQr: true,
  info: true,
};

/**
 * Get the current nav config from localStorage
 * Falls back to DEFAULT_NAV_CONFIG if not set or invalid
 */
export function getNavConfig(): NavConfig {
  try {
    const stored = localStorage.getItem('admin-nav-config');
    if (stored) {
      const parsed = JSON.parse(stored);
      // Merge with defaults to handle missing keys
      return { ...DEFAULT_NAV_CONFIG, ...parsed };
    }
  } catch (error) {
    console.error('Failed to parse nav config from localStorage:', error);
  }
  return DEFAULT_NAV_CONFIG;
}

/**
 * Check if a nav item should be visible
 */
export function isNavItemVisible(key: keyof NavConfig): boolean {
  const config = getNavConfig();
  return config[key] !== false;
}

/**
 * Listen for nav config changes
 * Useful for real-time updates when admin changes settings
 */
export function onNavConfigChange(callback: (config: NavConfig) => void): () => void {
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === 'admin-nav-config' && e.newValue) {
      try {
        const config = JSON.parse(e.newValue);
        callback({ ...DEFAULT_NAV_CONFIG, ...config });
      } catch (error) {
        console.error('Failed to parse nav config change:', error);
      }
    }
  };

  window.addEventListener('storage', handleStorageChange);
  
  // Return unsubscribe function
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
}

/**
 * Reset nav config to defaults
 * (Usually called by admin dashboard)
 */
export function resetNavConfig(): void {
  localStorage.removeItem('admin-nav-config');
}
