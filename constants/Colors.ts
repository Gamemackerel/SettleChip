/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

// Poker-themed colors
const pokerGreen = '#2E7D32'; // Dark green like a poker table
const pokerRed = '#C62828';   // Deep red like poker chips
const pokerBlack = '#212121'; // Dark black for contrast
const pokerGold = '#FFC107';  // Gold accent for highlights

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: pokerGreen,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: pokerGreen,
    border: '#E0E0E0',
    buttonPrimary: pokerGreen,
    buttonSecondary: '#757575',
    buttonDanger: pokerRed,
    buttonAccent: pokerGold,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: '#8BC34A', // Lighter green for dark mode
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#8BC34A',
    border: '#333333',
    buttonPrimary: '#388E3C', // Lighter green for dark mode
    buttonSecondary: '#616161',
    buttonDanger: '#EF5350', // Lighter red for dark mode
    buttonAccent: '#FFD54F', // Lighter gold for dark mode
  },
};
