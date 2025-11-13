import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import jikanService from '../services/jikanService';
import animeService from '../services/animeService';

const AddAnime = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedAnime, setSelectedAnime] = useState(null);
  const [showResults, setShowResults] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState({
    status: 'To Watch',
    currentEpisode: 0,
    rating: '',
    notes: ''
  });
  
  const { activeTheme } = useTheme();

  // Auto-search when user types
  useEffect(() => {
    if (selectedAnime) return; // Don't search if anime selected

    const delaySearch = setTimeout(() => {
      if (searchQuery.trim().length > 2) {
        handleSearch();
      } else {
        setSearchResults([]);
        setShowResults(false);
      }
    }, 500);

    return () => clearTimeout(delaySearch);
  }, [searchQuery, selectedAnime]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await jikanService.searchAnimes(searchQuery);
      setSearchResults(response.data || []);
      setShowResults(true);
    } catch (error) {
      console.error('Search error:', error);
      Alert.alert('Error', 'Failed to search animes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnime = (jikanAnime) => {
    setSelectedAnime(jikanAnime);
    setSearchQuery(jikanAnime.title);
    setShowResults(false);
    
    // Pre-fill form with Jikan data
    setFormData({
      ...formData,
      currentEpisode: 0,
      rating: jikanAnime.score ? jikanAnime.score.toString() : ''
    });
  };

  const handleAddAnime = async () => {
    if (!selectedAnime) {
      Alert.alert('Error', 'Please select an anime from search results');
      return;
    }

    setLoading(true);
    
    try {
      const animeData = {
        title: selectedAnime.title,
        malId: selectedAnime.mal_id,
        imageUrl: selectedAnime.images?.jpg?.image_url || selectedAnime.images?.jpg?.large_image_url,
        totalEpisodes: selectedAnime.episodes || 0,
        currentEpisode: parseInt(formData.currentEpisode) || 0,
        status: formData.status,
        score: selectedAnime.score || 0,
        rating: formData.rating ? parseFloat(formData.rating) : null,
        genres: selectedAnime.genres?.map(g => g.name) || [],
        synopsis: selectedAnime.synopsis || '',
        type: selectedAnime.type || 'TV',
        year: selectedAnime.year || null,
        notes: formData.notes.trim()
      };

      const response = await animeService.addAnime(animeData);
      
      if (response.success) {
        Alert.alert(
          'Success! 🎉',
          `${selectedAnime.title} has been added to your list!`,
          [
            { 
              text: 'View List', 
              onPress: () => navigation.navigate('HomeTab')
            }
          ]
        );
        // Reset form
        setSearchQuery('');
        setSelectedAnime(null);
        setFormData({
          status: 'To Watch',
          currentEpisode: 0,
          rating: '',
          notes: ''
        });
      }
    } catch (error) {
      console.error('Add anime error:', error);
      Alert.alert('Error', error.response?.data?.message || 'Failed to add anime');
    } finally {
      setLoading(false);
    }
  };

  const renderSearchResult = ({ item }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handleSelectAnime(item)}
    >
      <Image
        source={{ uri: item.images?.jpg?.small_image_url || item.images?.jpg?.image_url }}
        style={styles.resultImage}
        resizeMode="cover"
      />
      <View style={styles.resultInfo}>
        <Text style={styles.resultTitle} numberOfLines={1}>
          {item.title}
        </Text>
        <Text style={styles.resultMeta}>
          {item.type} • {item.episodes || '?'} ep
          {item.score && ` • ⭐ ${item.score}`}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const statusOptions = [
    { label: 'To Watch', value: 'To Watch', icon: 'time-outline', color: '#FF9800' },
    { label: 'Watching', value: 'Watching', icon: 'play-circle-outline', color: '#4CAF50' },
    { label: 'Completed', value: 'Completed', icon: 'checkmark-circle-outline', color: '#2196F3' },
    { label: 'On Hold', value: 'On Hold', icon: 'pause-circle-outline', color: '#FFC107' },
    { label: 'Dropped', value: 'Dropped', icon: 'close-circle-outline', color: '#F44336' }
  ];

  return (
    <LinearGradient
      colors={[activeTheme.colors.primary, activeTheme.colors.secondary]}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView 
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scrollContent}
        >
          <View style={styles.header}>
            <Text style={styles.headerTitle}>🔍 Add Anime</Text>
            <Text style={styles.headerSubtitle}>Search and add to your list</Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color="#999" />
              <TextInput
                style={styles.searchInput}
                placeholder="Type to search anime..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={(text) => {
                  setSearchQuery(text);
                  if (selectedAnime) setSelectedAnime(null); // Reset selection on new search
                }}
                autoCapitalize="none"
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => {
                  setSearchQuery('');
                  setSearchResults([]);
                  setShowResults(false);
                  setSelectedAnime(null);
                }}>
                  <Ionicons name="close-circle" size={20} color="#999" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Search Results Dropdown */}
          {showResults && searchResults.length > 0 && (
            <View style={styles.resultsDropdown}>
              {loading && (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color={activeTheme.colors.primary} />
                  <Text style={styles.loadingText}>Searching...</Text>
                </View>
              )}
              <FlatList
                data={searchResults.slice(0, 5)}
                renderItem={renderSearchResult}
                keyExtractor={(item) => item.mal_id.toString()}
                scrollEnabled={false}
              />
            </View>
          )}

          {/* Selected Anime Card */}
          {selectedAnime && (
            <View style={styles.selectedCard}>
              <Image
                source={{ uri: selectedAnime.images?.jpg?.image_url }}
                style={styles.selectedImage}
                resizeMode="cover"
              />
              <View style={styles.selectedInfo}>
                <Text style={styles.selectedTitle}>{selectedAnime.title}</Text>
                <Text style={styles.selectedMeta}>
                  {selectedAnime.type} • {selectedAnime.episodes || '?'} episodes
                </Text>
                {selectedAnime.score && (
                  <View style={styles.scoreRow}>
                    <Ionicons name="star" size={16} color="#FFD700" />
                    <Text style={styles.scoreText}>{selectedAnime.score}</Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Form (only show when anime selected) */}
          {selectedAnime && (
            <View style={styles.formContainer}>
              {/* Status Selector */}
              <Text style={styles.formLabel}>Status</Text>
              <View style={styles.statusGrid}>
                {statusOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.statusButton,
                      formData.status === option.value && {
                        backgroundColor: option.color,
                        borderColor: option.color
                      }
                    ]}
                    onPress={() => setFormData({ ...formData, status: option.value })}
                  >
                    <Ionicons 
                      name={option.icon} 
                      size={24} 
                      color={formData.status === option.value ? '#FFFFFF' : '#666'} 
                    />
                    <Text style={[
                      styles.statusText,
                      formData.status === option.value && styles.statusTextActive
                    ]}>
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Current Episode */}
              <Text style={styles.formLabel}>Current Episode</Text>
              <TextInput
                style={styles.input}
                placeholder="0"
                placeholderTextColor="#999"
                value={formData.currentEpisode.toString()}
                onChangeText={(text) => setFormData({ ...formData, currentEpisode: text })}
                keyboardType="numeric"
              />

              {/* Personal Rating */}
              <Text style={styles.formLabel}>Your Rating (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="1-10"
                placeholderTextColor="#999"
                value={formData.rating}
                onChangeText={(text) => setFormData({ ...formData, rating: text })}
                keyboardType="decimal-pad"
              />

              {/* Notes */}
              <Text style={styles.formLabel}>Personal Notes (optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Your impressions, comments..."
                placeholderTextColor="#999"
                value={formData.notes}
                onChangeText={(text) => setFormData({ ...formData, notes: text })}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />

              {/* Add Button */}
              <TouchableOpacity
                style={[
                  styles.addButton,
                  { backgroundColor: activeTheme.colors.primary }
                ]}
                onPress={handleAddAnime}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="add-circle" size={24} color="#FFFFFF" />
                    <Text style={styles.addButtonText}>Add to My List</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 15,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 10,
    fontSize: 16,
    color: '#333',
  },
  resultsDropdown: {
    marginHorizontal: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 20,
    maxHeight: 300,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  loadingText: {
    marginLeft: 10,
    color: '#666',
  },
  resultItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  resultImage: {
    width: 60,
    height: 80,
    borderRadius: 8,
  },
  resultInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'center',
  },
  resultTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  resultMeta: {
    fontSize: 12,
    color: '#666',
  },
  selectedCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedImage: {
    width: 80,
    height: 120,
    borderRadius: 8,
  },
  selectedInfo: {
    flex: 1,
    marginLeft: 15,
    justifyContent: 'center',
  },
  selectedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  selectedMeta: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreText: {
    marginLeft: 5,
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  formContainer: {
    paddingHorizontal: 20,
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  statusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  statusButton: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 12,
    padding: 15,
    marginRight: '4%',
    marginBottom: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginTop: 5,
  },
  statusTextActive: {
    color: '#FFFFFF',
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  textArea: {
    height: 100,
    paddingTop: 15,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
});

export default AddAnime;