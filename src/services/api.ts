import axios from 'axios';
import { Movie, MovieDetails, Credits } from '../context/types';

const API_READ_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3ZjdiYzExYmFjZTZiNjM2ZGIzZDYxN2I3OWI2ZWUxNyIsIm5iZiI6MTc2MDYyOTMyNS4xMDYsInN1YiI6IjY4ZjExMjRkMWU1OTZmOWEzZTUwMzE1YyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5pPDkHM0gmZbmSySaKGz_t2BDH22c4BU981nWFxH41M';

const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  headers: {
    'Authorization': `Bearer ${API_READ_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

// Define response interfaces for pagination
export interface MoviesResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export interface SearchResponse {
  page: number;
  results: Movie[];
  total_pages: number;
  total_results: number;
}

export const movieAPI = {
  // Return full response with pagination data
  getMovies: async (category: string, page: number = 1): Promise<MoviesResponse> => {
    const response = await api.get(`/movie/${category}`, { params: { page } });
    return response.data;
  },

  // Return full response with pagination data
  searchMovies: async (query: string, page: number = 1): Promise<SearchResponse> => {
    const response = await api.get('/search/movie', { params: { query, page } });
    return response.data;
  },

  getMovieDetails: async (id: number): Promise<MovieDetails> => {
    const response = await api.get(`/movie/${id}`, {
      params: { append_to_response: 'credits,recommendations' }
    });
    return response.data;
  },

  getMovieCredits: async (id: number): Promise<Credits> => {
    const response = await api.get(`/movie/${id}/credits`);
    return response.data;
  },
};