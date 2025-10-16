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
  } = useMovies();

  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!isSearching) {
      fetchMovies(category);
    }
  }, [category, isSearching]);

  const handleSearch = () => {
    Keyboard.dismiss();
    setIsSearching(!!localSearchQuery.trim());
    searchMovies(localSearchQuery);
  };

  const handleClearSearch = () => {
    setLocalSearchQuery('');
    setSearchQuery('');
    setIsSearching(false);
    fetchMovies(category);
  };

  const handleMoviePress = (movie: Movie) => {
    navigation.navigate('Details', { movieId: movie.id });
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

      if (aValue < bValue) return sortOrder === 'desc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'desc' ? 1 : -1;
      return 0;
    });

    return sortedMovies;
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Logo Section */}
      <View style={styles.logoSection}>
        <Image 
          source={require('../assets/Logo.png')} 
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

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

      {/* Search Section */}
      <View style={styles.filterSection}>
        <View style={styles.searchContainer}>
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
          <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
            <Text style={styles.searchButtonText}>Search</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Results Info */}
      <View style={styles.resultsInfo}>
        <Text style={styles.resultsText}>
          {isSearching 
            ? `Search results for "${searchQuery}"`
            : `${CATEGORIES.find(cat => cat.value === category)?.label} Movies`
          }
        </Text>
        <Text style={styles.resultsCount}>{getSortedMovies().length} movies</Text>
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
          onRetry={() => isSearching ? searchMovies(searchQuery) : fetchMovies(category)}
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
  logoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 200,
    height: 60,
  },
  filterSection: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e9ecef',
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: '#333',
  },
  searchButton: {
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 8,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 16,
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