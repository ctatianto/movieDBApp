import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  SafeAreaView,
  StatusBar,
  Keyboard,
} from 'react-native';
import { Search, Filter, ArrowUp, ArrowDown } from 'lucide-react-native';
import { useMovies } from '../hooks/useMovies';
import { MovieCard } from '../components/movie/MovieCard';
import { Dropdown } from '../components/common/Dropdown';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { CATEGORIES, SORT_OPTIONS } from '../utils/constants';
import { Movie } from '../context/types';
import { useApp } from '../context/AppContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../App';

// Update the props interface
interface HomeScreenProps {
    // No need for navigation prop since we'll use useNavigation hook
  }

export const HomeScreen: React.FC<HomeScreenProps> = () => {
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
  } = useMovies();

  const navigation = useNavigation<NativeStackNavigationProp<HomeStackParamList>>();
  

  const { state } = useApp();
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    // Load movies when component mounts
    if (state.movies.length === 0 && !loading && !error) {
      fetchMovies(category);
    }
  }, []);

  const handleSearch = () => {
    Keyboard.dismiss();
    setIsSearching(!!localSearchQuery.trim());
    searchMovies(localSearchQuery);
  };

  const handleClearSearch = () => {
    setLocalSearchQuery('');
    clearSearch(); // Use the clearSearch from useMovies hook
  };

  const handleMoviePress = (movie: Movie) => {
    navigation.navigate('Details', { movieId: movie.id });
  };

  const handleSortOrderToggle = () => {
    const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
    setSort(sortBy, newSortOrder);
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

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.title}>Movie Database</Text>
      
      {/* Category Dropdown */}
      <View style={styles.filterRow}>
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Category</Text>
          <Dropdown
            options={CATEGORIES}
            selectedValue={category}
            onSelect={(value) => {
              setCategory(value as any);
              setIsSearching(false);
              setLocalSearchQuery('');
            }}
          />
        </View>

        {/* Sort Options */}
        <View style={styles.filterContainer}>
          <Text style={styles.filterLabel}>Sort By</Text>
          <View style={styles.sortRow}>
            <View style={styles.sortDropdown}>
              <Dropdown
                options={SORT_OPTIONS}
                selectedValue={sortBy}
                onSelect={(value) => setSort(value as any, sortOrder)}
              />
            </View>
            <TouchableOpacity
              style={styles.sortOrderButton}
              onPress={handleSortOrderToggle}
            >
              {sortOrder === 'asc' ? (
                <ArrowUp size={20} color="#666" />
              ) : (
                <ArrowDown size={20} color="#666" />
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Search Section */}
      <View style={styles.searchSection}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search for movies..."
          value={localSearchQuery}
          onChangeText={setLocalSearchQuery}
          onSubmitEditing={handleSearch}
          returnKeyType="search"
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Search size={20} color="white" />
        </TouchableOpacity>
      </View>

      // Update the search section in renderHeader:
{localSearchQuery ? (
  <TouchableOpacity style={styles.clearSearchButton} onPress={handleClearSearch}>
    <Text style={styles.clearSearchText}>Clear Search</Text>
  </TouchableOpacity>
) : null}

      {/* Results Header */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsTitle}>
          {isSearching 
            ? `Search Results for "${searchQuery}"`
            : `${CATEGORIES.find(cat => cat.value === category)?.label} Movies`
          }
        </Text>
        <Text style={styles.resultsCount}>{getSortedMovies().length} movies</Text>
      </View>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Search size={64} color="#ccc" />
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
          onRetry={() => isSearching ? searchMovies(searchQuery) : fetchMovies(category)}
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
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
          ListEmptyComponent={renderEmptyState}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 20,
    textAlign: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    gap: 12,
  },
  filterContainer: {
    flex: 1,
  },
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#495057',
    marginBottom: 6,
  },
  sortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sortDropdown: {
    flex: 1,
  },
  sortOrderButton: {
    width: 44,
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  searchSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: 'white',
  },
  searchButton: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearSearchButton: {
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#6c757d',
    borderRadius: 6,
    marginBottom: 16,
  },
  clearSearchText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  resultsCount: {
    fontSize: 14,
    color: '#6c757d',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    minHeight: 300,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#6c757d',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#adb5bd',
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyStateButton: {
    marginTop: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007bff',
    borderRadius: 6,
  },
  emptyStateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});