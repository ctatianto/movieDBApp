import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AppState, AppAction, Movie, MovieCategory, SortOption, SortOrder } from './types';
import { storage } from '../services/storage';

const initialState: AppState = {
  movies: [],
  watchlist: [],
  category: 'popular',
  sortBy: 'release_date',
  sortOrder: 'desc',
  loading: false,
  error: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_MOVIES':
      return { ...state, movies: action.payload, loading: false, error: null };
    
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_CATEGORY':
      return { ...state, category: action.payload };
    
    case 'SET_SORT':
      return { ...state, sortBy: action.payload.sortBy, sortOrder: action.payload.sortOrder };
    

    case 'ADD_TO_WATCHLIST':
      const updatedWatchlist = [...state.watchlist, action.payload];
      storage.setWatchlist(updatedWatchlist);
      return { ...state, watchlist: updatedWatchlist };

    case 'REMOVE_FROM_WATCHLIST':
      const filteredWatchlist = state.watchlist.filter(movie => movie.id !== action.payload);
      storage.setWatchlist(filteredWatchlist);
      return { ...state, watchlist: filteredWatchlist };

    case 'SET_WATCHLIST':
      return { ...state, watchlist: action.payload };
    
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [category, sortPrefs, watchlist] = await Promise.all([
        storage.getCategory(),
        storage.getSortPreferences(),
        storage.getWatchlist(),
      ]);

      dispatch({ type: 'SET_CATEGORY', payload: category });
      dispatch({ type: 'SET_SORT', payload: sortPrefs });
      dispatch({ type: 'SET_WATCHLIST', payload: watchlist });
    } catch (error) {
      console.error('Error loading initial data:', error);
    }
  };

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};