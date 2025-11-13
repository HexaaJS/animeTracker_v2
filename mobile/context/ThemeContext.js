import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import authService from '../services/authService';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// --- Utils: calcul d'une couleur de texte lisible (noir/blanc) ---
function hexToRgb(hex) {
  const sanitized = hex.replace('#', '');
  const bigint = parseInt(sanitized.length === 3
    ? sanitized.split('').map(c => c + c).join('')
    : sanitized, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return { r, g, b };
}

// Luminance relative (WCAG)
function relativeLuminance({ r, g, b }) {
  const srgb = [r, g, b].map(v => v / 255);
  const lin = srgb.map(c => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  return 0.2126 * lin[0] + 0.7152 * lin[1] + 0.0722 * lin[2];
}

// Choix texte: blanc si primaire sombre, noir si primaire clair
function getReadableTextColor(primaryHex) {
  try {
    const lum = relativeLuminance(hexToRgb(primaryHex));
    return lum > 0.4 ? '#111111' : '#FFFFFF';
  } catch {
    return '#FFFFFF';
  }
}

// Thèmes disponibles (format adapté pour React Native)
export const themes = {
  purpleDream: {
    name: 'Purple Dream',
    colors: {
      primary: '#667eea',
      secondary: '#764ba2',
      background: '#667eea',
      card: '#FFFFFF',
      text: '#FFFFFF',
      textDark: '#333333',
      border: 'rgba(255, 255, 255, 0.2)',
    },
    emoji: '🟣',
    isPremium: false
  },
  oceanBlue: {
    name: 'Ocean Blue',
    colors: {
      primary: '#2196F3',
      secondary: '#21CBF3',
      background: '#2196F3',
      card: '#FFFFFF',
      text: '#FFFFFF',
      textDark: '#333333',
      border: 'rgba(255, 255, 255, 0.2)',
    },
    emoji: '🔵',
    isPremium: false
  },
  forestGreen: {
    name: 'Forest Green',
    colors: {
      primary: '#11998e',
      secondary: '#38ef7d',
      background: '#11998e',
      card: '#FFFFFF',
      text: '#FFFFFF',
      textDark: '#333333',
      border: 'rgba(255, 255, 255, 0.2)',
    },
    emoji: '🟢',
    isPremium: false
  },
  sunsetRed: {
    name: 'Sunset Red',
    colors: {
      primary: '#ee0979',
      secondary: '#ff6a00',
      background: '#ee0979',
      card: '#FFFFFF',
      text: '#FFFFFF',
      textDark: '#333333',
      border: 'rgba(255, 255, 255, 0.2)',
    },
    emoji: '🔴',
    isPremium: false
  },
  orangeBlast: {
    name: 'Orange Blast',
    colors: {
      primary: '#f46b45',
      secondary: '#eea849',
      background: '#f46b45',
      card: '#FFFFFF',
      text: '#FFFFFF',
      textDark: '#333333',
      border: 'rgba(255, 255, 255, 0.2)',
    },
    emoji: '🟠',
    isPremium: false
  },
  darkNight: {
    name: 'Dark Night',
    colors: {
      primary: '#232526',
      secondary: '#414345',
      background: '#232526',
      card: '#FFFFFF',
      text: '#FFFFFF',
      textDark: '#333333',
      border: 'rgba(255, 255, 255, 0.2)',
    },
    emoji: '⚫',
    isPremium: false
  },
  mintFresh: {
    name: 'Mint Fresh',
    colors: {
      primary: '#00b4db',
      secondary: '#0083b0',
      background: '#00b4db',
      card: '#FFFFFF',
      text: '#FFFFFF',
      textDark: '#333333',
      border: 'rgba(255, 255, 255, 0.2)',
    },
    emoji: '🌊',
    isPremium: false
  },
  // THÈMES PREMIUM 💎
  pinkDream: {
    name: 'Pink Dream',
    colors: {
      primary: '#ff0080',
      secondary: '#ff8c00',
      background: '#ff0080',
      card: '#FFFFFF',
      text: '#FFFFFF',
      textDark: '#333333',
      border: 'rgba(255, 255, 255, 0.2)',
    },
    emoji: '💖',
    isPremium: true
  },
  auroraGlow: {
    name: 'Aurora Glow',
    colors: {
      primary: '#00f5d4',
      secondary: '#9b5de5',
      background: '#00f5d4',
      card: '#FFFFFF',
      text: '#FFFFFF',
      textDark: '#333333',
      border: 'rgba(255, 255, 255, 0.2)',
    },
    emoji: '🧪',
    isPremium: true
  },
  cyberPunk: {
    name: 'Cyber Punk',
    colors: {
      primary: '#ff007f',
      secondary: '#00e5ff',
      background: '#ff007f',
      card: '#FFFFFF',
      text: '#FFFFFF',
      textDark: '#333333',
      border: 'rgba(255, 255, 255, 0.2)',
    },
    emoji: '🛰️',
    isPremium: true
  },
  lavaFlow: {
    name: 'Lava Flow',
    colors: {
      primary: '#f83600',
      secondary: '#f9d423',
      background: '#f83600',
      card: '#FFFFFF',
      text: '#FFFFFF',
      textDark: '#333333',
      border: 'rgba(255, 255, 255, 0.2)',
    },
    emoji: '🌋',
    isPremium: true
  },
  goldenHour: {
    name: 'Golden Hour',
    colors: {
      primary: '#f6d365',
      secondary: '#fda085',
      background: '#f6d365',
      card: '#FFFFFF',
      text: '#FFFFFF',
      textDark: '#333333',
      border: 'rgba(255, 255, 255, 0.2)',
    },
    emoji: '🌅',
    isPremium: true
  },
  candyPop: {
    name: 'Candy Pop',
    colors: {
      primary: '#ff6fd8',
      secondary: '#ff8a00',
      background: '#ff6fd8',
      card: '#FFFFFF',
      text: '#FFFFFF',
      textDark: '#333333',
      border: 'rgba(255, 255, 255, 0.2)',
    },
    emoji: '🍭',
    isPremium: true
  },
  twilight: {
    name: 'Twilight',
    colors: {
      primary: '#203a43',
      secondary: '#2c5364',
      background: '#203a43',
      card: '#FFFFFF',
      text: '#FFFFFF',
      textDark: '#333333',
      border: 'rgba(255, 255, 255, 0.2)',
    },
    emoji: '🌌',
    isPremium: true
  },
  royalWave: {
    name: 'Royal Wave',
    colors: {
      primary: '#8360c3',
      secondary: '#2ebf91',
      background: '#8360c3',
      card: '#FFFFFF',
      text: '#FFFFFF',
      textDark: '#333333',
      border: 'rgba(255, 255, 255, 0.2)',
    },
    emoji: '👑',
    isPremium: true
  },
  steelGrey: {
    name: 'Steel Grey',
    colors: {
      primary: '#8e9eab',
      secondary: '#eef2f3',
      background: '#8e9eab',
      card: '#FFFFFF',
      text: '#FFFFFF',
      textDark: '#333333',
      border: 'rgba(255, 255, 255, 0.2)',
    },
    emoji: '⚙️',
    isPremium: true
  },
  bubbleGum: {
    name: 'Bubble Gum',
    colors: {
      primary: '#ff9a9e',
      secondary: '#fecfef',
      background: '#ff9a9e',
      card: '#FFFFFF',
      text: '#FFFFFF',
      textDark: '#333333',
      border: 'rgba(255, 255, 255, 0.2)',
    },
    emoji: '🍬',
    isPremium: true
  },
  grapeSoda: {
    name: 'Grape Soda',
    colors: {
      primary: '#a18cd1',
      secondary: '#fbc2eb',
      background: '#a18cd1',
      card: '#FFFFFF',
      text: '#FFFFFF',
      textDark: '#333333',
      border: 'rgba(255, 255, 255, 0.2)',
    },
    emoji: '🍇',
    isPremium: true
  },
  frostMint: {
    name: 'Frost Mint',
    colors: {
      primary: '#a1ffce',
      secondary: '#faffd1',
      background: '#a1ffce',
      card: '#FFFFFF',
      text: '#FFFFFF',
      textDark: '#333333',
      border: 'rgba(255, 255, 255, 0.2)',
    },
    emoji: '🧊',
    isPremium: true
  },
  tealLagoon: {
    name: 'Teal Lagoon',
    colors: {
      primary: '#43cea2',
      secondary: '#185a9d',
      background: '#43cea2',
      card: '#FFFFFF',
      text: '#FFFFFF',
      textDark: '#333333',
      border: 'rgba(255, 255, 255, 0.2)',
    },
    emoji: '🏝️',
    isPremium: true
  },
  neonRise: {
    name: 'Neon Rise',
    colors: {
      primary: '#00f260',
      secondary: '#0575e6',
      background: '#00f260',
      card: '#FFFFFF',
      text: '#FFFFFF',
      textDark: '#333333',
      border: 'rgba(255, 255, 255, 0.2)',
    },
    emoji: '🌈',
    isPremium: true
  },
  roseGold: {
    name: 'Rose Gold',
    colors: {
      primary: '#b76e79',
      secondary: '#ffd1dc',
      background: '#b76e79',
      card: '#FFFFFF',
      text: '#FFFFFF',
      textDark: '#333333',
      border: 'rgba(255, 255, 255, 0.2)',
    },
    emoji: '🌹',
    isPremium: true
  },
  slatePulse: {
    name: 'Slate Pulse',
    colors: {
      primary: '#2b5876',
      secondary: '#4e4376',
      background: '#2b5876',
      card: '#FFFFFF',
      text: '#FFFFFF',
      textDark: '#333333',
      border: 'rgba(255, 255, 255, 0.2)',
    },
    emoji: '🧿',
    isPremium: true
  },
  springMeadow: {
    name: 'Spring Meadow',
    colors: {
      primary: '#56ab2f',
      secondary: '#a8e063',
      background: '#56ab2f',
      card: '#FFFFFF',
      text: '#FFFFFF',
      textDark: '#333333',
      border: 'rgba(255, 255, 255, 0.2)',
    },
    emoji: '🌼',
    isPremium: true
  },
  autumnBreeze: {
    name: 'Autumn Breeze',
    colors: {
      primary: '#d1913c',
      secondary: '#ffd194',
      background: '#d1913c',
      card: '#FFFFFF',
      text: '#FFFFFF',
      textDark: '#333333',
      border: 'rgba(255, 255, 255, 0.2)',
    },
    emoji: '🍂',
    isPremium: true
  },
  winterSky: {
    name: 'Winter Sky',
    colors: {
      primary: '#1e3c72',
      secondary: '#2a5298',
      background: '#1e3c72',
      card: '#FFFFFF',
      text: '#FFFFFF',
      textDark: '#333333',
      border: 'rgba(255, 255, 255, 0.2)',
    },
    emoji: '❄️',
    isPremium: true
  },
  sunrise: {
    name: 'Sunrise',
    colors: {
      primary: '#ff512f',
      secondary: '#dd2476',
      background: '#ff512f',
      card: '#FFFFFF',
      text: '#FFFFFF',
      textDark: '#333333',
      border: 'rgba(255, 255, 255, 0.2)',
    },
    emoji: '🌇',
    isPremium: true
  }
};

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState('purpleDream');
  const [user, setUser] = useState(null);

  // Écouter les changements d'utilisateur
  useEffect(() => {
    loadUserTheme();
  }, []);

  // Récupérer le thème de l'utilisateur depuis l'API
  const loadUserTheme = async () => {
    try {
      const username = await AsyncStorage.getItem('username');
      if (username) {
        const response = await authService.getProfile(username);
        if (response.success) {
          setUser(response.data);
          const userTheme = response.data.selectedTheme || 'purpleDream';
          
          // Vérifier si le thème est premium et si l'user n'est pas premium
          const theme = themes[userTheme];
          if (theme && theme.isPremium && !response.data.isPremium) {
            setCurrentTheme('purpleDream');
          } else {
            setCurrentTheme(userTheme);
          }
        }
      } else {
        setCurrentTheme('purpleDream');
      }
    } catch (error) {
      console.error('Error loading theme:', error);
      setCurrentTheme('purpleDream');
    }
  };

  // Changer de thème et sauvegarder en BDD
  const changeTheme = async (themeName) => {
    if (!themes[themeName]) return;

    const theme = themes[themeName];
    const username = await AsyncStorage.getItem('username');

    // Bloquer les thèmes premium
    if (theme.isPremium && user && !user.isPremium) {
      Alert.alert(
        '🔒 Premium Theme',
        'This theme is reserved for Premium members',
        [{ text: 'OK' }]
      );
      return;
    }

    setCurrentTheme(themeName);

    // Sauvegarder en BDD
    if (username) {
      try {
        await authService.updateTheme(username, themeName);
      } catch (error) {
        console.error('Error saving theme:', error);
      }
    }
  };

  // Mettre à jour les infos user (après upgrade premium par exemple)
  const updateUser = (userData) => {
    setUser(userData);
  };

  // Recharger le thème (après connexion/déconnexion)
  const refreshTheme = async () => {
    await loadUserTheme();
  };

  // Calculer la couleur de texte lisible pour le thème actif
  const activeThemeWithTextColor = {
    ...themes[currentTheme],
    colors: {
      ...themes[currentTheme].colors,
      textColor: getReadableTextColor(themes[currentTheme].colors.primary)
    }
  };

  const value = {
    currentTheme,
    changeTheme,
    themes,
    activeTheme: activeThemeWithTextColor,
    user,
    updateUser,
    refreshTheme
  };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};