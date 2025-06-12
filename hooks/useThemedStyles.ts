// hooks/useThemedStyles.ts
import { useColorScheme } from './useColorScheme';
import { useThemeColor } from './useThemeColor';
import { Colors } from '@/constants/Colors';

/**
 * Hook to get theme-aware styles
 * Combines static styles with dynamic theme colors
 */
export function useThemedStyles() {
  const colorScheme = useColorScheme() ?? 'light';
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'icon');
  const buttonPrimaryColor = useThemeColor({}, 'buttonPrimary');
  const tabIconDefaultColor = Colors[colorScheme].tabIconDefault;

  return {
    // Basic colors
    colors: {
      text: textColor,
      background: backgroundColor,
      border: borderColor,
      buttonPrimary: buttonPrimaryColor,
      tabIconDefault: tabIconDefaultColor,
      modalOverlay: colorScheme === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)',
      cardBackground: colorScheme === 'dark' ? '#333' : '#f5f5f5',
      chipBackground: colorScheme === 'dark' ? '#333' : '#e0e0e0',
      inputBackground: colorScheme === 'dark' ? '#333' : '#f5f5f5',
    },

    // Themed component styles
    themedCard: {
      backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5',
      borderColor: borderColor,
    },

    themedInput: {
      color: textColor,
      borderColor: borderColor,
      backgroundColor: backgroundColor,
    },

    themedModal: {
      backgroundColor: backgroundColor,
      borderColor: borderColor,
    },

    themedModalOverlay: {
      backgroundColor: colorScheme === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)',
    },

    // Helper function to apply theme to any style object
    applyTheme: (style: any) => ({
      ...style,
      color: style.color || textColor,
      backgroundColor: style.backgroundColor || backgroundColor,
      borderColor: style.borderColor || borderColor,
    }),
  };
}

/**
 * Hook to get card-specific themed styles
 */
export function useCardStyles() {
  const colorScheme = useColorScheme() ?? 'light';
  const borderColor = useThemeColor({}, 'icon');

  return {
    card: {
      backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5',
      borderColor: borderColor,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    highlighted: (color?: string) => ({
      borderColor: color || '#FF9800',
      borderWidth: 2,
    }),
  };
}

/**
 * Hook to get modal-specific themed styles
 */
export function useModalStyles() {
  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'icon');

  return {
    overlay: {
      backgroundColor: colorScheme === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)',
    },
    content: {
      backgroundColor: backgroundColor,
      borderColor: borderColor,
    },
  };
}