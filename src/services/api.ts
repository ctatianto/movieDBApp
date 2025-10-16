import axios from 'axios';
import { Movie, MovieDetails, Credits } from '../context/types';

const API_READ_ACCESS_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI3ZjdiYzExYmFjZTZiNjM2ZGIzZDYxN2I3OWI2ZWUxNyIsIm5iZiI6MTc2MDYyOTMyNS4xMDYsInN1YiI6IjY4ZjExMjRkMWU1OTZmOWEzZTUwMzE1YyIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.5pPDkHM0gmZbmSySaKGz_t2BDH22c4BU981nWFxH41M'; // Replace with actual token

const api = axios.create({
  baseURL: 'https://api.themoviedb.org/3',
  headers: {
    'Authorization': `Bearer ${API_READ_ACCESS_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

export const movieAPI = {
  getMovies: async (category: string, page: number = 1): Promise<Movie[]> => {
    const response = await api.get(`/movie/${category}`, { params: { page } });
    return response.data.results;
  },

  searchMovies: async (query: string, page: number = 1): Promise<Movie[]> => {
    const response = await api.get('/search/movie', { params: { query, page } });
    return response.data.results;
  },

  // Update the getMovieDetails function
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