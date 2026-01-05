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
        background: "#0C0C0C", // Deep noir but with a hint of depth
        surface: "#111111",    // Elevated surface
        header: "#0C0C0C",
        text: "#FFFFFF",
        textMuted: "#A2A2A2",
        border: "rgba(255,255,255,0.06)",
        card: "#111111",
        primary: "#C67C4E",
        error: "#FF4B4B",
        success: "#4CAF50",
        tabBar: "#111111",
        tabInactive: "#666666",
        searchBg: "#1A1A1A",
        searchIcon: "#777777",
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
