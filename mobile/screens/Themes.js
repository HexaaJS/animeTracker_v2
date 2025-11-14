import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

const Themes = ({ navigation }) => {
  const { themes, currentTheme, changeTheme, activeTheme } = useTheme();
  const { user } = useAuth();
  const [showPremiumAlert, setShowPremiumAlert] = useState(false);

  const handleThemeSelect = (themeKey, theme) => {
    if (theme.isPremium && !user?.isPremium) {
      Alert.alert(
        '🔒 Premium Theme',
        'This theme is only available for Premium members. Upgrade to unlock 20+ exclusive themes!',
        [
          { text: 'Maybe Later', style: 'cancel' },
          { text: 'Upgrade to Premium', onPress: () => navigation.navigate('Premium') }
        ]
      );
    } else {
      changeTheme(themeKey);
    }
  };

  const premiumThemes = Object.entries(themes).filter(([_, theme]) => theme.isPremium);
  const freeThemes = Object.entries(themes).filter(([_, theme]) => !theme.isPremium);

  const renderThemeCard = ([themeKey, theme]) => {
    const isActive = currentTheme === themeKey;
    const isLocked = theme.isPremium && !user?.isPremium;

    return (
      <TouchableOpacity
        key={themeKey}
        style={[
          styles.themeCard,
          isActive && styles.themeCardActive,
          isLocked && styles.themeCardLocked
        ]}
        onPress={() => handleThemeSelect(themeKey, theme)}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={theme.colors ? [theme.colors.primary, theme.colors.secondary] : ['#667eea', '#764ba2']}
          style={styles.themePreview}
        >
          {isLocked && (
            <View style={styles.lockOverlay}>
              <Ionicons name="lock-closed" size={32} color="#FFFFFF" />
            </View>
          )}
          {isActive && (
            <View style={styles.activeOverlay}>
              <Ionicons name="checkmark-circle" size={40} color="#FFFFFF" />
            </View>
          )}
        </LinearGradient>

        <View style={styles.themeInfo}>
          <Text style={styles.themeEmoji}>{theme.emoji}</Text>
          <Text style={styles.themeName}>{theme.name}</Text>
          {theme.isPremium && (
            <View style={styles.premiumBadge}>
              <Ionicons name="diamond" size={12} color="#FFD700" />
              <Text style={styles.premiumText}>Premium</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={[activeTheme.colors.primary, activeTheme.colors.secondary]}
        style={styles.header}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={activeTheme.colors.textColor} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: activeTheme.colors.textColor }]}>🎨 Themes</Text>
        <Text style={[styles.headerSubtitle, { color: activeTheme.colors.textColor, opacity: 0.9 }]}>Customize your experience</Text>
      </LinearGradient>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Premium Banner */}
        {!user?.isPremium && (
          <TouchableOpacity
            style={styles.premiumBanner}
            onPress={() => navigation.navigate('Premium')}
          >
            <LinearGradient
              colors={['#FFD700', '#FFED4E']}
              style={styles.premiumBannerGradient}
            >
              <Ionicons name="diamond" size={24} color="#333" />
              <Text style={styles.premiumBannerText}>
                Unlock 20+ exclusive themes with Premium
              </Text>
              <Ionicons name="chevron-forward" size={24} color="#333" />
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* Premium Badge if user is premium */}
        {user?.isPremium && (
          <View style={styles.premiumActiveBadge}>
            <Ionicons name="diamond" size={20} color="#FFFFFF" />
            <Text style={styles.premiumActiveText}>Premium Active</Text>
          </View>
        )}

        {/* Free Themes */}
        <Text style={styles.sectionTitle}>Free Themes</Text>
        <View style={styles.themesGrid}>
          {freeThemes.map(renderThemeCard)}
        </View>

        {/* Premium Themes */}
        <Text style={styles.sectionTitle}>Premium Themes</Text>
        <View style={styles.themesGrid}>
          {premiumThemes.map(renderThemeCard)}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  backButton: {
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  premiumBanner: {
    marginBottom: 25,
    borderRadius: 15,
    overflow: 'hidden',
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  premiumBannerGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
  },
  premiumBannerText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginHorizontal: 12,
  },
  premiumActiveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#22c55e',
    padding: 15,
    borderRadius: 12,
    marginBottom: 25,
    gap: 10,
  },
  premiumActiveText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    marginTop: 10,
  },
  themesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  themeCard: {
    width: '48%',
    marginBottom: 20,
    borderRadius: 15,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  themeCardActive: {
    borderWidth: 3,
    borderColor: '#4CAF50',
  },
  themeCardLocked: {
    opacity: 0.7,
  },
  themePreview: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeInfo: {
    padding: 12,
    alignItems: 'center',
  },
  themeEmoji: {
    fontSize: 28,
    marginBottom: 5,
  },
  themeName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF9E6',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  premiumText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FF9800',
  },
});

export default Themes;