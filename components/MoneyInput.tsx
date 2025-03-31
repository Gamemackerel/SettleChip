import React from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { Colors } from '@/constants/Colors';

interface MoneyInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
  clearButtonMode?: 'never' | 'while-editing' | 'unless-editing' | 'always';
  selectTextOnFocus?: boolean;
}

export function MoneyInput({
  value,
  onChangeText,
  placeholder = 'Enter amount',
  autoFocus = false,
  clearButtonMode = 'while-editing',
  selectTextOnFocus = true,
}: MoneyInputProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const borderColor = useThemeColor({}, 'icon');
  const backgroundColor = useThemeColor({}, 'background');
  const placeholderColor = Colors[colorScheme].tabIconDefault;

  // Format currency with $ and commas
  const formatCurrency = (value: string): string => {
    // Remove any non-numeric characters
    const numericValue = value.replace(/[^0-9]/g, '');

    // Format with commas for thousands
    let formattedValue = '';
    if (numericValue) {
      formattedValue = parseInt(numericValue, 10).toLocaleString('en-US');
    }

    return `$${formattedValue || '0'}`;
  };

  // Handle text change with formatting
  const handleTextChange = (text: string) => {
    // Strip formatting to store raw number
    const numericValue = text.replace(/[^0-9]/g, '');
    onChangeText(numericValue);
  };

  // Determine text color and style based on amount
  const getAmountStyle = () => {
    const amount = parseInt(value, 10);
    const style: any = {};

    // Find which power range the amount falls into
    let powerIndex = 0;
    let lowerBound = 0;

    while (lowerBound * 3 < amount) {
      lowerBound = Math.max(1, lowerBound * 3);
      powerIndex++;
    }

    // Create progressively darker shades of green with more contrast
    // Adjust brightness based on dark/light mode
    if (colorScheme === 'dark') {
      // Brighter greens for dark mode with increased contrast
      switch (powerIndex) {
        case 0: style.color = '#c5e1a5'; break; // Very light green (lightest)
        case 1: style.color = '#9ccc65'; break; // Light green
        case 2: style.color = '#7cb342'; break; // Medium light green
        case 3: style.color = '#689f38'; break; // Medium green
        case 4: style.color = '#558b2f'; break; // Medium dark green
        case 5: style.color = '#33691e'; break; // Dark green
        case 6: style.color = '#2e5e1a'; break; // Darker green
        default: style.color = '#c5e1a5';
          style.textShadowColor = '#33691e';
          style.textShadowOffset = { width: 0, height: 0 };
          style.textShadowRadius = 8;
          style.letterSpacing = 1.5;
          break; // Extremely dark green with stronger glow and spacing
      }
    } else {
      // Darker greens for light mode with increased contrast
      switch (powerIndex) {
        case 0: style.color = '#dcedc8'; break; // Very light green (lightest)
        case 1: style.color = '#aed581'; break; // Light green
        case 2: style.color = '#8bc34a'; break; // Medium light green
        case 3: style.color = '#66bb6a'; break; // Medium green
        case 4: style.color = '#43a047'; break; // Medium dark green
        case 5: style.color = '#2e7d32'; break; // Dark green
        case 6: style.color = '#1b5e20'; break; // Darker green
        default: style.color = '#dcedc8';
          style.textShadowColor = '#2e7d32';
          style.textShadowOffset = { width: 0, height: 0 };
          style.textShadowRadius = 6;
          style.letterSpacing = 1.5;
          break; // Extremely dark green with glow and spacing
      }
    }

    return style;
  };

  const displayValue = formatCurrency(value);

  return (
    <View style={styles.container}>
      <TextInput
        style={[
          styles.input,
          {
            borderColor,
            backgroundColor,
          },
          getAmountStyle()
        ]}
        value={displayValue}
        onChangeText={handleTextChange}
        keyboardType="numeric"
        placeholder={placeholder}
        placeholderTextColor={placeholderColor}
        autoFocus={autoFocus}
        clearButtonMode={clearButtonMode}
        selectTextOnFocus={selectTextOnFocus}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    alignItems: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    width: '80%',
    marginBottom: 0,
  }
});
