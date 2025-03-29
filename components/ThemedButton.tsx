import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ViewStyle,
  TextStyle,
  ActivityIndicator,
} from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';

type ButtonType = 'primary' | 'secondary' | 'outline' | 'danger' | 'accent';

interface ThemedButtonProps {
  title: string;
  onPress: () => void;
  type?: ButtonType;
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
}

export function ThemedButton({
  title,
  onPress,
  type = 'primary',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
}: ThemedButtonProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const buttonPrimaryColor = useThemeColor({}, 'buttonPrimary');
  const buttonSecondaryColor = useThemeColor({}, 'buttonSecondary');
  const buttonDangerColor = useThemeColor({}, 'buttonDanger');
  const buttonAccentColor = useThemeColor({}, 'buttonAccent');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'border');

  // Determine button styles based on type
  const getButtonStyles = () => {
    switch (type) {
      case 'primary':
        return {
          backgroundColor: buttonPrimaryColor,
          borderColor: buttonPrimaryColor,
          textColor: '#FFFFFF',
        };
      case 'secondary':
        return {
          backgroundColor: buttonSecondaryColor,
          borderColor: buttonSecondaryColor,
          textColor: '#FFFFFF',
        };
      case 'outline':
        return {
          backgroundColor: 'transparent',
          borderColor: buttonPrimaryColor,
          textColor: buttonPrimaryColor,
        };
      case 'danger':
        return {
          backgroundColor: buttonDangerColor,
          borderColor: buttonDangerColor,
          textColor: '#FFFFFF',
        };
      case 'accent':
        return {
          backgroundColor: buttonAccentColor,
          borderColor: buttonAccentColor,
          textColor: '#000000', // Black text for gold background
        };
      default:
        return {
          backgroundColor: buttonPrimaryColor,
          borderColor: buttonPrimaryColor,
          textColor: '#FFFFFF',
        };
    }
  };

  const buttonStyles = getButtonStyles();

  return (
    <TouchableOpacity
      style={[
        styles.button,
        {
          backgroundColor: buttonStyles.backgroundColor,
          borderColor: buttonStyles.borderColor,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
    >
      {loading ? (
        <ActivityIndicator size="small" color={buttonStyles.textColor} />
      ) : (
        <>
          {icon && <>{icon}</>}
          <Text
            style={[
              styles.text,
              { color: buttonStyles.textColor },
              icon ? styles.textWithIcon : null,
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 100,
  },
  text: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textWithIcon: {
    marginLeft: 8,
  },
});
