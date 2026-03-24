import React from 'react';
import { Button } from './ui/button';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle = ({ variant = "ghost", size = "sm", showLabel = false, className = "" }) => {
  const { theme, toggleTheme } = useTheme();

  const getThemeIcon = () => {
    return theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />;
  };

  const getThemeLabel = () => {
    return theme === 'dark' ? 'Light' : 'Dark';
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={toggleTheme}
      className={`shrink-0 ${className || "text-white hover:bg-white/10 dark:hover:bg-white/5"}`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
    >
      {getThemeIcon()}
      {showLabel && (
        <span className="ml-2 hidden md:inline">{getThemeLabel()}</span>
      )}
    </Button>
  );
};

export default ThemeToggle;