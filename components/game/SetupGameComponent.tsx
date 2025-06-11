import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  TouchableOpacity,
  ScrollView,
  Text,
  Alert,
  Modal
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useGameNavigation } from '@/hooks/useGameNavigation';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedButton } from '@/components/ThemedButton';
import { MoneyInput } from '@/components/MoneyInput';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useGameContext } from '@/context/GameContext';
import { Collapsible } from '@/components/Collapsible';
import { findAllSolutions, findBestSolution } from '@/utils/distributionAlgorithm';
import { ChipType } from '@/types/types';
import { chipConfigurationStyles } from '@/styles/styles';

const defaultChips: ChipType[] = [
  { id: 'white', color: '#FFFFFF', displayName: 'White', value: 1, quantity: 0 },
  { id: 'red', color: '#E53935', displayName: 'Red', value: 5, quantity: 0 },
  { id: 'blue', color: '#1E88E5', displayName: 'Blue', value: 10, quantity: 0 },
  { id: 'green', color: '#43A047', displayName: 'Green', value: 25, quantity: 0 },
  { id: 'black', color: '#212121', displayName: 'Black', value: 100, quantity: 0 },
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
}: {
  chip: ChipType;
}) {
  const colorScheme = useColorScheme() ?? 'light';
  const borderColor = Colors[colorScheme].icon;
  return (
    <View style={chipConfigurationStyles.chipRow}>
      <View style={[chipConfigurationStyles.chipColorCircle, { backgroundColor: chip.color, borderColor }]}>
        <View style={[chipConfigurationStyles.chipColorCircleInner, { borderColor, backgroundColor: chip.id === 'black' && colorScheme === 'dark' ? '#444' : chip.color }]} />
      </View>
      <ThemedText style={chipConfigurationStyles.chipName}>{chip.displayName}</ThemedText>
      <ThemedInput
        style={[chipConfigurationStyles.chipValueInputSmall]}
        keyboardType="numeric"
        value={chip.value.toString()}
        placeholder="$"
        editable={false}
      />
      <ThemedInput
        style={[chipConfigurationStyles.chipQuantityInput]}
        keyboardType="numeric"
        value={chip.quantity.toString()}
        editable={false}
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

// --- CHIP SET SELECTOR COMPONENT ---
function ChipSetSelector({ selectedSet, onSetChange }: { selectedSet: { id: string; chips: { color: string; quantity: number }[]; }; onSetChange: (setId: string, chips: { color: string; quantity: number }[]) => void }) {
  // Simple select: 3 options, highlight selected, call onSetChange
  const options = [
    { label: '300pc Standard Set', value: '300pc', chips: [
      { color: 'white', quantity: 100 },
      { color: 'red', quantity: 50 },
      { color: 'blue', quantity: 50 },
      { color: 'green', quantity: 50 },
      { color: 'black', quantity: 50 }
    ] },
    { label: '500pc Standard Set', value: '500pc', chips: [
      { color: 'white', quantity: 150 },
      { color: 'red', quantity: 150 },
      { color: 'blue', quantity: 100 },
      { color: 'green', quantity: 50 },
      { color: 'black', quantity: 50 }
    ] },
    { label: '100pc Standard Set', value: '100pc', chips: [
      { color: 'white', quantity: 20 },
      { color: 'red', quantity: 20 },
      { color: 'blue', quantity: 20 },
      { color: 'green', quantity: 20 },
      { color: 'black', quantity: 20 }
    ] }
  ];
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8, gap: 8 }}>
      {options.map(opt => (
        <TouchableOpacity
          key={opt.value}
          onPress={() => onSetChange(opt.value, opt.chips)}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: opt.value === selectedSet.id ? '#007AFF' : '#ccc',
            backgroundColor: opt.value === selectedSet.id ? '#e6f0ff' : '#fff',
            alignItems: 'center',
          }}
        >
          <ThemedText style={{ color: opt.value === selectedSet.id ? '#007AFF' : '#333' }}>{opt.label}</ThemedText>
        </TouchableOpacity>
      ))}
    </View>
  );
}

// --- CALCULATION FUNCTIONS ---
function calculateRecommendedBigBlind(buyInAmount: number): number {
  const rawBigBlind = buyInAmount * 0.02;
  if (rawBigBlind <= 0.25) return 0.25;
  if (rawBigBlind <= 0.5) return 0.5;
  if (rawBigBlind <= 1) return 1;
  if (rawBigBlind <= 2) return 2;
  if (rawBigBlind <= 5) return 5;
  return Math.ceil(rawBigBlind / 5) * 5;
}

