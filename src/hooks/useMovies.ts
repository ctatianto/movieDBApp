import { useState, useCallback } from 'react';
import { movieAPI } from '../services/api';
import { storage } from '../services/storage';
import { Movie, MovieCategory, SortOption, SortOrder } from '../context/types';
import { useApp } from '../context/AppContext';

export const useMovies = () => {
  const { state, dispatch } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchMovies = useCallback(async (category: MovieCategory, page: number = 1) => {
    try {
      if (page === 1) {
        dispatch({ type: 'SET_LOADING', payload: true });
      } else {
        setLoadingMore(true);
      }
      
      const response = await movieAPI.getMovies(category, page);
      const { results: movies, total_pages, page: currentPage } = response;
      
      if (page === 1) {
        dispatch({ type: 'SET_MOVIES', payload: movies });
      } else {
        // Append new movies to existing ones
        const updatedMovies = [...state.movies, ...movies];
        dispatch({ type: 'SET_MOVIES', payload: updatedMovies });
      }
      
      setCurrentPage(currentPage);
      setTotalPages(total_pages);
      setHasMore(currentPage < total_pages);
      
    } catch (error) {
      console.error('Error fetching movies:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch movies' });
    } finally {
      if (page === 1) {
        dispatch({ type: 'SET_LOADING', payload: false });
      } else {
        setLoadingMore(false);
      }
    }
  }, [dispatch, state.movies]);

  const searchMovies = useCallback(async (query: string, page: number = 1) => {
    if (!query.trim()) {
      fetchMovies(state.category, 1);
      return;
    }

    try {
      if (page === 1) {
        dispatch({ type: 'SET_LOADING', payload: true });
      } else {
        setLoadingMore(true);
      }
      
      const response = await movieAPI.searchMovies(query, page);
      const { results: movies, total_pages, page: currentPage } = response;
      
      if (page === 1) {
        dispatch({ type: 'SET_MOVIES', payload: movies });
      } else {
        // Append new movies to existing ones
        const updatedMovies = [...state.movies, ...movies];
        dispatch({ type: 'SET_MOVIES', payload: updatedMovies });
      }
      
      setCurrentPage(currentPage);
      setTotalPages(total_pages);
      setHasMore(currentPage < total_pages);
      setSearchQuery(query);
      
    } catch (error) {
      console.error('Error searching movies:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to search movies' });
    } finally {
      if (page === 1) {
        dispatch({ type: 'SET_LOADING', payload: false });
      } else {
        setLoadingMore(false);
      }
    }
  }, [dispatch, state.movies, state.category, fetchMovies]);

  const setCategory = useCallback(async (category: MovieCategory) => {
    dispatch({ type: 'SET_CATEGORY', payload: category });
    await storage.setCategory(category);
    // Reset to page 1 when category changes
    setCurrentPage(1);
    setHasMore(false);
    fetchMovies(category, 1);
  }, [dispatch, fetchMovies]);

  const setSort = useCallback(async (sortBy: SortOption, sortOrder: SortOrder) => {
    dispatch({ type: 'SET_SORT', payload: { sortBy, sortOrder } });
    await storage.setSortPreferences(sortBy, sortOrder);
  }, [dispatch]);

  const clearSearch = useCallback(() => {
    setSearchQuery('');
    setCurrentPage(1);
    setHasMore(false);
    fetchMovies(state.category, 1);
  }, [fetchMovies, state.category]);

  // Load more function for explicit pagination
  const loadMoreMovies = useCallback(async () => {
    if (!loadingMore && hasMore) {
      const nextPage = currentPage + 1;
      if (searchQuery) {
        await searchMovies(searchQuery, nextPage);
      } else {
        await fetchMovies(state.category, nextPage);
      }
    }
  }, [loadingMore, hasMore, currentPage, searchQuery, searchMovies, fetchMovies, state.category]);

  return {
    movies: state.movies,
    loading: state.loading,
    loadingMore,
    error: state.error,
    category: state.category,
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
    searchQuery,
    currentPage,
    totalPages,
    hasMore,
    fetchMovies,
    searchMovies,
    setCategory,
    setSort,
    setSearchQuery,
    clearSearch,
    loadMoreMovies,
  };
};