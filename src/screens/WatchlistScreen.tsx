import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Image,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { CompositeNavigationProp } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { ChevronLeft, Filter, X, ArrowUp, ArrowDown, User, Calendar } from 'lucide-react-native';
import { RootStackParamList, HomeTabParamList } from '../../App';
import { useApp } from '../context/AppContext';
import { Movie } from '../context/types';
import { Dropdown } from '../components/common/Dropdown';
import { API_CONFIG } from '../utils/constants';
import { HeaderWithLogo } from '../components/common/HeaderWithLogo';

// Define the composite navigation prop type
type WatchlistScreenNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<RootStackParamList>,
  BottomTabNavigationProp<HomeTabParamList>
>;

export const WatchlistScreen: React.FC = () => {
  const navigation = useNavigation<WatchlistScreenNavigationProp>();
  const { state, dispatch } = useApp();
  
  const [sortBy, setSortBy] = useState<'title' | 'rating' | 'release_date'>('title');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  // Mock user data (in a real app, this would come from user profile)
  const userData = {
    username: 'MovieLover123',
    joinedDate: '2024-01-15',
  };

  const sortOptions = [
    { label: 'Alphabetical', value: 'title' as const },
    { label: 'Rating', value: 'rating' as const },
    { label: 'Release Date', value: 'release_date' as const },
  ];

  const getSortedWatchlist = () => {
    if (!state.watchlist.length) return [];

    const sortedMovies = [...state.watchlist].sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'rating':
          aValue = a.vote_average;
          bValue = b.vote_average;
          break;
        case 'release_date':
          aValue = new Date(a.release_date).getTime();
          bValue = new Date(b.release_date).getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return sortedMovies;
  };

  const handleRemoveFromWatchlist = (movie: Movie) => {
    Alert.alert(
      'Remove from Watchlist',
      `Are you sure you want to remove "${movie.title}" from your watchlist?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Remove', 
          style: 'destructive',
          onPress: () => {
            dispatch({ type: 'REMOVE_FROM_WATCHLIST', payload: movie.id });
          }
        },
      ]
    );
  };

  const handleMoviePress = (movie: Movie) => {
    navigation.navigate('Details', { movieId: movie.id });
  };

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  const formatJoinDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Fix: Proper navigation to Home tab
  const handleExplorePress = () => {
    // Navigate to the Home tab using the tab navigator
    navigation.navigate('Home');
  };

  const handleGoBack = () => {
    navigation.goBack();
  };

  const renderMovieItem = ({ item }: { item: Movie }) => {
    const posterUrl = item.poster_path 
      ? `${API_CONFIG.IMAGE_BASE_URL}${item.poster_path}`
      : 'https://via.placeholder.com/100x150/cccccc/666666?text=No+Image';

    return (
      <TouchableOpacity 
        style={styles.movieCard}
        onPress={() => handleMoviePress(item)}
      >
        <Image source={{ uri: posterUrl }} style={styles.poster} />
        
        <View style={styles.movieInfo}>
          <Text style={styles.movieTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.releaseDate}>
            {new Date(item.release_date).getFullYear()}
          </Text>
          <Text style={styles.overview} numberOfLines={3}>
            {item.overview}
          </Text>
          <View style={styles.ratingContainer}>
            <Text style={styles.rating}>
              ★ {item.vote_average.toFixed(1)}
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.removeButton}
          onPress={() => handleRemoveFromWatchlist(item)}
        >
          <Image 
          source={require('../assets/DeleteButton.png')} 
          style={styles.removeButton}
          resizeMode="contain"
        />

        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <HeaderWithLogo />
      {/* User Profile Section */}
      <View style={styles.userSection}>
  <View style={styles.backButtonRow}>
    <TouchableOpacity 
      style={styles.avatarBackButton}
      onPress={handleGoBack}
    >
       <Image 
          source={require('../assets/BackButton.png')} 
          style={styles.avatarBackButton}
          resizeMode="contain"
        />
    </TouchableOpacity>
  </View>
  
  {/* Avatar and User Info Row */}
  <View style={styles.userInfoRow}>
    <View style={styles.avatar}>
      <User size={24} color="#666" />
    </View>
    <View style={styles.userInfo}>
      <Text style={styles.username}>{userData.username}</Text>
      <View style={styles.joinDate}>
        <Text style={styles.joinDateText}>
          Member since {formatJoinDate(userData.joinedDate)}
        </Text>
      </View>
    </View>
  </View>
</View>

      {/* Stats and Filter Section */}
      <View style={styles.statsFilterSection}>
        <View style={styles.stats}>
          <Text style={styles.movieCount}>
            {state.watchlist.length} {state.watchlist.length === 1 ? 'movie' : 'movies'}
          </Text>
          <Text style={styles.statsLabel}>in watchlist</Text>
        </View>

        {/* Filter Dropdown */}
        <View style={styles.filterContainer}>
          <TouchableOpacity 
            style={styles.filterButton}
            onPress={() => setShowFilterDropdown(!showFilterDropdown)}
          >
            <Text style={styles.filterButtonText}>Filter by</Text>
          </TouchableOpacity>

          {showFilterDropdown && (
            <View style={styles.filterDropdown}>
              <View style={styles.sortSection}>
                <Text style={styles.filterLabel}>Sort By</Text>
                <Dropdown
                  options={sortOptions}
                  selectedValue={sortBy}
                  onSelect={(value) => setSortBy(value as any)}
                />
              </View>
              
              <View style={styles.sortOrderSection}>
                <Text style={styles.filterLabel}>Order</Text>
                <TouchableOpacity 
                  style={styles.sortOrderButton}
                  onPress={toggleSortOrder}
                >
                  {sortOrder === 'asc' ? (
                    <Image 
                    source={require('../assets/AscArrow.png')} 
                    style={styles.sortingButton}
                    resizeMode="contain"
                  />
                  ) : (
                    <Image 
          source={require('../assets/DescArrow.png')} 
          style={styles.sortingButton}
          resizeMode="contain"
        />
                  )}
                  <Text style={styles.sortOrderText}>
                    {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity 
                style={styles.closeFilterButton}
                onPress={() => setShowFilterDropdown(false)}
              >
                <Text style={styles.closeFilterText}>Close</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Current Sort Info */}
      <View style={styles.currentSortInfo}>
        <Text style={styles.currentSortText}>
          Sorted by: {sortOptions.find(opt => opt.value === sortBy)?.label} ({sortOrder === 'asc' ? 'A-Z' : 'Z-A'})
        </Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <View style={styles.emptyIcon}>
        <User size={64} color="#ccc" />
      </View>
      <Text style={styles.emptyStateTitle}>Your watchlist is empty</Text>
      <Text style={styles.emptyStateText}>
        Start building your watchlist by adding movies from the Home screen.
      </Text>
      <TouchableOpacity 
        style={styles.exploreButton}
        onPress={handleExplorePress}
      >
        <Text style={styles.exploreButtonText}>Explore Movies</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <FlatList
        data={getSortedWatchlist()}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderMovieItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmptyState}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        stickyHeaderIndices={[0]}
      />
    </SafeAreaView>
  );
};

// ... keep the same styles from previous implementation ...
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  userSection: {
    backgroundColor: '#042541',
    marginBottom: 20,
    padding: 20,
    paddingBottom:40,
  },
  backButtonRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  avatarBackButton: {
    marginLeft:-10,
    width: 35,
    height: 35,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#e9ecef',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 4,
  },
  joinDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  joinDateText: {
    fontSize: 14,
    color: 'white',
  },
  statsFilterSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stats: {
    alignItems: 'flex-start',
  },
  movieCount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007bff',
  },
  statsLabel: {
    fontSize: 14,
    color: '#666',
  },
  filterContainer: {
    position: 'relative',
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 6,
  },
  filterButtonText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  filterDropdown: {
    position: 'absolute',
    top: '100%',
    right: 0,
    width: 200,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#e9ecef',
    zIndex: 1000,
  },
  sortSection: {
    marginBottom: 12,
  },
  sortOrderSection: {
    marginBottom: 12,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 6,
  },
  sortOrderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    gap: 8,
  },
  sortOrderText: {
    fontSize: 14,
    color: '#333',
  },
  closeFilterButton: {
    backgroundColor: '#00b4e4',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  sortingButton: {
    width: 16,
    height: 16,
  },
  closeFilterText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  currentSortInfo: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  currentSortText: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
  },
  movieCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginVertical: 6,
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  poster: {
    width: 80,
    height: 120,
    borderRadius: 6,
  },
  movieInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  movieTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  releaseDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
  },
  overview: {
    fontSize: 12,
    color: '#777',
    lineHeight: 16,
    marginBottom: 8,
  },
  ratingContainer: {
    alignSelf: 'flex-start',
  },
  rating: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffc107',
    backgroundColor: '#fff9e6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  removeButton: {
    width: 22,
    height: 22,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 400,
  },
  emptyIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6c757d',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#adb5bd',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
  },
  exploreButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#007bff',
    borderRadius: 6,
  },
  exploreButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});