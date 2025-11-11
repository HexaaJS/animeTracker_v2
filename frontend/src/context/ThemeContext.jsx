import React, { createContext, useState, useContext, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme doit être utilisé dans un ThemeProvider');
    }
    return context;
};

// Thèmes disponibles
export const themes = {
    purpleDream: {
        name: 'Purple Dream',
        gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        primary: '#667eea',
        secondary: '#764ba2',
        emoji: '🟣',
        isPremium: false
    },
    oceanBlue: {
        name: 'Ocean Blue',
        gradient: 'linear-gradient(135deg, #2196F3 0%, #21CBF3 100%)',
        primary: '#2196F3',
        secondary: '#21CBF3',
        emoji: '🔵',
        isPremium: false
    },
    forestGreen: {
        name: 'Forest Green',
        gradient: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
        primary: '#11998e',
        secondary: '#38ef7d',
        emoji: '🟢',
        isPremium: false
    },
    sunsetRed: {
        name: 'Sunset Red',
        gradient: 'linear-gradient(135deg, #ee0979 0%, #ff6a00 100%)',
        primary: '#ee0979',
        secondary: '#ff6a00',
        emoji: '🔴',
        isPremium: false
    },
    orangeBlast: {
        name: 'Orange Blast',
        gradient: 'linear-gradient(135deg, #f46b45 0%, #eea849 100%)',
        primary: '#f46b45',
        secondary: '#eea849',
        emoji: '🟠',
        isPremium: false
    },
    darkNight: {
        name: 'Dark Night',
        gradient: 'linear-gradient(135deg, #232526 0%, #414345 100%)',
        primary: '#232526',
        secondary: '#414345',
        emoji: '⚫',
        isPremium: false
    },
    mintFresh: {
        name: 'Mint Fresh',
        gradient: 'linear-gradient(135deg, #00b4db 0%, #0083b0 100%)',
        primary: '#00b4db',
        secondary: '#0083b0',
        emoji: '🌊',
        isPremium: false
    },
    // THÈMES PREMIUM (À partir d'ici) 💎
    pinkDream: {
        name: 'Pink Dream',
        gradient: 'linear-gradient(135deg, #ff0080 0%, #ff8c00 100%)',
        primary: '#ff0080',
        secondary: '#ff8c00',
        emoji: '💖',
        isPremium: true
    },
    auroraGlow: {
        name: 'Aurora Glow',
        gradient: 'linear-gradient(135deg, #00f5d4 0%, #9b5de5 100%)',
        primary: '#00f5d4',
        secondary: '#9b5de5',
        emoji: '🧪',
        isPremium: true
    },
    cyberPunk: {
        name: 'Cyber Punk',
        gradient: 'linear-gradient(135deg, #ff007f 0%, #00e5ff 100%)',
        primary: '#ff007f',
        secondary: '#00e5ff',
        emoji: '🛰️',
        isPremium: true
    },
    lavaFlow: {
        name: 'Lava Flow',
        gradient: 'linear-gradient(135deg, #f83600 0%, #f9d423 100%)',
        primary: '#f83600',
        secondary: '#f9d423',
        emoji: '🌋',
        isPremium: true
    },
    goldenHour: {
        name: 'Golden Hour',
        gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
        primary: '#f6d365',
        secondary: '#fda085',
        emoji: '🌅',
        isPremium: true
    },
    candyPop: {
        name: 'Candy Pop',
        gradient: 'linear-gradient(135deg, #ff6fd8 0%, #ff8a00 100%)',
        primary: '#ff6fd8',
        secondary: '#ff8a00',
        emoji: '🍭',
        isPremium: true
    },
    twilight: {
        name: 'Twilight',
        gradient: 'linear-gradient(135deg, #203a43 0%, #2c5364 100%)',
        primary: '#203a43',
        secondary: '#2c5364',
        emoji: '🌌',
        isPremium: true
    },
    royalWave: {
        name: 'Royal Wave',
        gradient: 'linear-gradient(135deg, #8360c3 0%, #2ebf91 100%)',
        primary: '#8360c3',
        secondary: '#2ebf91',
        emoji: '👑',
        isPremium: true
    },
    steelGrey: {
        name: 'Steel Grey',
        gradient: 'linear-gradient(135deg, #8e9eab 0%, #eef2f3 100%)',
        primary: '#8e9eab',
        secondary: '#eef2f3',
        emoji: '⚙️',
        isPremium: true
    },
    bubbleGum: {
        name: 'Bubble Gum',
        gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
        primary: '#ff9a9e',
        secondary: '#fecfef',
        emoji: '🍬',
        isPremium: true
    },
    grapeSoda: {
        name: 'Grape Soda',
        gradient: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
        primary: '#a18cd1',
        secondary: '#fbc2eb',
        emoji: '🍇',
        isPremium: true
    },
    frostMint: {
        name: 'Frost Mint',
        gradient: 'linear-gradient(135deg, #a1ffce 0%, #faffd1 100%)',
        primary: '#a1ffce',
        secondary: '#faffd1',
        emoji: '🧊',
        isPremium: true
    },
    tealLagoon: {
        name: 'Teal Lagoon',
        gradient: 'linear-gradient(135deg, #43cea2 0%, #185a9d 100%)',
        primary: '#43cea2',
        secondary: '#185a9d',
        emoji: '🏝️',
        isPremium: true
    },
    neonRise: {
        name: 'Neon Rise',
        gradient: 'linear-gradient(135deg, #00f260 0%, #0575e6 100%)',
        primary: '#00f260',
        secondary: '#0575e6',
        emoji: '🌈',
        isPremium: true
    },
    roseGold: {
        name: 'Rose Gold',
        gradient: 'linear-gradient(135deg, #b76e79 0%, #ffd1dc 100%)',
        primary: '#b76e79',
        secondary: '#ffd1dc',
        emoji: '🌹',
        isPremium: true
    },
    slatePulse: {
        name: 'Slate Pulse',
        gradient: 'linear-gradient(135deg, #2b5876 0%, #4e4376 100%)',
        primary: '#2b5876',
        secondary: '#4e4376',
        emoji: '🧿',
        isPremium: true
    },
    springMeadow: {
        name: 'Spring Meadow',
        gradient: 'linear-gradient(135deg, #56ab2f 0%, #a8e063 100%)',
        primary: '#56ab2f',
        secondary: '#a8e063',
        emoji: '🌼',
        isPremium: true
    },
    autumnBreeze: {
        name: 'Autumn Breeze',
        gradient: 'linear-gradient(135deg, #d1913c 0%, #ffd194 100%)',
        primary: '#d1913c',
        secondary: '#ffd194',
        emoji: '🍂',
        isPremium: true
    },
    winterSky: {
        name: 'Winter Sky',
        gradient: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
        primary: '#1e3c72',
        secondary: '#2a5298',
        emoji: '❄️',
        isPremium: true
    },
    sunrise: {
        name: 'Sunrise',
        gradient: 'linear-gradient(135deg, #ff512f 0%, #dd2476 100%)',
        primary: '#ff512f',
        secondary: '#dd2476',
        emoji: '🌇',
        isPremium: true
    }
};

export const ThemeProvider = ({ children }) => {
    const [currentTheme, setCurrentTheme] = useState('purpleDream');

    // Charger le thème depuis localStorage
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme && themes[savedTheme]) {
            setCurrentTheme(savedTheme);
            applyTheme(savedTheme);
        } else {
            applyTheme('purpleDream');
        }
    }, []);

    // Appliquer le thème via CSS variables
    const applyTheme = (themeName) => {
        const theme = themes[themeName];
        if (theme) {
            document.documentElement.style.setProperty('--gradient', theme.gradient);
            document.documentElement.style.setProperty('--primary-color', theme.primary);
            document.documentElement.style.setProperty('--secondary-color', theme.secondary);
        }
    };

    // Changer de thème
    const changeTheme = (themeName) => {
        if (themes[themeName]) {
            setCurrentTheme(themeName);
            localStorage.setItem('theme', themeName);
            applyTheme(themeName);
        }
    };

    const value = {
        currentTheme,
        changeTheme,
        themes,
        activeTheme: themes[currentTheme]
    };

    return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};