import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { ArrowLeft, Bookmark, BookmarkCheck, Star, Clock, Calendar, Globe } from 'lucide-react-native';
import { MovieDetails, CastMember, Movie } from '../context/types';
import { movieAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import { API_CONFIG } from '../utils/constants';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList, WatchlistStackParamList } from '../../App';

type DetailsScreenRouteProp = NativeStackScreenProps<HomeStackParamList | WatchlistStackParamList, 'Details'>['route'];
type DetailsScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList | WatchlistStackParamList>;

export const DetailsScreen: React.FC = () => {
    const route = useRoute<DetailsScreenRouteProp>();
    const navigation = useNavigation<DetailsScreenNavigationProp>();
    const { movieId } = route.params;
  
  const { state, dispatch } = useApp();
  const [movieDetails, setMovieDetails] = useState<MovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isInWatchlist = state.watchlist.some(movie => movie.id === movieId);

  useEffect(() => {
    fetchMovieDetails();
  }, [movieId]);

  const fetchMovieDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const details = await movieAPI.getMovieDetails(movieId);
      setMovieDetails(details);
    } catch (err) {
      setError('Failed to load movie details');
      console.error('Error fetching movie details:', err);
    } finally {
      setLoading(false);
    }
  };
  const handleRecommendedMoviePress = (movieId: number) => {
    navigation.push('Details', { movieId });
  };
  const handleAddToWatchlist = () => {
    if (!movieDetails) return;

    if (isInWatchlist) {
      dispatch({ type: 'REMOVE_FROM_WATCHLIST', payload: movieId });
      Alert.alert('Removed from Watchlist', `${movieDetails.title} has been removed from your watchlist.`);
    } else {
      const movie: Movie = {
        id: movieDetails.id,
        title: movieDetails.title,
        poster_path: movieDetails.poster_path,
        release_date: movieDetails.release_date,
        overview: movieDetails.overview,
        vote_average: movieDetails.vote_average,
        backdrop_path: movieDetails.backdrop_path,
      };
      dispatch({ type: 'ADD_TO_WATCHLIST', payload: movie });
      Alert.alert('Added to Watchlist', `${movieDetails.title} has been added to your watchlist.`);
    }
  };

  const getDirector = () => {
    return movieDetails?.credits?.crew.find(person => 
      person.job === 'Director'
    );
  };

  const getWriters = () => {
    return movieDetails?.credits?.crew.filter(person => 
      person.department === 'Writing'
    ).slice(0, 3);
  };

  const formatRuntime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const renderHeader = () => {
    if (!movieDetails) return null;

    const backdropUrl = movieDetails.backdrop_path 
      ? `${API_CONFIG.IMAGE_BASE_URL}${movieDetails.backdrop_path}`
      : 'https://via.placeholder.com/800x450/cccccc/666666?text=No+Image';

    const posterUrl = movieDetails.poster_path 
      ? `${API_CONFIG.IMAGE_BASE_URL}${movieDetails.poster_path}`
      : 'https://via.placeholder.com/300x450/cccccc/666666?text=No+Image';

    return (
      <View style={styles.header}>
        {/* Backdrop Image */}
        <Image source={{ uri: backdropUrl }} style={styles.backdrop} />
        
        {/* Back Button */}
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <ArrowLeft size={24} color="white" />
        </TouchableOpacity>

        {/* Poster and Basic Info */}
        <View style={styles.posterSection}>
          <Image source={{ uri: posterUrl }} style={styles.poster} />
          
          <View style={styles.basicInfo}>
            <Text style={styles.title}>{movieDetails.title}</Text>
            <Text style={styles.tagline}>{movieDetails.tagline}</Text>
            
            <View style={styles.ratingRow}>
              <View style={styles.rating}>
                <Star size={16} color="#ffc107" fill="#ffc107" />
                <Text style={styles.ratingText}>
                  {movieDetails.vote_average.toFixed(1)}
                </Text>
              </View>
              <Text style={styles.year}>
                {new Date(movieDetails.release_date).getFullYear()}
              </Text>
              <Text style={styles.certification}>
                {movieDetails.adult ? 'R' : 'PG-13'}
              </Text>
            </View>

            {/* Watchlist Button */}
            <TouchableOpacity 
              style={[
                styles.watchlistButton,
                isInWatchlist ? styles.watchlistButtonAdded : styles.watchlistButtonAdd
              ]}
              onPress={handleAddToWatchlist}
            >
              {isInWatchlist ? (
                <BookmarkCheck size={20} color="white" />
              ) : (
                <Bookmark size={20} color="white" />
              )}
              <Text style={styles.watchlistButtonText}>
                {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  const renderDetails = () => {
    if (!movieDetails) return null;

    const director = getDirector();
    const writers = getWriters();

    return (
      <View style={styles.detailsSection}>
        {/* Key Facts */}
        <View style={styles.keyFacts}>
          <View style={styles.factItem}>
            <Calendar size={16} color="#666" />
            <Text style={styles.factText}>
              {new Date(movieDetails.release_date).toLocaleDateString()}
            </Text>
          </View>
          
          <View style={styles.factItem}>
            <Clock size={16} color="#666" />
            <Text style={styles.factText}>
              {formatRuntime(movieDetails.runtime)}
            </Text>
          </View>
          
          <View style={styles.factItem}>
            <Globe size={16} color="#666" />
            <Text style={styles.factText}>
              {movieDetails.original_language.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Genres */}
        <View style={styles.genres}>
          {movieDetails.genres.map(genre => (
            <View key={genre.id} style={styles.genreTag}>
              <Text style={styles.genreText}>{genre.name}</Text>
            </View>
          ))}
        </View>

        {/* Overview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.overview}>{movieDetails.overview}</Text>
        </View>

        {/* Credits */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Credits</Text>
          {director && (
            <View style={styles.creditItem}>
              <Text style={styles.creditRole}>Director</Text>
              <Text style={styles.creditName}>{director.name}</Text>
            </View>
          )}
          {writers && writers.map((writer, index) => (
            <View key={index} style={styles.creditItem}>
              <Text style={styles.creditRole}>Writer</Text>
              <Text style={styles.creditName}>{writer.name}</Text>
            </View>
          ))}
        </View>

        {/* Status and Additional Info */}
        <View style={styles.additionalInfo}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Status:</Text>
            <Text style={styles.infoValue}>{movieDetails.status}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Original Language:</Text>
            <Text style={styles.infoValue}>
              {movieDetails.original_language.toUpperCase()}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Vote Count:</Text>
            <Text style={styles.infoValue}>{movieDetails.vote_count}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderCastCarousel = () => {
    if (!movieDetails?.credits?.cast?.length) return null;

    return (
      <View style={styles.castSection}>
        <Text style={styles.sectionTitle}>Cast</Text>
        <FlatList
          data={movieDetails.credits.cast.slice(0, 20)} // Show first 20 cast members
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <View style={styles.castCard}>
              <Image 
                source={{ 
                  uri: item.profile_path 
                    ? `${API_CONFIG.IMAGE_BASE_URL}${item.profile_path}`
                    : 'https://via.placeholder.com/100x100/cccccc/666666?text=No+Image'
                }} 
                style={styles.castImage}
              />
              <Text style={styles.castName} numberOfLines={2}>
                {item.name}
              </Text>
              <Text style={styles.castCharacter} numberOfLines={2}>
                {item.character}
              </Text>
            </View>
          )}
          contentContainerStyle={styles.castList}
        />
      </View>
    );
  };

  const renderRecommendedMovies = () => {
    if (!movieDetails?.recommendations?.results?.length) return null;

    return (
      <View style={styles.recommendedSection}>
        <Text style={styles.sectionTitle}>Recommended Movies</Text>
        <FlatList
          data={movieDetails.recommendations.results.slice(0, 10)}
          horizontal
          showsHorizontalScrollIndicator={false}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TouchableOpacity 
              style={styles.recommendedCard}
              onPress={() => handleRecommendedMoviePress(item.id)}
            >
              <Image 
                source={{ 
                  uri: item.poster_path 
                    ? `${API_CONFIG.IMAGE_BASE_URL}${item.poster_path}`
                    : 'https://via.placeholder.com/120x180/cccccc/666666?text=No+Image'
                }} 
                style={styles.recommendedImage}
              />
              <Text style={styles.recommendedTitle} numberOfLines={2}>
                {item.title}
              </Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.recommendedList}
        />
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={styles.loadingText}>Loading movie details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchMovieDetails}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (!movieDetails) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Movie not found</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.retryButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {renderHeader()}
        {renderDetails()}
        {renderCastCarousel()}
        {renderRecommendedMovies()}
      </ScrollView>
    </SafeAreaView>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#6c757d',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#dc3545',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#007bff',
    borderRadius: 6,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
  header: {
    backgroundColor: 'white',
  },
  backdrop: {
    width: '100%',
    height: 250,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  posterSection: {
    flexDirection: 'row',
    padding: 16,
    marginTop: -80,
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 8,
    marginRight: 16,
  },
  basicInfo: {
    flex: 1,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  tagline: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#666',
    marginBottom: 12,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    gap: 12,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    gap: 4,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
  },
  year: {
    fontSize: 14,
    color: '#666',
  },
  certification: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  watchlistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
    maxWidth: 200,
  },
  watchlistButtonAdd: {
    backgroundColor: '#007bff',
  },
  watchlistButtonAdded: {
    backgroundColor: '#28a745',
  },
  watchlistButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  detailsSection: {
    backgroundColor: 'white',
    padding: 16,
    marginTop: 8,
  },
  keyFacts: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  factItem: {
    alignItems: 'center',
    gap: 4,
  },
  factText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  genres: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 8,
  },
  genreTag: {
    backgroundColor: '#e9ecef',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  genreText: {
    fontSize: 12,
    color: '#495057',
    fontWeight: '500',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 12,
  },
  overview: {
    fontSize: 16,
    lineHeight: 24,
    color: '#495057',
  },
  creditItem: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  creditRole: {
    fontSize: 14,
    color: '#666',
    width: 80,
    fontWeight: '500',
  },
  creditName: {
    fontSize: 14,
    color: '#495057',
    flex: 1,
  },
  additionalInfo: {
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    width: 120,
  },
  infoValue: {
    fontSize: 14,
    color: '#495057',
    flex: 1,
  },
  castSection: {
    backgroundColor: 'white',
    padding: 16,
    marginTop: 8,
  },
  castList: {
    paddingRight: 16,
  },
  castCard: {
    width: 100,
    marginRight: 12,
    alignItems: 'center',
  },
  castImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 8,
  },
  castName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 2,
  },
  castCharacter: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
    lineHeight: 14,
  },
  recommendedSection: {
    backgroundColor: 'white',
    padding: 16,
    marginTop: 8,
    marginBottom: 20,
  },
  recommendedList: {
    paddingRight: 16,
  },
  recommendedCard: {
    width: 120,
    marginRight: 12,
  },
  recommendedImage: {
    width: 120,
    height: 180,
    borderRadius: 8,
    marginBottom: 8,
  },
  recommendedTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    lineHeight: 14,
  },
});