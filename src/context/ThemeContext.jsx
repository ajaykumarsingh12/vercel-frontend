import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth();

  const [theme, setTheme] = useState(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme;

    // Check for system preference
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return "light";
  });

  useEffect(() => {
    let savedTheme;
    if (user) {
      savedTheme = localStorage.getItem(`theme_${user.id}`);
    } else {
      savedTheme = localStorage.getItem("theme");
    }
    if (savedTheme && savedTheme !== theme) {
      setTheme(savedTheme);
    }
  }, [user]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e) => {
      const savedTheme = localStorage.getItem(user ? `theme_${user.id}` : "theme");
      if (!savedTheme) {
        setTheme(e.matches ? 'dark' : 'light');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [user]);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (user) {
      localStorage.setItem(`theme_${user.id}`, theme);
    } else {
      localStorage.setItem("theme", theme);
    }
  }, [theme, user]);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    // When toggling manually, we overwrite the system preference
    if (user) {
      localStorage.setItem(`theme_${user.id}`, newTheme);
    } else {
      localStorage.setItem("theme", newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
