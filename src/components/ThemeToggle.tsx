import { useThemeStore } from '../stores/themeStore'
import './ThemeToggle.css'

export const ThemeToggle = () => {
  const { currentTheme, toggleTheme } = useThemeStore()

  const themeIcon = currentTheme === 'light' ? 'dark_mode' : 'light_mode'
  const themeTooltip = currentTheme === 'light' 
    ? 'Switch to dark mode' 
    : 'Switch to light mode'

  return (
    <button
      onClick={toggleTheme}
      className="theme-toggle-button"
      title={themeTooltip}
      aria-label="Toggle theme"
    >
      <span className="material-symbols-outlined theme-icon">
        {themeIcon}
      </span>
    </button>
  )
}

export default ThemeToggle