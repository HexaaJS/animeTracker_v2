import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import animeService from '../services/animeService';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();
  const { activeTheme } = useTheme();
  const [animes, setAnimes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const textColor = activeTheme.colors.textColor || '#FFFFFF';
  const screenWidth = Dimensions.get('window').width;

  useEffect(() => {
    fetchAnimes();
  }, []);

  const fetchAnimes = async () => {
    try {
      const response = await animeService.getAnimes();
      if (response.success) {
        setAnimes(response.data);
      }
    } catch (error) {
      console.error('Error loading animes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Logout', 
          style: 'destructive',
          onPress: logout
        }
      ]
    );
  };

  // Calculate stats
  const stats = {
    total: animes.length,
    watching: animes.filter(a => a.status === 'Watching').length,
    completed: animes.filter(a => a.status === 'Completed').length,
    toWatch: animes.filter(a => a.status === 'To Watch').length,
    onHold: animes.filter(a => a.status === 'On Hold').length,
    dropped: animes.filter(a => a.status === 'Dropped').length,
    episodesWatched: animes.reduce((sum, a) => sum + (a.currentEpisode || 0), 0),
    averageRating: animes.filter(a => a.rating).length > 0
      ? (animes.reduce((sum, a) => sum + (a.rating || 0), 0) / animes.filter(a => a.rating).length).toFixed(1)
      : 0,
    estimatedTime: Math.round(animes.reduce((sum, a) => sum + (a.currentEpisode || 0), 0) * 24 / 60)
  };

  // Data for pie chart
  const statusData = [
    { name: 'Watching', population: stats.watching, color: '#4CAF50', legendFontColor: '#333' },
    { name: 'Completed', population: stats.completed, color: '#2196F3', legendFontColor: '#333' },
    { name: 'To Watch', population: stats.toWatch, color: '#FF9800', legendFontColor: '#333' },
    { name: 'On Hold', population: stats.onHold, color: '#9E9E9E', legendFontColor: '#333' },
    { name: 'Dropped', population: stats.dropped, color: '#F44336', legendFontColor: '#333' },
  ].filter(item => item.population > 0);

  // Top 5 genres
  const genresCount = {};
  animes.forEach(anime => {
    anime.genre?.forEach(g => {
      genresCount[g] = (genresCount[g] || 0) + 1;
    });
  });

  const topGenres = Object.entries(genresCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

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

  return (
    <LinearGradient
      colors={[activeTheme.colors.primary, activeTheme.colors.secondary]}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <Text style={[styles.avatarText, { color: textColor }]}>
              {user?.username?.charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.username, { color: textColor }]}>{user?.username}</Text>
          {/* <Text style={[styles.email, { color: textColor, opacity: 0.8 }]}>{user?.email}</Text> */}
        </View>


        {/* Account Info */}
        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Ionicons name="mail-outline" size={24} color="#666" />
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Email</Text>
                <Text style={styles.cardValue}>{user?.email}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.cardRow}>
              <Ionicons 
                name={user?.isPremium ? "star" : "star-outline"} 
                size={24} 
                color={user?.isPremium ? "#FFD700" : "#666"} 
              />
              <View style={styles.cardContent}>
                <Text style={styles.cardLabel}>Account Type</Text>
                <Text style={styles.cardValue}>
                  {user?.isPremium ? '✨ Premium' : 'Free'}
                </Text>
              </View>
            </View>

            {!user?.isPremium && (
              <>
                <View style={styles.divider} />
                <TouchableOpacity style={styles.premiumButton}>
                  <Ionicons name="diamond" size={20} color="#333" />
                  <Text style={styles.premiumButtonText}>Upgrade to Premium</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        {/* Settings */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>Settings</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => navigation.navigate('Themes')}
          >
            <Ionicons name="color-palette-outline" size={24} color={textColor} />
            <Text style={[styles.menuText, { color: textColor }]}>Themes</Text>
            <Ionicons name="chevron-forward" size={24} color={textColor} />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Animes</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.episodesWatched}</Text>
            <Text style={styles.statLabel}>Episodes Watched</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats.estimatedTime}h</Text>
            <Text style={styles.statLabel}>Time Spent</Text>
          </View>
        </View>

        {/* Pie Chart - Status Distribution */}
        {statusData.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>📊 Distribution by Status</Text>
            <PieChart
              data={statusData}
              width={screenWidth - 60}
              height={220}
              chartConfig={{
                color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              }}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>
        )}

        {/* Top Genres */}
        {topGenres.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>🎭 Top 5 Genres</Text>
            {topGenres.map(([name, count]) => (
              <View key={name} style={styles.genreItem}>
                <Text style={styles.genreName}>{name}</Text>
                <View style={styles.genreBarContainer}>
                  <View 
                    style={[
                      styles.genreBar,
                      { 
                        width: `${(count / topGenres[0][1]) * 100}%`,
                        backgroundColor: activeTheme.colors.primary
                      }
                    ]} 
                  />
                </View>
                <Text style={styles.genreCount}>{count}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Details by Status */}
        {statusData.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>📋 Details by Status</Text>
            {statusData.map((status) => (
              <View key={status.name} style={styles.statusItem}>
                <View style={styles.statusHeader}>
                  <Text style={styles.statusName}>{status.name}</Text>
                  <Text style={styles.statusCount}>{status.population}</Text>
                </View>
                <View style={styles.statusBarContainer}>
                  <View
                    style={[
                      styles.statusBar,
                      {
                        width: `${(status.population / stats.total) * 100}%`,
                        backgroundColor: status.color
                      }
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        )}


        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color="#FF5252" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: textColor, opacity: 0.6 }]}>Version 1.0.0</Text>
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    fontSize: 48,
    fontWeight: 'bold',
  },
  username: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  email: {
    fontSize: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  genreItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  genreName: {
    width: 100,
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  genreBarContainer: {
    flex: 1,
    height: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    overflow: 'hidden',
    marginHorizontal: 10,
  },
  genreBar: {
    height: '100%',
    borderRadius: 10,
  },
  genreCount: {
    width: 30,
    fontSize: 14,
    color: '#666',
    fontWeight: 'bold',
    textAlign: 'right',
  },
  statusItem: {
    marginBottom: 15,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statusName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  statusCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  statusBarContainer: {
    height: 20,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    overflow: 'hidden',
  },
  statusBar: {
    height: '100%',
    borderRadius: 10,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    padding: 20,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardContent: {
    marginLeft: 15,
    flex: 1,
  },
  cardLabel: {
    fontSize: 14,
    color: '#999',
    marginBottom: 2,
  },
  cardValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 15,
  },
  premiumButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
    padding: 12,
    borderRadius: 10,
    marginTop: 5,
  },
  premiumButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 15,
    fontWeight: '600',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    padding: 15,
    borderRadius: 10,
    marginHorizontal: 20,
    marginTop: 10,
  },
  logoutText: {
    color: '#FF5252',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  version: {
    textAlign: 'center',
    fontSize: 14,
    marginTop: 20,
  },
});

export default ProfileScreen;