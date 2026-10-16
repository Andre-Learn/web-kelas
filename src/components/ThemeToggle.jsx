import Icon from './Icon.jsx';
import { useTheme } from '../context/ThemeContext.jsx';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';
  return (
    <button
      type="button"
      className={`theme-toggle ${className}`}
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light theme' : 'Switch to dark theme'}
      title={isDark ? 'Light theme' : 'Dark theme'}
    >
      <span className="theme-toggle__icon" data-visible={!isDark}>
        <Icon name="moon" size={18} />
      </span>
      <span className="theme-toggle__icon" data-visible={isDark}>
        <Icon name="sun" size={18} />
      </span>
    </button>
  );
}
