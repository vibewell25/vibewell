import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define type for user preferences
interface UserPreferences {
  // App appearance and behavior
  theme: 'light' | 'dark' | 'system';
  fontSize: 'small' | 'medium' | 'large';
  reducedAnimations: boolean;
  highContrast: boolean;
  
  // Notifications and communication
  emailNotifications: boolean;
  pushNotifications: boolean;
  smsNotifications: boolean;
  
  // Content preferences
  contentCategories: string[];
  favoriteProducts: string[];
  recentlyViewed: string[];
  
  // Privacy settings
  shareUsageData: boolean;
  locationTracking: boolean;
  cookiePreferences: {
    necessary: boolean;
    analytics: boolean;
    marketing: boolean;
    preferences: boolean;
  };
  
  // Beauty specific preferences
  skinType: string;
  skinConcerns: string[];
  hairType: string;
  makeupStyle: string;
  interestedServices: string[];
  
  // Personalization features
  recommendationsEnabled: boolean;
  primaryGoal: string;
  
  // Feature flags (for beta features)
  betaFeatures: Record<string, boolean>;
}

// Default preferences
const defaultPreferences: UserPreferences = {
  theme: 'system',
  fontSize: 'medium',
  reducedAnimations: false,
  highContrast: false,
  
  emailNotifications: true,
  pushNotifications: false,
  smsNotifications: false,
  
  contentCategories: [],
  favoriteProducts: [],
  recentlyViewed: [],
  
  shareUsageData: true,
  locationTracking: false,
  cookiePreferences: {
    necessary: true,
    analytics: true,
    marketing: false,
    preferences: true,
  },
  
  skinType: '',
  skinConcerns: [],
  hairType: '',
  makeupStyle: '',
  interestedServices: [],
  
  recommendationsEnabled: true,
  primaryGoal: '',
  
  betaFeatures: {}
};

// Interface for the context
interface UserPreferencesContextValue {
  preferences: UserPreferences;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
  updatePreference: <K extends keyof UserPreferences>(
    key: K, 
    value: UserPreferences[K]
  ) => Promise<void>;
  updateMultiplePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  resetToDefaults: () => Promise<void>;
  addToRecentlyViewed: (itemId: string) => void;
  addToFavorites: (productId: string) => void;
  removeFromFavorites: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  toggleBetaFeature: (featureKey: string) => void;
  hasBetaFeature: (featureKey: string) => boolean;
}

// Create the context
const UserPreferencesContext = createContext<UserPreferencesContextValue | undefined>(undefined);

// Props for the provider
interface UserPreferencesProviderProps {
  children: ReactNode;
  userId?: string;
  initialPreferences?: Partial<UserPreferences>;
}

/**
 * Provider component for user preferences and personalization settings
 */
export function UserPreferencesProvider({
  children,
  userId,
  initialPreferences = {}
}: UserPreferencesProviderProps) {
  // State for preferences and loading state
  const [preferences, setPreferences] = useState<UserPreferences>({
    ...defaultPreferences,
    ...initialPreferences
  });
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  
  // Load preferences from API and/or local storage
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        setIsLoading(true);
        
        if (userId) {
          // If logged in, load from API
          const response = await fetch(`/api/users/${userId}/preferences`);
          
          if (response.ok) {
            const data = await response.json();
            setPreferences(prev => ({
              ...prev,
              ...data
            }));
            
            // Check if onboarding is completed
            setHasCompletedOnboarding(!!data.onboardingCompleted);
          }
        } else {
          // Otherwise load from local storage
          const storedPrefs = localStorage.getItem('user_preferences');
          
          if (storedPrefs) {
            setPreferences(prev => ({
              ...prev,
              ...JSON.parse(storedPrefs)
            }));
            
            // Check local onboarding status
            setHasCompletedOnboarding(
              localStorage.getItem('onboarding_completed') === 'true'
            );
          }
        }
      } catch (error) {
        console.error("Failed to load user preferences:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadPreferences();
  }, [userId]);
  
  // Save preferences to storage when they change
  useEffect(() => {
    if (isLoading) return; // Don't save during initial load
    
    const savePreferences = async () => {
      try {
        if (userId) {
          // Save to API for logged in users
          await fetch(`/api/users/${userId}/preferences`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(preferences),
          });
        } else {
          // Save to local storage for anonymous users
          localStorage.setItem('user_preferences', JSON.stringify(preferences));
        }
      } catch (error) {
        console.error("Failed to save user preferences:", error);
      }
    };
    
    savePreferences();
  }, [preferences, userId, isLoading]);
  
  // Update a single preference
  const updatePreference = async <K extends keyof UserPreferences>(
    key: K, 
    value: UserPreferences[K]
  ) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  // Update multiple preferences at once
  const updateMultiplePreferences = async (updates: Partial<UserPreferences>) => {
    setPreferences(prev => ({
      ...prev,
      ...updates
    }));
  };
  
  // Reset preferences to defaults
  const resetToDefaults = async () => {
    setPreferences(defaultPreferences);
  };
  
  // Add an item to recently viewed
  const addToRecentlyViewed = (itemId: string) => {
    setPreferences(prev => {
      // Remove the item if already exists to avoid duplicates
      const filteredItems = prev.recentlyViewed.filter(id => id !== itemId);
      
      // Add the item to the start of the array and limit to 20 items
      return {
        ...prev,
        recentlyViewed: [itemId, ...filteredItems].slice(0, 20)
      };
    });
  };
  
  // Add a product to favorites
  const addToFavorites = (productId: string) => {
    setPreferences(prev => {
      if (prev.favoriteProducts.includes(productId)) return prev;
      
      return {
        ...prev,
        favoriteProducts: [...prev.favoriteProducts, productId]
      };
    });
  };
  
  // Remove a product from favorites
  const removeFromFavorites = (productId: string) => {
    setPreferences(prev => ({
      ...prev,
      favoriteProducts: prev.favoriteProducts.filter(id => id !== productId)
    }));
  };
  
  // Check if a product is in favorites
  const isFavorite = (productId: string) => {
    return preferences.favoriteProducts.includes(productId);
  };
  
  // Toggle a beta feature on/off
  const toggleBetaFeature = (featureKey: string) => {
    setPreferences(prev => ({
      ...prev,
      betaFeatures: {
        ...prev.betaFeatures,
        [featureKey]: !prev.betaFeatures[featureKey]
      }
    }));
  };
  
  // Check if a beta feature is enabled
  const hasBetaFeature = (featureKey: string) => {
    return !!preferences.betaFeatures[featureKey];
  };
  
  // Context value
  const value: UserPreferencesContextValue = {
    preferences,
    isLoading,
    hasCompletedOnboarding,
    updatePreference,
    updateMultiplePreferences,
    resetToDefaults,
    addToRecentlyViewed,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    toggleBetaFeature,
    hasBetaFeature
  };
  
  return (
    <UserPreferencesContext.Provider value={value}>
      {children}
    </UserPreferencesContext.Provider>
  );
}

/**
 * Hook to use user preferences
 * 
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { preferences, updatePreference } = useUserPreferences();
 *   
 *   return (
 *     <div>
 *       <h2>Theme: {preferences.theme}</h2>
 *       <button onClick={() => updatePreference('theme', 'dark')}>
 *         Dark Mode
 *       </button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useUserPreferences() {
  const context = useContext(UserPreferencesContext);
  
  if (context === undefined) {
    throw new Error('useUserPreferences must be used within a UserPreferencesProvider');
  }
  
  return context;
}

export default UserPreferencesProvider; 