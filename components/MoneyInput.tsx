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
  /**
   * If provided, overrides dynamic coloring with this color (e.g., '#00FF00')
   */
  staticColor?: string;
}

export function MoneyInput({
  value,
  onChangeText,
  placeholder = '0',
  autoFocus = false,
  clearButtonMode = 'while-editing',
  selectTextOnFocus = true,
  staticColor,
}: MoneyInputProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const borderColor = useThemeColor({}, 'icon');
  const backgroundColor = useThemeColor({}, 'background');
  const placeholderColor = Colors[colorScheme].tabIconDefault;

  // Format currency with $ and commas and decimals
  const formatCurrency = (value: string): string => {
    // Remove any non-numeric except decimal point
    let numericValue = value.replace(/[^0-9.]/g, '');
    // Only allow one decimal point
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      numericValue = parts[0] + '.' + parts.slice(1).join('');
    }
    // Limit to 3 decimal places
    const [whole, decimal] = numericValue.split('.');
    let formattedValue = '';
    if (whole) {
      formattedValue = parseInt(whole, 10).toLocaleString('en-US');
    }
    if (decimal !== undefined) {
      formattedValue += '.' + decimal.slice(0, 3);
    }
    return `$${formattedValue || '0'}`;
  };

  // Handle text change with formatting and decimals
  const handleTextChange = (text: string) => {
    // If input is just a period, prepend a 0
    if (text === '.') {
      onChangeText('0.');
      return;
    }

    // Remove all except digits and decimal
    let numericValue = text.replace(/[^0-9.]/g, '');
    // Only allow one decimal point
    const parts = numericValue.split('.');
    if (parts.length > 2) {
      numericValue = parts[0] + '.' + parts.slice(1).join('');
    }
    // Limit to 3 decimal places
    if (numericValue.includes('.')) {
      const [whole, decimal] = numericValue.split('.');
      numericValue = whole + '.' + (decimal ? decimal.slice(0, 3) : '');
    }
    onChangeText(numericValue);
  };

  // Determine text color and style based on amount, or use staticColor
  const getAmountStyle = () => {
    if (staticColor) {
      return { color: staticColor };
    }
    // Parse as float for dynamic coloring
    const amount = parseFloat(value);
    const style: any = {};
    let powerIndex = 0;
    let lowerBound = 0;
    while (lowerBound * 3 < amount) {
      lowerBound = Math.max(1, lowerBound * 3);
      powerIndex++;
    }
    // Create progressively darker shades of green with more contrast
    // Adjust brightness based on dark/light mode
    if (colorScheme === 'dark') {
      switch (powerIndex) {
        case 0: style.color = '#c5e1a5'; break;
        case 1: style.color = '#9ccc65'; break;
        case 2: style.color = '#7cb342'; break;
        case 3: style.color = '#689f38'; break;
        case 4: style.color = '#558b2f'; break;
        case 5: style.color = '#33691e'; break;
        case 6: style.color = '#2e5e1a'; break;
        default: style.color = '#c5e1a5';
          style.textShadowColor = '#33691e';
          style.textShadowOffset = { width: 0, height: 0 };
          style.textShadowRadius = 8;
          style.letterSpacing = 1.5;
          break;
      }
    } else {
      switch (powerIndex) {
        case 0: style.color = '#dcedc8'; break;
        case 1: style.color = '#aed581'; break;
        case 2: style.color = '#8bc34a'; break;
        case 3: style.color = '#66bb6a'; break;
        case 4: style.color = '#43a047'; break;
        case 5: style.color = '#2e7d32'; break;
        case 6: style.color = '#1b5e20'; break;
        default: style.color = '#dcedc8';
          style.textShadowColor = '#2e7d32';
          style.textShadowOffset = { width: 0, height: 0 };
          style.textShadowRadius = 6;
          style.letterSpacing = 1.5;
          break;
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
