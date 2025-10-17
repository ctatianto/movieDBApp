import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Keyboard,
  Image,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMovies } from '../hooks/useMovies';
import { MovieCard } from '../components/movie/MovieCard';
import { Dropdown } from '../components/common/Dropdown';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { CATEGORIES, SORT_OPTIONS } from '../utils/constants';
import { Movie } from '../context/types';
import { HomeStackParamList } from '../../App';
import { HeaderWithLogo } from '../components/common/HeaderWithLogo';

type HomeScreenNavigationProp = NativeStackNavigationProp<HomeStackParamList>;

export const HomeScreen: React.FC = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const {
    movies,
    loading,
    error,
    category,
    sortBy,
    sortOrder,
    searchQuery,
    fetchMovies,
    searchMovies,
    setCategory,
    setSort,
    setSearchQuery,
    clearSearch,
    // Add these to your useMovies hook or implement locally
    loadMoreMovies,
    hasMore,
    loadingMore,
    currentPage,
    totalPages,
  } = useMovies();

  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!isSearching) {
      fetchMovies(category, 1); // Reset to page 1 when category changes
    }
  }, [category, isSearching]);

  const handleSearch = () => {
    Keyboard.dismiss();
    setIsSearching(!!localSearchQuery.trim());
    searchMovies(localSearchQuery, 1); // Reset to page 1 when searching
  };

  const handleClearSearch = () => {
    setLocalSearchQuery('');
    setSearchQuery('');
    setIsSearching(false);
    fetchMovies(category, 1);
  };

  const handleMoviePress = (movie: Movie) => {
    navigation.navigate('Details', { movieId: movie.id });
  };

  // Load more function
  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      if (isSearching) {
        searchMovies(searchQuery, currentPage + 1);
      } else {
        fetchMovies(category, currentPage + 1);
      }
    }
  };

  const getSortedMovies = () => {
    if (!movies.length) return [];

    const sortedMovies = [...movies].sort((a, b) => {
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

  // Render load more button
  const renderLoadMoreButton = () => {
    if (!hasMore || getSortedMovies().length === 0) return null;
  
    return (
      <View style={styles.loadMoreContainer}>
        <TouchableOpacity 
          style={styles.loadMoreButton}
          onPress={handleLoadMore}
          disabled={loadingMore}
        >
          {loadingMore ? (
            <View style={styles.loadingContent}>
              <ActivityIndicator size="small" color="#ffffff" />
              <Text style={styles.loadMoreButtonText}>Loading...</Text>
            </View>
          ) : (
            <Text style={styles.loadMoreButtonText}>
              Load More
            </Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <HeaderWithLogo />
      {/* Now Playing Dropdown */}
      <View style={styles.filterSection}>
        <Dropdown
          options={CATEGORIES}
          selectedValue={category}
          onSelect={(value) => {
            setCategory(value as any);
            setIsSearching(false);
            setLocalSearchQuery('');
          }}
          placeholder="Select Category"
        />
      </View>

      {/* Sort By Dropdown */}
      <View style={styles.filterSection}>
        <Dropdown
          options={SORT_OPTIONS}
          selectedValue={sortBy}
          onSelect={(value) => setSort(value as any, sortOrder)}
          placeholder="Sort by"
        />
      </View>

      {/* Search Field - Same width as dropdowns */}
      <View style={styles.filterSection}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor="#999"
            value={localSearchQuery}
            onChangeText={setLocalSearchQuery}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* Search Button - Below search field, same width */}
      <View>
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.searchButtonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Results Info */}
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          {isSearching 
            ? `Search results for "${searchQuery}"`
            : ``
          }
        </Text>
        {localSearchQuery ? (
          <TouchableOpacity onPress={handleClearSearch}>
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Text style={styles.emptyStateTitle}>
        {isSearching ? 'No movies found' : 'No movies available'}
      </Text>
      <Text style={styles.emptyStateText}>
        {isSearching 
          ? 'Try different search terms'
          : 'Check back later for new movies'
        }
      </Text>
      {isSearching && (
        <TouchableOpacity style={styles.emptyStateButton} onPress={handleClearSearch}>
          <Text style={styles.emptyStateButtonText}>Clear Search</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <ErrorMessage 
          message={error}
          onRetry={() => isSearching ? searchMovies(searchQuery, 1) : fetchMovies(category, 1)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {loading && movies.length === 0 ? (
        <LoadingSpinner message="Loading movies..." />
      ) : (
        <FlatList
          data={getSortedMovies()}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <MovieCard movie={item} onPress={handleMoviePress} />
          )}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderLoadMoreButton}
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          style={styles.list}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  filterSection: {
    marginBottom: 16,
  },
  searchInputContainer: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    paddingHorizontal: 16,
    height: 44,
  },
  searchInput: {
    height: 42,
    fontSize: 16,
    color: '#333',
  },
  searchButton: {
    backgroundColor: '#F5F5F5',
    paddingVertical: 8,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
  },
  searchButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  resultsText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
  },
  resultsCount: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
    marginLeft: 12,
  },
  clearText: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '500',
    marginLeft: 12,
  },
  paginationInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  paginationText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  moreAvailableText: {
    fontSize: 12,
    color: '#28a745',
    fontWeight: '500',
  },
  loadMoreContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  loadMoreButton: {
    backgroundColor: '#00b4e4',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    // Make button stretch full width
    width: '100%',
    minHeight: 54,
  },
  loadMoreButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 300,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyStateButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007bff',
    borderRadius: 8,
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
});