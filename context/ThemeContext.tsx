import React, { createContext, useContext, useState } from 'react';
import { useColorScheme } from 'react-native';

export const Colors = {
    light: {
        background: "#FDFCFB", // Very light creamy beige
        surface: "#FFFFFF",
        header: "#F5F2F0",     // Subtly darker cream for depth
        text: "#2A1B12",       // Deep coffee bean brown-grey
        textMuted: "#8D7E75",  // Sophisticated warm muted grey
        border: "rgba(42, 27, 18, 0.05)", // Coffee-tinted borders
        card: "#FFFFFF",
        primary: "#C67C4E",    // Signature Brand Orange
        error: "#D32F2F",      // Slightly more professional red
        success: "#388E3C",    // Slightly more professional green
        tabBar: "#FFFFFF",
        tabInactive: "#B8B0AC", // Warmer inactive grey
        searchBg: "#F0EBE7",   // Warm-tinted search background
        searchIcon: "#8D7E75",
        label: "#2A1B12",
        isDark: false,
    },
    dark: {
        background: "#050505",
        surface: "#111111",
        header: "#131313",
        text: "#FFFFFF",
        textMuted: "#A2A2A2",
        border: "rgba(255,255,255,0.05)",
        card: "#111111",
        primary: "#C67C4E",
        error: "#FF4B4B",
        success: "#4CAF50",
        tabBar: "#0D0D0D",
        tabInactive: "#666666",
        searchBg: "#222222",
        searchIcon: "#666666",
        label: "#FFFFFF",
        isDark: true,
    }
};

type ThemeContextType = {
    isDark: boolean;
    theme: typeof Colors.light;
    toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemScheme = useColorScheme();
    const [isDark, setIsDark] = useState(systemScheme === 'dark');

    const toggleTheme = () => {
        setIsDark(!isDark);
    };

    const theme = isDark ? Colors.dark : Colors.light;

    return (
        <ThemeContext.Provider value={{ isDark, theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
