import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../utils/constants';
import { Movie, MovieCategory, SortOption, SortOrder } from '../context/types';

export const storage = {
  // Category
  setCategory: async (category: MovieCategory): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.CATEGORY, category);
    } catch (error) {
      console.error('Error saving category:', error);
    }
  },

  getCategory: async (): Promise<MovieCategory> => {
    try {
      const category = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORY);
      return (category as MovieCategory) || 'popular';
    } catch (error) {
      console.error('Error loading category:', error);
      return 'popular';
    }
  },

  // Sort Preferences
  setSortPreferences: async (sortBy: SortOption, sortOrder: SortOrder): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SORT_BY, sortBy);
      await AsyncStorage.setItem(STORAGE_KEYS.SORT_ORDER, sortOrder);
    } catch (error) {
      console.error('Error saving sort preferences:', error);
    }
  },

  getSortPreferences: async (): Promise<{ sortBy: SortOption; sortOrder: SortOrder }> => {
    try {
      const [sortBy, sortOrder] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.SORT_BY),
        AsyncStorage.getItem(STORAGE_KEYS.SORT_ORDER),
      ]);
      
      return {
        sortBy: (sortBy as SortOption) || 'release_date',
        sortOrder: (sortOrder as SortOrder) || 'desc',
      };
    } catch (error) {
      console.error('Error loading sort preferences:', error);
      return {
        sortBy: 'release_date',
        sortOrder: 'desc',
      };
    }
  },

  // Watchlist
  setWatchlist: async (watchlist: Movie[]): Promise<void> => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.WATCHLIST, JSON.stringify(watchlist));
    } catch (error) {
      console.error('Error saving watchlist:', error);
    }
  },

  getWatchlist: async (): Promise<Movie[]> => {
    try {
      const watchlist = await AsyncStorage.getItem(STORAGE_KEYS.WATCHLIST);
      return watchlist ? JSON.parse(watchlist) : [];
    } catch (error) {
      console.error('Error loading watchlist:', error);
      return [];
    }
  },

  // Clear all storage (useful for debugging)
  clearAll: async (): Promise<void> => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  },
};