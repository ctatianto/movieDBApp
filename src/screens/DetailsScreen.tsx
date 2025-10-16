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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
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
    ).slice(0, 2);
  };

  const formatRuntime = (minutes: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const formatReleaseDate = (dateString: string) => {
    if (!dateString) return 'TBA';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-SG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const renderHeader = () => {
    if (!movieDetails) return null;

    const posterUrl = movieDetails.poster_path 
      ? `${API_CONFIG.IMAGE_BASE_URL}${movieDetails.poster_path}`
      : 'https://via.placeholder.com/300x450/cccccc/666666?text=No+Image';

    const director = getDirector();
    const writers = getWriters();

    return (
      <View style={styles.header}>
        {/* 1. Logo at top */}
        <View style={styles.logoSection}>
          <Image 
            source={require('../assets/Logo.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* 2. Back button + Movie title */}
        <View style={styles.titleSection}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={2}>
            {movieDetails.title}
          </Text>
        </View>

        {/* 3. Poster + Movie Details */}
        <View style={styles.posterDetailsSection}>
          <Image source={{ uri: posterUrl }} style={styles.poster} />
          
          <View style={styles.movieDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>PG</Text>
              <Text style={styles.detailValue}>{movieDetails.adult ? '18+' : 'PG-13'}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Release Date</Text>
              <Text style={styles.detailValue}>{formatReleaseDate(movieDetails.release_date)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Duration</Text>
              <Text style={styles.detailValue}>{formatRuntime(movieDetails.runtime)}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Genres</Text>
              <Text style={styles.detailValue}>
                {movieDetails.genres.map(genre => genre.name).join(', ')}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Status</Text>
              <Text style={styles.detailValue}>{movieDetails.status}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Original Language</Text>
              <Text style={styles.detailValue}>{movieDetails.original_language.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* 4. User Score + Credits (side by side) */}
        <View style={styles.scoreCreditsSection}>
          <View style={styles.userScore}>
            <View style={styles.scoreContainer}>
              <Icon name="star" size={20} color="#ffc107" />
              <Text style={styles.scoreValue}>{movieDetails.vote_average.toFixed(1)}</Text>
            </View>
            <Text style={styles.scoreLabel}>User Score</Text>
          </View>
          
          <View style={styles.credits}>
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
        </View>

        {/* 5. Tagline */}
        {movieDetails.tagline ? (
          <View style={styles.taglineSection}>
            <Text style={styles.tagline}>"{movieDetails.tagline}"</Text>
          </View>
        ) : null}

        {/* 6. Overview */}
        <View style={styles.overviewSection}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.overview}>{movieDetails.overview}</Text>
        </View>

        {/* 7. Add to Watchlist */}
        <View style={styles.watchlistSection}>
          <TouchableOpacity 
            style={[
              styles.watchlistButton,
              isInWatchlist ? styles.watchlistButtonAdded : styles.watchlistButtonAdd
            ]}
            onPress={handleAddToWatchlist}
          >
            {isInWatchlist ? (
              <Icon name="bookmark-check" size={20} color="white" />
            ) : (
              <Icon name="bookmark-outline" size={20} color="white" />
            )}
            <Text style={styles.watchlistButtonText}>
              {isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
            </Text>
          </TouchableOpacity>
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
          data={movieDetails.credits.cast.slice(0, 20)}
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
  logoSection: {
    alignItems: 'center',
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  logo: {
    width: 200,
    height: 60,
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  posterDetailsSection: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 8,
    marginRight: 16,
  },
  movieDetails: {
    flex: 1,
    justifyContent: 'space-around',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    width: 120,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  scoreCreditsSection: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  userScore: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: '#e9ecef',
    paddingRight: 16,
  },
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  scoreValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 4,
  },
  scoreLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  credits: {
    flex: 2,
    paddingLeft: 16,
  },
  creditItem: {
    marginBottom: 8,
  },
  creditRole: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
    marginBottom: 2,
  },
  creditName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  taglineSection: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tagline: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#666',
    textAlign: 'center',
    fontFamily: 'serif',
  },
  overviewSection: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
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
  watchlistSection: {
    padding: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    alignItems: 'center',
  },
  watchlistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
    minWidth: 200,
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