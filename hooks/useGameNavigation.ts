import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { useThemeColor } from './useThemeColor';
import { StyleSheet } from 'react-native';
import React from 'react';

export function useGameNavigation(title: string, onBack: null | (() => void)) {
  const textColor = useThemeColor({}, 'text');

  const screenOptions: any = {
    headerShown: true,
    headerTitleAlign: 'center',
    headerTitle: title,
    headerLeft: onBack && (() => React.createElement(
      TouchableOpacity,
      {
        onPress: onBack,
        style: styles.backButton
      },
      React.createElement(
        Ionicons,
        {
          name: "arrow-back",
          size: 24,
          color: textColor
        }
      )
    ))
  };

  return { screenOptions };
}

const styles = StyleSheet.create({
  backButton: {
    paddingLeft: 20,
    paddingRight: 20,
  },
});