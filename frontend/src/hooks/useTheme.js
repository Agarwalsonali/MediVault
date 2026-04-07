import { useEffect, useState } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState(() => {
    // Check localStorage first, then system preference
    const stored = localStorage.getItem('theme');
    if (stored) return stored;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    // Apply theme to document immediately
    const applyTheme = (themeValue) => {
      document.documentElement.setAttribute('data-theme', themeValue);
      document.documentElement.style.colorScheme = themeValue;
      localStorage.setItem('theme', themeValue);
      console.log('Theme applied:', themeValue, 'data-theme:', document.documentElement.getAttribute('data-theme'));
    };
    
    applyTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    document.documentElement.style.colorScheme = newTheme;
    localStorage.setItem('theme', newTheme);
    console.log('Theme toggled to:', newTheme);
    setTheme(newTheme);
  };

  return { theme, toggleTheme };
}
