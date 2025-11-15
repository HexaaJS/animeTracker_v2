import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import animeService from '../services/animeService';
import AnimeCard from '../components/AnimeCard';

const HomeScreen = ({ navigation }) => {
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all');
  
  const { user } = useAuth();
  const { activeTheme } = useTheme();
  
  // Couleur de texte dynamique
  const textColor = activeTheme.colors.textColor || '#FFFFFF';

  useEffect(() => {
    loadAnimes();
  }, [filter]);

  const loadAnimes = async () => {
    try {
      const response = await animeService.getAnimes();
      if (response.success) {
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
      const response = await animeService.updateProgress(id, { 
        currentEpisode: parseInt(currentEpisode) 
      });
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
        const statusResponse = await animeService.updateAnime(id, { status: targetStatus });
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
      const response = await animeService.updateAnime(id, { status: 'On Hold' });
      setAnimes(animes.map(anime =>
        anime._id === id ? response.data : anime
      ));
    } catch (error) {
      console.error('Error pausing:', error);
    }
  };

  const handleDrop = async (id) => {
    try {
      const response = await animeService.updateAnime(id, { status: 'Dropped' });
      setAnimes(animes.map(anime =>
        anime._id === id ? response.data : anime
      ));
    } catch (error) {
      console.error('Error dropping:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await animeService.deleteAnime(id);
      setAnimes(animes.filter(anime => anime._id !== id));
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

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
        <ActivityIndicator size="large" color={textColor} />
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={[activeTheme.colors.primary, activeTheme.colors.secondary]}
      style={styles.container}
    >
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: textColor }]}>🎌 My Animes</Text>
        <Text style={[styles.headerSubtitle, { color: textColor, opacity: 0.9 }]}>
          Welcome, {user?.username}!
        </Text>
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
                filter === item.value && [
                  styles.filterButtonActive,
                  { 
                    backgroundColor: 'rgba(255,255,255,0.3)',
                    borderWidth: 2,
                    borderColor: textColor
                  }
                ]
              ]}
              onPress={() => setFilter(item.value)}
            >
              <Text style={[
                styles.filterText,
                { color: textColor },
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
          <Ionicons name="film-outline" size={80} color={textColor} style={{ opacity: 0.5 }} />
          <Text style={[styles.emptyText, { color: textColor }]}>No animes yet</Text>
          <Text style={[styles.emptySubtext, { color: textColor, opacity: 0.8 }]}>
            Tap the + button to add your first anime!
          </Text>
        </View>
      ) : (
        <FlatList
          data={animes}
          renderItem={({ item }) => (
            <AnimeCard
              anime={item}
              onProgressUpdate={handleProgressUpdate}
              onPause={handlePause}
              onDrop={handleDrop}
              onDelete={handleDelete}
              activeTheme={activeTheme}
            />
          )}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContainer}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={textColor}
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
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  filtersContainer: {
    marginBottom: 15,
  },
  filtersList: {
    paddingHorizontal: 20,
  },
  filterButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 10,
  },
  filterButtonActive: {
    // Styles dynamiques appliqués dans le JSX
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
  },
  filterTextActive: {
    fontWeight: 'bold',
  },
  listContainer: {
    padding: 20,
    paddingBottom: 100,
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
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    textAlign: 'center',
  },
});

export default HomeScreen;