import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Image
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import animeService from '../services/animeService';
import ProgressBar from '../components/ProgressBar';

const HomeScreen = ({ navigation }) => {
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  
  const { user } = useAuth();
  const { activeTheme } = useTheme();

  useEffect(() => {
    loadAnimes();
  }, [filter]);

  const loadAnimes = async () => {
    try {
      const response = await animeService.getAnimes();
      if (response.success) {
        // Filter locally
        let filtered = response.data;
        if (filter !== 'all') {
          filtered = response.data.filter(anime => anime.status === filter);
        }
        setAnimes(filtered);
      }
    } catch (error) {
      console.error('Error loading animes:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadAnimes();
  };

  const handleProgressUpdate = async (id, currentEpisode) => {
    try {
      const response = await animeService.updateProgress(id, currentEpisode, null);
      const updated = response.data;

      const total = Number(updated.totalEpisodes) || 0;
      const cur = Number(updated.currentEpisode) || 0;

      let targetStatus;
      if (total > 0 && cur >= total) {
        targetStatus = 'Completed';
      } else if (cur === 0) {
        targetStatus = 'To Watch';
      } else if (cur > 0 && cur < total) {
        targetStatus = 'Watching';
      } else {
        targetStatus = updated.status;
      }

      let finalDoc = updated;
      if (updated.status !== targetStatus) {
        const statusResponse = await animeService.updateStatus(id, targetStatus);
        finalDoc = statusResponse.data;
      }

      setAnimes(animes.map(anime =>
        anime._id === id ? finalDoc : anime
      ));
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  const handlePause = async (id) => {
    try {
      const response = await animeService.updateStatus(id, 'On Hold');
      setAnimes(animes.map(anime =>
        anime._id === id ? response.data : anime
      ));
    } catch (error) {
      console.error('Error pausing:', error);
      Alert.alert('Error', 'Failed to pause anime');
    }
  };

  const handleDrop = async (id) => {
    Alert.alert(
      'Drop Anime',
      'Are you sure you want to drop this anime?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Drop',
          style: 'destructive',
          onPress: async () => {
            try {
              const response = await animeService.updateStatus(id, 'Dropped');
              setAnimes(animes.map(anime =>
                anime._id === id ? response.data : anime
              ));
            } catch (error) {
              console.error('Error dropping:', error);
              Alert.alert('Error', 'Failed to drop anime');
            }
          }
        }
      ]
    );
  };

  const handleDelete = async (id) => {
    Alert.alert(
      'Delete Anime',
      'Are you sure you want to delete this anime?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await animeService.deleteAnime(id);
              setAnimes(animes.filter(anime => anime._id !== id));
            } catch (error) {
              console.error('Error deleting:', error);
              Alert.alert('Error', 'Failed to delete anime');
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Watching': return '#4CAF50';
      case 'Completed': return '#2196F3';
      case 'To Watch': return '#FF9800';
      case 'On Hold': return '#9E9E9E';
      case 'Dropped': return '#F44336';
      default: return '#9E9E9E';
    }
  };

  const renderAnimeCard = ({ item }) => (
    <View style={styles.card}>
      {item.imageUrl && (
        <Image
          source={{ uri: item.imageUrl }}
          style={styles.animeImage}
          resizeMode="cover"
        />
      )}

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
            <Text style={styles.statusText}>{item.status}</Text>
          </View>
        </View>

        {item.notes && (
          <Text style={styles.notes} numberOfLines={2}>
            {item.notes}
          </Text>
        )}

        <ProgressBar
          currentEpisode={item.currentEpisode || 0}
          totalEpisodes={item.totalEpisodes}
          onUpdate={handleProgressUpdate}
          animeId={item._id}
        />

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handlePause(item._id)}
          >
            <Ionicons name="pause-outline" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDrop(item._id)}
          >
            <Ionicons name="close-outline" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={() => handleDelete(item._id)}
          >
            <Ionicons name="trash-outline" size={20} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const filters = [
    { label: 'All', value: 'all' },
    { label: 'Watching', value: 'Watching' },
    { label: 'To Watch', value: 'To Watch' },
    { label: 'Completed', value: 'Completed' },
    { label: 'On Hold', value: 'On Hold' },
    { label: 'Dropped', value: 'Dropped' },
  ];

  if (loading) {
    return (
      <LinearGradient
        colors={[activeTheme.colors.primary, activeTheme.colors.secondary]}
        style={styles.container}
      >
        <ActivityIndicator size="large" color="#FFFFFF" />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[activeTheme.colors.primary, activeTheme.colors.secondary]}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎌 My Animes</Text>
        <Text style={styles.headerSubtitle}>Welcome, {user?.username}!</Text>
      </View>

      {/* Filters */}
      <View style={styles.filtersContainer}>
        <FlatList
          horizontal
          data={filters}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                filter === item.value && [styles.filterButtonActive, { backgroundColor: activeTheme.colors.primary }]
              ]}
              onPress={() => setFilter(item.value)}
            >
              <Text style={[
                styles.filterText,
                filter === item.value && styles.filterTextActive
              ]}>
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.value}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersList}
        />
      </View>

      {animes.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="film-outline" size={80} color="rgba(255,255,255,0.5)" />
          <Text style={styles.emptyText}>No animes yet</Text>
          <Text style={styles.emptySubtext}>Tap the + button to add your first anime!</Text>
        </View>
      ) : (
        <FlatList
          data={animes}
          renderItem={renderAnimeCard}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor="#FFFFFF"
            />
          }
        />
      )}
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 15,
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
  filtersContainer: {
    marginBottom: 15,
  },
  filtersList: {
    paddingHorizontal: 20,
  },
  filterButton: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  filterButtonActive: {
    backgroundColor: '#FFFFFF',
  },
  filterText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    marginBottom: 15,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  animeImage: {
    width: '100%',
    height: 200,
  },
  cardContent: {
    padding: 15,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  statusText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  notes: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  deleteButton: {
    backgroundColor: '#FFEBEE',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
});

export default HomeScreen; 