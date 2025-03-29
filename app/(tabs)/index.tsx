import React, { useState, useRef } from 'react';
import {
  StyleSheet,
  TextInput,
  Button,
  View,
  Platform,
  TouchableOpacity,
  Keyboard,
  ScrollView,
  Text
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';

// Define chip types with their colors and values
type ChipType = {
  id: string;
  color: string;
  displayName: string;
  value: number;
  quantity: number;
};

const defaultChips: ChipType[] = [
  { id: 'white', color: '#FFFFFF', displayName: 'White', value: 1, quantity: 50 },
  { id: 'red', color: '#E53935', displayName: 'Red', value: 5, quantity: 30 },
  { id: 'blue', color: '#1E88E5', displayName: 'Blue', value: 10, quantity: 20 },
  { id: 'green', color: '#43A047', displayName: 'Green', value: 25, quantity: 10 },
  { id: 'black', color: '#212121', displayName: 'Black', value: 100, quantity: 5 },
];

// Custom themed input component
function ThemedInput({
  style,
  placeholder,
  keyboardType = 'default',
  value,
  onChangeText,
  ...rest
}: React.ComponentProps<typeof TextInput> & {
  lightColor?: string;
  darkColor?: string;
}) {
  const colorScheme = useColorScheme() ?? 'light';
  const textColor = useThemeColor({}, 'text');
  const borderColor = Colors[colorScheme].icon;
  const placeholderColor = Colors[colorScheme].tabIconDefault;
  const backgroundColor = useThemeColor({}, 'background');

  return (
    <TextInput
      style={[
        styles.input,
        {
          color: textColor,
          borderColor,
          backgroundColor,
        },
        style,
      ]}
      placeholder={placeholder}
      placeholderTextColor={placeholderColor}
      keyboardType={keyboardType}
      value={value}
      onChangeText={onChangeText}
      {...rest}
    />
  );
}

// Chip configuration item component
function ChipConfigItem({
  chip,
  onQuantityChange
}: {
  chip: ChipType;
  onQuantityChange: (id: string, quantity: number) => void;
}) {
  const colorScheme = useColorScheme() ?? 'light';
  const textColor = useThemeColor({}, 'text');
  const borderColor = Colors[colorScheme].icon;

  return (
    <View style={styles.chipRow}>
      <View style={[styles.chipColorCircle, { backgroundColor: chip.color, borderColor }]}>
        <View style={[styles.chipColorCircleInner, {
          borderColor,
          // For dark chips, use a lighter inner circle border
          backgroundColor: chip.id === 'black' && colorScheme === 'dark' ? '#444' : chip.color
        }]} />
      </View>
      <ThemedText style={styles.chipName}>{chip.displayName}</ThemedText>
      <ThemedText style={styles.chipValue}>${chip.value}</ThemedText>
      <ThemedInput
        style={styles.chipQuantityInput}
        keyboardType="numeric"
        value={chip.quantity.toString()}
        onChangeText={(text) => {
          const quantity = parseInt(text) || 0;
          onQuantityChange(chip.id, quantity);
        }}
      />
    </View>
  );
}

// Tag/Chip Input component for player names
function PlayerTagInput({
  players,
  onAddPlayer,
  onRemovePlayer
}: {
  players: string[];
  onAddPlayer: (name: string) => void;
  onRemovePlayer: (index: number) => void;
}) {
  const [inputValue, setInputValue] = useState('');
  const inputRef = useRef<TextInput>(null);
  const colorScheme = useColorScheme() ?? 'light';
  const textColor = useThemeColor({}, 'text');
  const borderColor = Colors[colorScheme].icon;
  const backgroundColor = useThemeColor({}, 'background');
  const chipBgColor = colorScheme === 'dark' ? '#333' : '#e0e0e0';

  // Determine text alignment based on whether players exist
  const textAlignment = players.length > 0 ? 'left' : 'center';

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onAddPlayer(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyPress = (e: any) => {
    if (e.nativeEvent.key === 'Enter' || e.nativeEvent.key === 'Return') {
      handleSubmit();
    }
  };

  return (
    <View style={[styles.tagInputContainer, { borderColor }]}>
      <ScrollView
        horizontal={false}
        contentContainerStyle={styles.tagScrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.tagsContainer}>
          {players.map((player, index) => (
            <View
              key={index}
              style={[styles.tagChip, { backgroundColor: chipBgColor }]}
            >
              <ThemedText style={styles.tagText}>{player}</ThemedText>
              <TouchableOpacity
                onPress={() => onRemovePlayer(index)}
                style={styles.tagRemoveButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close-circle" size={18} color={Colors[colorScheme].text} />
              </TouchableOpacity>
            </View>
          ))}
          <TextInput
            ref={inputRef}
            style={[
              styles.tagInput,
              {
                color: textColor,
                width: '80%',
                textAlign: textAlignment as 'left' | 'center'
              }
            ]}
            value={inputValue}
            onChangeText={setInputValue}
            placeholder="Who's playing?"
            placeholderTextColor={Colors[colorScheme].tabIconDefault}
            onSubmitEditing={handleSubmit}
            onKeyPress={handleKeyPress}
            blurOnSubmit={false}
            returnKeyType="done"
          />
        </View>
      </ScrollView>
    </View>
  );
}

export default function SetupGameScreen() {
  const [players, setPlayers] = useState<string[]>([]);
  const [buyInAmount, setBuyInAmount] = useState('20');
  const [chips, setChips] = useState<ChipType[]>(defaultChips);
  const colorScheme = useColorScheme() ?? 'light';

  const handleChipQuantityChange = (id: string, quantity: number) => {
    setChips(chips.map(chip =>
      chip.id === id ? { ...chip, quantity } : chip
    ));
  };

  const handleAddPlayer = (name: string) => {
    if (name && !players.includes(name)) {
      setPlayers([...players, name]);
    }
  };

  const handleRemovePlayer = (index: number) => {
    const newPlayers = [...players];
    newPlayers.splice(index, 1);
    setPlayers(newPlayers);
  };

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

  // Handle buy-in amount change with formatting
  const handleBuyInChange = (value: string) => {
    // Strip formatting to store raw number
    const numericValue = value.replace(/[^0-9]/g, '');
    setBuyInAmount(numericValue);
  };

  // Determine text color and style based on buy-in amount
  const getBuyInStyle = () => {
    const amount = parseInt(buyInAmount, 10);
    const style: any = {};

    // Start with yellow at 0
    if (amount === 0) {
      style.color = colorScheme === 'dark' ? '#ffeb3b' : '#fbc02d'; // Yellow
      return style;
    }

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

  const displayBuyInAmount = formatCurrency(buyInAmount);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView style={styles.outerContainer}>
        <ThemedText type="title" style={styles.title}>Setup Game</ThemedText>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Buy-in Amount (Global) with money bag emoji */}
          <View style={styles.buyInContainer}>
            <ThemedText style={styles.sectionHeader}>
              Buy <Text style={styles.moneyBagEmoji}>💰</Text> In
            </ThemedText>
            <ThemedInput
              keyboardType="numeric"
              value={displayBuyInAmount}
              onChangeText={handleBuyInChange}
              style={[
                styles.buyInInput,
                getBuyInStyle()
              ]}
            />
            <ThemedText style={styles.buyInSubLabel}>(per player)</ThemedText>
          </View>

          {/* Players Section */}
          <View style={styles.sectionContainer}>
            <ThemedText style={styles.sectionHeader}>Players</ThemedText>
            <View style={styles.inputWrapper}>
              <PlayerTagInput
                players={players}
                onAddPlayer={handleAddPlayer}
                onRemovePlayer={handleRemovePlayer}
              />
            </View>
          </View>

          {/* Chip Configuration */}
          <ThemedText style={styles.sectionHeader}>Chip Configuration</ThemedText>
          <View style={styles.chipHeaderRow}>
            <ThemedText style={styles.chipHeaderColor}>Color</ThemedText>
            <ThemedText style={styles.chipHeaderName}>Name</ThemedText>
            <ThemedText style={styles.chipHeaderValue}>Value</ThemedText>
            <ThemedText style={styles.chipHeaderQuantity}>Quantity</ThemedText>
          </View>

          <View style={styles.chipList}>
            {chips.map(chip => (
              <ChipConfigItem
                key={chip.id}
                chip={chip}
                onQuantityChange={handleChipQuantityChange}
              />
            ))}
          </View>

          <Button
            title="Start Game"
            // onPress={handleStartGame}
          />
        </ScrollView>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    padding: 20,
    paddingBottom: 0
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginTop: 15,
    alignSelf: 'flex-start',
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderRadius: 5,
    marginTop: 5,
    marginBottom: 0,
    paddingHorizontal: 10,
    width: '100%',
    textAlignVertical: 'center',
    paddingVertical: 0,
  },
  globalInput: {
    marginBottom: 20,
  },
  // Buy-in specific styles
  buyInContainer: {
    width: '100%',
    alignItems: 'center',
  },
  moneyBagEmoji: {
    fontSize: 32,
  },
  buyInSubLabel: {
    fontSize: 12,
    marginTop: 0,
    opacity: 0.7,
  },
  buyInInput: {
    height: 50,
    borderWidth: 1,
    borderRadius: 10,
    width: '80%',
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    paddingHorizontal: 15,
    marginBottom: 0,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    width: '100%',
    paddingLeft: '5%',
    paddingTop: 12,
    textAlign: 'left',
  },
  sectionContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 20,
  },
  inputWrapper: {
    width: '80%',
  },
  // Tag Input styles
  tagInputContainer: {
    borderWidth: 1,
    borderRadius: 5,
    minHeight: 50,
    width: '100%',
    padding: 5,
  },
  tagScrollContainer: {
    flexGrow: 1,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    margin: 3,
  },
  tagText: {
    fontSize: 14,
    marginRight: 5,
  },
  tagRemoveButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  tagInput: {
    minWidth: 100,
    height: 40,
    padding: 5,
    flex: 1,
  },
  // Chip styles
  chipList: {
    width: '100%',
    marginBottom: 20,
  },
  chipHeaderRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 5,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  chipHeaderColor: {
    width: 50,
    textAlign: 'center',
  },
  chipHeaderName: {
    flex: 1,
    textAlign: 'left',
  },
  chipHeaderValue: {
    width: 60,
    textAlign: 'center',
  },
  chipHeaderQuantity: {
    width: 80,
    textAlign: 'center',
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginVertical: 5,
  },
  chipColorCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    marginRight: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  chipColorCircleInner: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
  },
  chipName: {
    flex: 1,
  },
  chipValue: {
    width: 60,
    textAlign: 'center',
  },
  chipQuantityInput: {
    width: 80,
    height: 35,
    marginLeft: 10,
    textAlign: 'center',
    paddingVertical: 0,
    textAlignVertical: 'center',
    fontSize: 14,
    includeFontPadding: false,
  },
});
