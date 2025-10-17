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
  Animated,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MovieDetails, CastMember, Movie } from '../context/types';
import { movieAPI } from '../services/api';
import { useApp } from '../context/AppContext';
import { API_CONFIG } from '../utils/constants';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { HomeStackParamList, WatchlistStackParamList } from '../../App';
import { HeaderWithLogo } from '../components/common/HeaderWithLogo';

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

  const getScoreColor = (percentage: number) => {
    if (percentage >= 70) return '#45ff8f'; // Green for high scores
    if (percentage >= 50) return '#ffc107'; // Yellow for medium scores
    return '#ff4757'; // Red for low scores
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
    
    // Format as MM/DD/YYYY
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    
    return `${month}/${day}/${year}`;
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
      <HeaderWithLogo />
        <View style={styles.titleSection}>
          <TouchableOpacity 
            onPress={() => navigation.goBack()}
          >
            <Image 
          source={require('../assets/BackButton.png')} 
          style={styles.backButton}
          resizeMode="contain"
        />
          </TouchableOpacity>
          <Text style={styles.title} numberOfLines={2}>
            {movieDetails.title}
          </Text>
        </View>

        {/* Poster and Movie Details - Blue background */}
        <View style={styles.posterDetailsSection}>
          <Image source={{ uri: posterUrl }} style={styles.poster} />
          
          <View style={styles.movieDetails}>
            <View style={styles.detailRow}>
              <Text style={styles.detailValue}>{movieDetails.adult ? '18+' : 'PG-13'}</Text>
            </View>
            
            <View style={styles.detailRow}>
  <View style={styles.dateDurationContainer}>
    <Text style={styles.detailValue}>{formatReleaseDate(movieDetails.release_date)}</Text>
    <Text style={styles.dotSeparator}>•</Text>
    <Text style={styles.detailValue}>{formatRuntime(movieDetails.runtime)}</Text>
  </View>
</View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailValue}>
                {movieDetails.genres.map(genre => genre.name).join(', ')}
              </Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailValue}>{movieDetails.status}</Text>
            </View>
            
            <View style={styles.detailRow}>
              <Text style={styles.detailValue}>{movieDetails.original_language.toUpperCase()}</Text>
            </View>
          </View>
        </View>

        {/* User Score + Credits - Blue background */}
        <View style={styles.scoreCreditsSection}>
        <View style={styles.userScore}>
  <View style={styles.circularScoreContainer}>
    <View style={styles.circularScoreBackground} />
    
    {/* Fixed circular progress using clip method */}
    <View style={styles.circularScoreWrapper}>
      <View style={[
        styles.circularScoreFill,
        { 
          width: movieDetails.vote_average * 10 >= 50 ? '100%' : '50%',
          height: '100%',
          backgroundColor: movieDetails.vote_average * 10 >= 50 ? '#45ff8f' : 'transparent'
        }
      ]}>
        {movieDetails.vote_average * 10 < 50 && (
          <View style={[
            styles.circularScoreFill,
            { 
              width: '100%', 
              height: `${(movieDetails.vote_average * 10) * 2}%`,
              backgroundColor: '#45ff8f'
            }
          ]} />
        )}
      </View>
    </View>
    
    <View style={styles.circularScoreInner}>
      <Text style={styles.circularScoreValue}>
        {Math.round(movieDetails.vote_average * 10)}%
      </Text>
    </View>
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

        {/* Tagline - Blue background */}
        {movieDetails.tagline ? (
          <View style={styles.taglineSection}>
            <Text style={styles.tagline}>"{movieDetails.tagline}"</Text>
          </View>
        ) : null}

        {/* Overview - Blue background */}
        <View style={styles.overviewSection}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.overview}>{movieDetails.overview}</Text>
        </View>

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

  // ... rest of the component (castCarousel, recommendedMovies, etc.) remains the same
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
                    : 'https://via.placeholder.com/138x175/cccccc/666666?text=No+Image'
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
              <View style={styles.backdropContainer}>
                <Image 
                  source={{ 
                    uri: item.backdrop_path 
                      ? `${API_CONFIG.IMAGE_BASE_URL}${item.backdrop_path}`
                      : item.poster_path
                        ? `${API_CONFIG.IMAGE_BASE_URL}${item.poster_path}`
                        : 'https://via.placeholder.com/300x169/cccccc/666666?text=No+Image'
                  }} 
                  style={styles.recommendedBackdrop}
                />
                <View style={styles.backdropOverlay}>
                  <View style={styles.ratingContainer}>
                    <Icon name="star" size={14} color="#ffc107" />
                    <Text style={styles.recommendedRating}>
                      {item.vote_average * 10} %
                    </Text>
                  </View>
                </View>
              </View>
              <Text style={styles.recommendedTitle} numberOfLines={2}>
                {item.title}
              </Text>
              <Text style={styles.recommendedYear}>
                {item.release_date ? new Date(item.release_date).getFullYear() : 'TBA'}
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
    backgroundColor: '#00B4E4',
  },
  titleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#0099c2',
  },
  backButton: {
    width: 35,
    height: 35,
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 100,
  },
  posterDetailsSection: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#0099c2',
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
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  dateDurationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  dotSeparator: {
    fontSize: 16,
    color: '#fff',
    marginHorizontal: 8,
    fontWeight: 'bold',
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.8)',
    width: 120,
  },
  detailValue: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '500',
    flex: 1,
    textAlign: 'left',
  },
  scoreCreditsSection: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#00B4E4',
  },
  userScore: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(255, 255, 255, 0.3)',
    paddingRight: 16,
  },
  circularScoreContainer: {
    width: 60,
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: 8,
  },
  circularScoreBackground: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 30,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  circularScoreWrapper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 30,
    overflow: 'hidden',
  },
  circularScoreFill: {
    position: 'absolute',
    borderRadius: 30,
  },
  circularScoreInner: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#00B4E4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circularScoreValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  scoreLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  circularScoreHalf: {
    position: 'absolute',
    width: '50%',
    height: '100%',
    overflow: 'hidden',
  },
  circularScoreLeft: {
    left: 0,
  },
  circularScoreRight: {
    right: 0,
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
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    marginBottom: 2,
  },
  creditName: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
  },
  taglineSection: {
    padding: 16,
    backgroundColor: '#00B4E4',
  },
  tagline: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#fff',
    textAlign: 'center',
    fontFamily: 'serif',
  },
  overviewSection: {
    padding: 16,
    backgroundColor: '#00B4E4',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 12,
  },
  overview: {
    fontSize: 16,
    lineHeight: 24,
    color: '#fff',
  },
  watchlistSection: {
    padding: 16,
    backgroundColor: '#00B4E4',
    paddingBottom: 24,
  },
  watchlistButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
    minWidth: 200,
    borderWidth: 2,
    borderColor: '#fff',
    alignSelf: 'flex-start',
  },
  watchlistButtonAdd: {
    backgroundColor: '#00B4E4',
  },
  watchlistButtonAdded: {
    backgroundColor: '#00B4E4',
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
    width: 138,
    marginRight: 12,
    alignItems: 'center',
  },
  castImage: {
    width: 138,
    height: 175,
    borderRadius: 8,
    marginBottom: 8,
  },
  castName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1a1a1a',
    textAlign: 'center',
    marginBottom: 2,
    lineHeight: 18,
  },
  castCharacter: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 16,
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
    width: 280,
    marginRight: 16,
  },
  backdropContainer: {
    position: 'relative',
    marginBottom: 8,
  },
  recommendedBackdrop: {
    width: '100%',
    height: 157, // 16:9 aspect ratio (280 / 1.78 = 157)
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  backdropOverlay: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recommendedRating: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
    marginLeft: 4,
  },
  recommendedTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
    lineHeight: 18,
  },
  recommendedYear: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});