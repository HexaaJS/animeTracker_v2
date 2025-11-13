import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

const ProgressBar = ({ currentEpisode, totalEpisodes, onUpdate, animeId }) => {
  const [animating, setAnimating] = useState(false);
  const { activeTheme } = useTheme();

  const percentage = totalEpisodes > 0 ? (currentEpisode / totalEpisodes) * 100 : 0;
  const isComplete = totalEpisodes > 0 && currentEpisode >= totalEpisodes;

  const handleIncrement = async () => {
    if (currentEpisode < (totalEpisodes || 9999)) {
      setAnimating(true);
      await onUpdate(animeId, currentEpisode + 1);
      setTimeout(() => setAnimating(false), 300);
    }
  };

  const handleDecrement = async () => {
    if (currentEpisode > 0) {
      setAnimating(true);
      await onUpdate(animeId, currentEpisode - 1);
      setTimeout(() => setAnimating(false), 300);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.infoRow}>
        <Text style={styles.episodeText}>
          Episode {currentEpisode}{totalEpisodes ? `/${totalEpisodes}` : ''}
        </Text>
        <Text style={[styles.percentage, isComplete && styles.complete]}>
          {Math.round(percentage)}%
          {isComplete && ' 🎉'}
        </Text>
      </View>

      <View style={styles.progressBarContainer}>
        <View style={[styles.progressBar, !totalEpisodes && styles.disabled]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${percentage}%`,
                backgroundColor: isComplete ? '#4CAF50' : activeTheme.colors.primary
              }
            ]}
          />
        </View>
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          style={[
            styles.controlButton,
            currentEpisode === 0 && styles.controlButtonDisabled
          ]}
          onPress={handleDecrement}
          disabled={currentEpisode === 0 || animating}
        >
          <Ionicons name="remove" size={20} color={currentEpisode === 0 ? '#ccc' : '#666'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.controlButton,
            (totalEpisodes && currentEpisode >= totalEpisodes) && styles.controlButtonDisabled
          ]}
          onPress={handleIncrement}
          disabled={(totalEpisodes && currentEpisode >= totalEpisodes) || animating}
        >
          <Ionicons 
            name="add" 
            size={20} 
            color={(totalEpisodes && currentEpisode >= totalEpisodes) ? '#ccc' : '#666'} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  episodeText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  percentage: {
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
  },
  complete: {
    color: '#4CAF50',
  },
  progressBarContainer: {
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#E0E0E0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  disabled: {
    opacity: 0.5,
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 10,
  },
  controlButton: {
    width: 36,
    height: 36,
    backgroundColor: '#F5F5F5',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  controlButtonDisabled: {
    opacity: 0.3,
  },
});

export default ProgressBar;