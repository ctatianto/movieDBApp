export interface Movie {
    id: number;
    title: string;
    poster_path: string | null;
    release_date: string;
    overview: string;
    vote_average: number;
    backdrop_path?: string;
  }
  
  export interface MovieDetails extends Movie {
    runtime: number;
    genres: Genre[];
    status: string;
    original_language: string;
    vote_count: number;
    tagline: string;
    credits?: Credits;
    recommendations?: Movie[];
  }
  
  export interface Genre {
    id: number;
    name: string;
  }
  
  export interface Credits {
    cast: CastMember[];
    crew: CrewMember[];
  }
  
  export interface CastMember {
    id: number;
    name: string;
    character: string;
    profile_path: string | null;
  }
  
  export interface CrewMember {
    id: number;
    name: string;
    job: string;
    department: string;
  }
  
  export type MovieCategory = 'now_playing' | 'upcoming' | 'popular';
  export type SortOption = 'title' | 'rating' | 'release_date';
  export type SortOrder = 'asc' | 'desc';
  
  export interface AppState {
    movies: Movie[];
    watchlist: Movie[];
    category: MovieCategory;
    sortBy: SortOption;
    sortOrder: SortOrder;
    loading: boolean;
    error: string | null;
  }
  
  export type AppAction =
    | { type: 'SET_MOVIES'; payload: Movie[] }
    | { type: 'SET_LOADING'; payload: boolean }
    | { type: 'SET_ERROR'; payload: string | null }
    | { type: 'SET_CATEGORY'; payload: MovieCategory }
    | { type: 'SET_SORT'; payload: { sortBy: SortOption; sortOrder: SortOrder } }
    | { type: 'ADD_TO_WATCHLIST'; payload: Movie }
    | { type: 'REMOVE_FROM_WATCHLIST'; payload: number }
    | { type: 'SET_WATCHLIST'; payload: Movie[] };