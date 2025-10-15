export const CATEGORIES = [
    { label: 'Now Playing', value: 'now_playing' as const },
    { label: 'Upcoming', value: 'upcoming' as const },
    { label: 'Popular', value: 'popular' as const },
  ];
  
  export const SORT_OPTIONS = [
    { label: 'Alphabetical', value: 'title' as const },
    { label: 'Rating', value: 'rating' as const },
    { label: 'Release Date', value: 'release_date' as const },
  ];
  
  export const STORAGE_KEYS = {
    CATEGORY: 'movie_app_category',
    SORT_BY: 'movie_app_sort_by',
    SORT_ORDER: 'movie_app_sort_order',
    WATCHLIST: 'movie_app_watchlist',
    SEARCH_QUERY: 'movie_app_search_query',
  };
  
  export const API_CONFIG = {
    BASE_URL: 'https://api.themoviedb.org/3',
    IMAGE_BASE_URL: 'https://image.tmdb.org/t/p/w500',
  };
  
  export const ERROR_MESSAGES = {
    FETCH_MOVIES: 'Failed to load movies. Please check your connection.',
    SEARCH_MOVIES: 'Failed to search movies. Please try again.',
    MOVIE_DETAILS: 'Failed to load movie details.',
    NETWORK_ERROR: 'Network error. Please check your internet connection.',
    UNKNOWN_ERROR: 'An unexpected error occurred.',
  };