// --- CHIP AUTOGEN MODAL ---
function ChipAutogenModal({ visible, onClose, bigBlindAmount, chipSetType, onBigBlindChange, onChipSetChange, buyInAmount, onAutogenerate }: {
  visible: boolean;
  onClose: () => void;
  bigBlindAmount: string;
  chipSetType: { id: string; chips: { color: string; quantity: number; }[]; };
  onBigBlindChange: (val: string) => void;
  onChipSetChange: (id: string, chips: { color: string; quantity: number; }[]) => void;
  buyInAmount: string;
  onAutogenerate: () => void;
}) {
  const colorScheme = useColorScheme() ?? 'light';
  const modalBg = Colors[colorScheme].background;
  const borderColor = Colors[colorScheme].icon;
  // Calculate BB/player
  const buyIn = parseFloat(buyInAmount) || 0;
  const bigBlind = parseFloat(bigBlindAmount) || 0;
  const bbPerPlayer = bigBlind > 0 ? Math.round(buyIn / bigBlind) : 0;
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={chipConfigurationStyles.modalOverlay}>
        <View style={[chipConfigurationStyles.modalContent, { backgroundColor: modalBg, borderColor }]}>
          <ThemedText style={styles.sectionHeader}>Chip Wizard</ThemedText>

          <View>
            <ThemedText style={chipConfigurationStyles.chipConfigLabel}>Big Blind</ThemedText>
            <MoneyInput
              value={bigBlindAmount}
              onChangeText={onBigBlindChange}
              staticColor="#aed581" // Solid green for big blind
            />
            <ThemedText style={styles.subLabel}>
              {bigBlind > 0 && buyIn > 0 ? `(${bbPerPlayer} bb / player)` : '(—)'}
            </ThemedText>
          </View>

          <View style={chipConfigurationStyles.chipSetContainer}>
            <ThemedText style={chipConfigurationStyles.chipConfigLabel}>Available Chips</ThemedText>
            <ChipSetSelector selectedSet={chipSetType} onSetChange={(id, chips) => onChipSetChange(id, chips)} />
          </View>
          <View style={chipConfigurationStyles.modalActionsRow}>
            <ThemedButton title="Get Chip Spread" onPress={onAutogenerate} type="primary" />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function SetupGameScreen() {
  const { screenOptions } = useGameNavigation('Setup Game', null);
  const { startGame, gameState } = useGameContext();
  const existingPlayers = gameState.players.map(player => player.name) ?? [];
  const [players, setPlayers] = useState<string[]>(existingPlayers);
  const [buyInAmount, setBuyInAmount] = useState('20');
  const [chipSetType, setChipSetType] = useState({
    id: '300pc',
    chips: [
      { color: 'white', quantity: 100 },
      { color: 'red', quantity: 50 },
      { color: 'blue', quantity: 50 },
      { color: 'green', quantity: 50 },
      { color: 'black', quantity: 50 }
    ]
  });
  const [bigBlindAmount, setBigBlindAmount] = useState('1');
  const [isCustomizedChipSet, setIsCustomizedChipSet] = useState(false);
  const [showAutogenModal, setShowAutogenModal] = useState(false);
  const [showChipExplainer, setShowChipExplainer] = useState(false);
  const [isChipConfigOpen, setIsChipConfigOpen] = useState(false);
  const [calculatedStartingChips, setCalculatedStartingChips] = useState<ChipType[]>([]);
  const colorScheme = useColorScheme() ?? 'light';


  // --- HANDLERS ---
  const handleBuyInChange = (value: string) => {
    setBuyInAmount(value);
    const buyIn = parseFloat(value) || 0;
    const newBigBlind = calculateRecommendedBigBlind(buyIn);
    setBigBlindAmount(newBigBlind.toString());
  };

  const handleAddPlayer = (name: string) => {
    if (name && !players.includes(name)) setPlayers([...players, name]);
  };
  const handleRemovePlayer = (index: number) => {
    const newPlayers = [...players];
    newPlayers.splice(index, 1);
    setPlayers(newPlayers);
  };
  const handleStartGame = () => {
    if (players.length < 2) {
      Alert.alert('Not Enough Players', 'Please add at least 2 players to start a game.');
      return;
    }
    const buyInValue = parseFloat(buyInAmount);
    if (buyInValue <= 0) {
      Alert.alert('Invalid Buy-In', 'Please set a buy-in amount greater than 0.');
      return;
    }

    startGame(players, buyInValue, calculatedStartingChips);
    // startGame sets the phase, which triggers the next screen
  };

  // Calculate chip distribution when chip config is opened or when autogenerate is pressed
  const calculateChipSpread = useCallback((buyIn: number, bigBlind: number, playerCount: number, chipSetType: { chips: { color: string; quantity: number }[] }) => {
    const availableChips = chipSetType.chips.map(chip => chip.quantity);
    const solutions = findAllSolutions(buyIn, bigBlind, playerCount, availableChips);
    const bestSolution = findBestSolution(solutions);
    if (bestSolution) {
      const updatedChips = defaultChips.map((chip, index) => ({
        ...chip,
        value: bestSolution.chipValues[index] || 0,
        quantity: bestSolution.distribution[index] || 0
      }));
      setCalculatedStartingChips(updatedChips);
    } else {
      // Handle case when no solution is found by setting all chip quantities and value to 0
      const updatedChips = defaultChips.map(chip => ({
        ...chip,
        value: 0,
        quantity: 0
      }));
      setCalculatedStartingChips(updatedChips);
    }
  }, []);

  // Calculate distribution when chip config is opened
  useEffect(() => {
    if (isChipConfigOpen) {
      const buyIn = parseFloat(buyInAmount);
      const bigBlind = parseFloat(bigBlindAmount);
      calculateChipSpread(buyIn, bigBlind, players.length, chipSetType);
    }
  }, [isChipConfigOpen, buyInAmount, bigBlindAmount, players.length, chipSetType, calculateChipSpread]);

  // Calculate distribution when autogenerate is pressed
  const handleAutogenerate = () => {
    const buyIn = parseFloat(buyInAmount);
    const bigBlind = parseFloat(bigBlindAmount);
    calculateChipSpread(buyIn, bigBlind, players.length, chipSetType);
    setShowAutogenModal(false);
  };

  return (
      <ThemedView style={styles.outerContainer}>
        <Stack.Screen options={screenOptions} />
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Buy-In */}
          <View style={styles.buyInContainer}>
            <ThemedText style={styles.sectionHeader}>
              Buy <Text style={styles.moneyBagEmoji}>💰</Text> In
            </ThemedText>
            <MoneyInput value={buyInAmount} onChangeText={handleBuyInChange} />
            <ThemedText style={styles.subLabel}>(per player)</ThemedText>
          </View>

          {/* Players */}
          <View style={styles.sectionContainer}>
            <ThemedText style={styles.sectionHeader}>Players</ThemedText>
            <View style={styles.inputWrapper}>
              <PlayerTagInput players={players} onAddPlayer={handleAddPlayer} onRemovePlayer={handleRemovePlayer} />
            </View>
          </View>

          {/* Chip Configuration with heading, summary, and edit */}
          <Collapsible title={
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <ThemedText style={[styles.sectionHeader, { paddingLeft: 0, paddingTop: 7 }]}>Starting Chip Stacks</ThemedText>
            </View>
          } onOpen={() => setIsChipConfigOpen(true)} onClose={() => setIsChipConfigOpen(false)}>
            <View style={chipConfigurationStyles.chipConfigHeader}>
                  <ThemedText style={chipConfigurationStyles.chipConfigSummaryText}>
                    Recommended assuming a big blind of ${bigBlindAmount} and a {chipSetType.id} standard chip set. <TouchableOpacity onPress={() => setShowAutogenModal(true)} style={chipConfigurationStyles.chipConfigEditBtn}>
                    <Ionicons name="create-outline" size={18} color={Colors[colorScheme].tint} />
                  </TouchableOpacity>
                  </ThemedText>
            </View>

            <View style={chipConfigurationStyles.chipHeaderRow}>
              <ThemedText style={chipConfigurationStyles.chipHeaderColor}>Color</ThemedText>
              <ThemedText style={chipConfigurationStyles.chipHeaderName}>Name</ThemedText>
              <ThemedText style={chipConfigurationStyles.chipHeaderValue}>Value</ThemedText>
              <ThemedText style={chipConfigurationStyles.chipHeaderQuantity}>Quantity</ThemedText>
            </View>
            <View style={chipConfigurationStyles.chipList}>
              {calculatedStartingChips.map(chip => (
                <ChipConfigItem key={chip.color} chip={chip} />
              ))}
            </View>
          </Collapsible>
          <ThemedButton title="Start Game" onPress={handleStartGame} icon={<Ionicons name="play" size={24} color="#FFFFFF" />} style={styles.startGameButton} type="primary" />
        </ScrollView>
        {/* Modal for editing chip autogen controls */}
        <ChipAutogenModal
          visible={showAutogenModal}
          onClose={() => setShowAutogenModal(false)}
          bigBlindAmount={bigBlindAmount}
          chipSetType={chipSetType}
          onBigBlindChange={val => { setBigBlindAmount(val); }}
          onChipSetChange={(id, chips) => { setChipSetType({ id, chips }); setIsCustomizedChipSet(false); }}
          buyInAmount={buyInAmount}
          onAutogenerate={handleAutogenerate}
        />
        {/* Chip Explainer Modal */}
        <Modal visible={showChipExplainer} transparent animationType="fade" onRequestClose={() => setShowChipExplainer(false)}>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0008' }}>
            <View style={{ backgroundColor: Colors[colorScheme].background, padding: 24, borderRadius: 12, maxWidth: 320 }}>
              <ThemedText style={[styles.subLabel, { marginBottom: 16 }]}>
                The chip setup wizard can help you find a reasonable starting pile based on buy-in, amount of chips, and amount of players!
              </ThemedText>
              <ThemedButton title="Close" onPress={() => setShowChipExplainer(false)} />
            </View>
          </View>
        </Modal>
      </ThemedView>
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
  buyInContainer: {
    width: '100%',
    alignItems: 'center',
  },
  moneyBagEmoji: {
    fontSize: 24
  },
  subLabel: {
    fontSize: 12,
    marginTop: 0,
    opacity: 0.7,
    textAlign: 'center',
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
  startGameButton: {
    marginTop: 20,
    marginBottom: 30,
  },
});
