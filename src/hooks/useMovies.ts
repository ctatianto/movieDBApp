import { useState, useCallback } from 'react';
import { movieAPI } from '../services/api';
import { storage } from '../services/storage';
import { Movie, MovieCategory, SortOption, SortOrder } from '../context/types';
import { useApp } from '../context/AppContext';

export const useMovies = () => {
  const { state, dispatch } = useApp();
  const [searchQuery, setSearchQuery] = useState('');

  const fetchMovies = useCallback(async (category: MovieCategory) => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const movies = await movieAPI.getMovies(category);
      dispatch({ type: 'SET_MOVIES', payload: movies });
    } catch (error) {
      console.error('Error fetching movies:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch movies' });
    }
  }, [dispatch]);

  const searchMovies = useCallback(async (query: string) => {
    if (!query.trim()) {
      fetchMovies(state.category);
      return;
    }

    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const movies = await movieAPI.searchMovies(query);
      dispatch({ type: 'SET_MOVIES', payload: movies });
      setSearchQuery(query);
    } catch (error) {
      console.error('Error searching movies:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to search movies' });
    }
  }, [dispatch, state.category, fetchMovies]);

  const setCategory = useCallback(async (category: MovieCategory) => {
    dispatch({ type: 'SET_CATEGORY', payload: category });
    await storage.setCategory(category);
    fetchMovies(category);
  }, [dispatch, fetchMovies]);

  const setSort = useCallback(async (sortBy: SortOption, sortOrder: SortOrder) => {
    dispatch({ type: 'SET_SORT', payload: { sortBy, sortOrder } });
    await storage.setSortPreferences(sortBy, sortOrder);
  }, [dispatch]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    fetchMovies(state.category);
  }, [fetchMovies, state.category]);

  return {
    movies: state.movies,
    loading: state.loading,
    error: state.error,
    category: state.category,
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
    searchQuery,
    fetchMovies,
    searchMovies,
    setCategory,
    setSort,
    setSearchQuery,
    clearSearch,
  };
};