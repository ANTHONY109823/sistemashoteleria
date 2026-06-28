import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    // LOCKED TO LIGHT MODE — always start as light, ignore OS preference
    const [theme] = useState<Theme>('light');

    useEffect(() => {
        const root = window.document.documentElement;
        // Remove dark class if previously stored, force light always
        root.classList.remove('dark');
        root.classList.add('light');
        localStorage.removeItem('theme'); // clear any stored dark preference
    }, []);

    // No-op togglers — theme is locked to light
    const toggleTheme = () => {};
    const setTheme = (_: Theme) => {};

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
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
