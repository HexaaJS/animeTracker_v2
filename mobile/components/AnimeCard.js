import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import ProgressBar from './ProgressBar';

const AnimeCard = ({ 
  anime, 
  onProgressUpdate, 
  onPause, 
  onDrop, 
  onDelete,
  activeTheme 
}) => {
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

  const handlePause = () => {
    onPause(anime._id);
  };

  const handleDrop = () => {
    Alert.alert(
      'Drop Anime',
      'Are you sure you want to drop this anime?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Drop',
          style: 'destructive',
          onPress: () => onDrop(anime._id)
        }
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Anime',
      'Are you sure you want to delete this anime?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => onDelete(anime._id)
        }
      ]
    );
  };

  return (
    <View style={styles.card}>
      {anime.coverImage && (
        <Image
          source={{ uri: anime.coverImage }}
          style={styles.animeImage}
          resizeMode="cover"
        />
      )}

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle} numberOfLines={2}>
            {anime.title}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(anime.status) }]}>
            <Text style={styles.statusText}>{anime.status}</Text>
          </View>
        </View>

        {anime.notes && (
          <Text style={styles.notes} numberOfLines={2}>
            {anime.notes}
          </Text>
        )}

        <ProgressBar
          currentEpisode={anime.currentEpisode || 0}
          totalEpisodes={anime.totalEpisodes}
          onUpdate={onProgressUpdate}
          animeId={anime._id}
        />

        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handlePause}
          >
            <Ionicons name="pause-outline" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleDrop}
          >
            <Ionicons name="close-outline" size={20} color="#666" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.deleteButton]}
            onPress={handleDelete}
          >
            <Ionicons name="trash-outline" size={20} color="#F44336" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
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
});

export default AnimeCard;