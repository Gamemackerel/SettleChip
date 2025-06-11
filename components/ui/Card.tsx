import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { ThemedText } from '@/components/ThemedText';
import { StyleSheet } from 'react-native';

export function Card({
  onPress,
  children,
  highlighted = false,
  highlightColor
}: {
  onPress?: () => void;
  children: React.ReactNode;
  highlighted?: boolean;
  highlightColor?: string;
}) {
  const colorScheme = useColorScheme() ?? 'light';
  const cardBackground = colorScheme === 'dark' ? '#333' : '#f5f5f5';
  const borderColor = useThemeColor({}, 'icon');

  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper
      onPress={onPress}
      style={[
        styles.card,
        {
          backgroundColor: cardBackground,
          borderColor: highlighted ? (highlightColor || '#FF9800') : borderColor,
          borderWidth: highlighted ? 2 : 1,
        }
      ]}
    >
      {children}
    </CardWrapper>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: 10,
    borderWidth: 1,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
});