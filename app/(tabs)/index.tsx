import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  TextInput,
  View,
  Platform,
  TouchableOpacity,
  Keyboard,
  ScrollView,
  Text,
  Alert,
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedButton } from '@/components/ThemedButton';
import { MoneyInput } from '@/components/MoneyInput';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useGameContext } from '@/context/GameContext';

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
  onQuantityChange,
  onValueChange
}: {
  chip: ChipType;
  onQuantityChange: (id: string, quantity: number) => void;
  onValueChange: (id: string, value: number) => void;
}) {
  const colorScheme = useColorScheme() ?? 'light';
  const borderColor = Colors[colorScheme].icon;
  return (
    <View style={styles.chipRow}>
      <View style={[styles.chipColorCircle, { backgroundColor: chip.color, borderColor }]}>
        <View style={[styles.chipColorCircleInner, { borderColor, backgroundColor: chip.id === 'black' && colorScheme === 'dark' ? '#444' : chip.color }]} />
      </View>
      <ThemedText style={styles.chipName}>{chip.displayName}</ThemedText>
      <ThemedInput
        style={newStyles.chipValueInputSmall}
        keyboardType="numeric"
        value={chip.value.toString()}
        onChangeText={text => { const value = parseFloat(text) || 0; onValueChange(chip.id, value); }}
        placeholder="$"
      />
      <ThemedInput
        style={styles.chipQuantityInput}
        keyboardType="numeric"
        value={chip.quantity.toString()}
        onChangeText={text => { const quantity = parseInt(text) || 0; onQuantityChange(chip.id, quantity); }}
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
function ChipSetSelector({ selectedSet, onSetChange }: { selectedSet: string; onSetChange: (setId: string) => void }) {
  // Simple select: 3 options, highlight selected, call onSetChange
  const options = [
    { label: '300pc Standard Set', value: '300pc' },
    { label: '500pc Standard Set', value: '500pc' },
    { label: '100pc Standard Set', value: '100pc' },
  ];
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8, gap: 8 }}>
      {options.map(opt => (
        <TouchableOpacity
          key={opt.value}
          onPress={() => onSetChange(opt.value)}
          style={{
            flex: 1,
            padding: 10,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: opt.value === selectedSet ? '#007AFF' : '#ccc',
            backgroundColor: opt.value === selectedSet ? '#e6f0ff' : '#fff',
            alignItems: 'center',
          }}
        >
          <ThemedText style={{ color: opt.value === selectedSet ? '#007AFF' : '#333' }}>{opt.label}</ThemedText>
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
function calculateChipValues(bigBlindAmount: number): Record<string, number> {
  const smallBlind = bigBlindAmount / 2;
  return {
    'white': smallBlind,
    'red': bigBlindAmount * 5,
    'blue': bigBlindAmount * 10,
    'green': bigBlindAmount * 25,
    'black': bigBlindAmount * 100,
  };
}
function calculateChipDistribution(buyInAmount: number, bigBlindAmount: number, chipSetType: string, chips: ChipType[]): ChipType[] {
  const chipValues = calculateChipValues(bigBlindAmount);
  let quantities: Record<string, number>;
  if (chipSetType === '300pc') {
    quantities = { 'white': 40, 'red': 60, 'blue': 60, 'green': 60, 'black': 80 };
  } else if (chipSetType === '100pc') {
    quantities = { 'white': 25, 'red': 25, 'blue': 25, 'green': 15, 'black': 10 };
  } else if (chipSetType === '500pc') {
    quantities = { 'white': 100, 'red': 150, 'blue': 150, 'green': 150, 'black': 200 };
  } else {
    quantities = chips.reduce((acc, chip) => { acc[chip.id] = chip.quantity; return acc; }, {} as Record<string, number>);
  }
  return defaultChips.map(chip => ({ ...chip, value: chipValues[chip.id] || chip.value, quantity: quantities[chip.id] || chip.quantity }));
}

// --- CHIP AUTOGEN MODAL ---
function ChipAutogenModal({ visible, onClose, bigBlindAmount, chipSetType, onBigBlindChange, onChipSetChange, buyInAmount }: {
  visible: boolean;
  onClose: () => void;
  bigBlindAmount: string;
  chipSetType: string;
  onBigBlindChange: (val: string) => void;
  onChipSetChange: (val: string) => void;
  buyInAmount: string;
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
      <View style={newStyles.modalOverlay}>
        <View style={[newStyles.modalContent, { backgroundColor: modalBg, borderColor }]}>
          <ThemedText style={styles.sectionHeader}>Chip Wizard</ThemedText>

          <View>
            <ThemedText style={newStyles.chipConfigLabel}>Big Blind</ThemedText>
            <MoneyInput
              value={bigBlindAmount}
              onChangeText={onBigBlindChange}
              staticColor="#aed581" // Solid green for big blind
            />
            <ThemedText style={styles.subLabel}>
              {bigBlind > 0 && buyIn > 0 ? `(${bbPerPlayer} bb / player)` : '(—)'}
            </ThemedText>
          </View>

          <View style={newStyles.chipSetContainer}>
            <ThemedText style={newStyles.chipConfigLabel}>Available Chips</ThemedText>
            <ChipSetSelector selectedSet={chipSetType} onSetChange={onChipSetChange} />
          </View>
          <View style={newStyles.modalActionsRow}>
            <ThemedButton title="Get Chip Spread" onPress={onClose} type="primary" />
          </View>
        </View>
      </View>
    </Modal>
  );
}

export default function SetupGameScreen() {
  const [players, setPlayers] = useState<string[]>([]);
  const [buyInAmount, setBuyInAmount] = useState('20');
  const [chips, setChips] = useState<ChipType[]>(defaultChips);
  const [bigBlindAmount, setBigBlindAmount] = useState('1');
  const [chipSetType, setChipSetType] = useState('300pc');
  const [isCustomizedChipSet, setIsCustomizedChipSet] = useState(false);
  const [showAutogenModal, setShowAutogenModal] = useState(false);
  const colorScheme = useColorScheme() ?? 'light';
  const { startGame } = useGameContext();

  // --- HANDLERS ---
  const handleChipEdited = () => {
    setIsCustomizedChipSet(true);
    if (chipSetType !== 'custom') setChipSetType('custom');
  };
  const handleChipQuantityChange = (id: string, quantity: number) => {
    handleChipEdited();
    setChips(chips.map(chip => chip.id === id ? { ...chip, quantity } : chip));
  };
  const handleChipValueChange = (id: string, value: number) => {
    handleChipEdited();
    setChips(chips.map(chip => chip.id === id ? { ...chip, value } : chip));
  };
  const handleBuyInChange = (value: string) => {
    setBuyInAmount(value);
    const buyIn = parseFloat(value) || 0;
    const newBigBlind = calculateRecommendedBigBlind(buyIn);
    setBigBlindAmount(newBigBlind.toString());
    if (!isCustomizedChipSet) {
      const updatedChips = calculateChipDistribution(buyIn, newBigBlind, chipSetType, chips);
      setChips(updatedChips);
    }
  };
  const handleBigBlindChange = (value: string) => {
    setBigBlindAmount(value);
    if (!isCustomizedChipSet) {
      const updatedChips = calculateChipDistribution(parseFloat(buyInAmount) || 0, parseFloat(value) || 0, chipSetType, chips);
      setChips(updatedChips);
    }
  };
  const handleChipSetChange = (setId: string) => {
    setChipSetType(setId);
    setIsCustomizedChipSet(false);
    const updatedChips = calculateChipDistribution(parseFloat(buyInAmount) || 0, parseFloat(bigBlindAmount) || 0, setId, chips);
    setChips(updatedChips);
  };
  const resetToRecommended = () => {
    const updatedChips = calculateChipDistribution(parseFloat(buyInAmount), parseFloat(bigBlindAmount), chipSetType, chips);
    setChips(updatedChips);
    setIsCustomizedChipSet(false);
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
    const buyInValue = parseInt(buyInAmount, 10);
    if (buyInValue <= 0) {
      Alert.alert('Invalid Buy-In', 'Please set a buy-in amount greater than 0.');
      return;
    }
    startGame(players, buyInValue);
    router.push('/game');
  };

  // INIT: set big blind and chips on mount
  useEffect(() => {
    const initialBigBlind = calculateRecommendedBigBlind(parseInt(buyInAmount, 10));
    setBigBlindAmount(initialBigBlind.toString());
    const initialChips = calculateChipDistribution(parseInt(buyInAmount, 10), initialBigBlind, chipSetType, chips);
    setChips(initialChips);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView style={styles.outerContainer}>
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <ThemedText type="title" style={styles.title}>Setup Game</ThemedText>
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
          <View style={newStyles.chipConfigHeader}>
            <ThemedText style={styles.sectionHeader}>Chip Configuration</ThemedText>
            {!isCustomizedChipSet ? (
                <>
                  <ThemedText style={newStyles.chipConfigSummaryText}>
                    Assuming a big blind of ${bigBlindAmount} and a {chipSetType} standard chip set. <TouchableOpacity onPress={() => setShowAutogenModal(true)} style={newStyles.chipConfigEditBtn}>
                    <Ionicons name="create-outline" size={18} color={Colors[colorScheme].tint} />
                  </TouchableOpacity>
                  </ThemedText>

                </>
              ) : (
                <ThemedText style={newStyles.chipConfigSummaryText}>
                <TouchableOpacity onPress={() => setShowAutogenModal(true)} style={newStyles.chipConfigEditBtn}>
                  <Ionicons name="create-outline" size={18} color={Colors[colorScheme].tint} />
                  <ThemedText style={newStyles.chipConfigEditText}>autogenerate config</ThemedText>
                </TouchableOpacity>
              </ThemedText>

              )}
          </View>

          <View style={styles.chipHeaderRow}>
            <ThemedText style={styles.chipHeaderColor}>Color</ThemedText>
            <ThemedText style={styles.chipHeaderName}>Name</ThemedText>
            <ThemedText style={styles.chipHeaderValue}>Value</ThemedText>
            <ThemedText style={styles.chipHeaderQuantity}>Quantity</ThemedText>
          </View>
          <View style={styles.chipList}>
            {chips.map(chip => (
              <ChipConfigItem key={chip.id} chip={chip} onQuantityChange={handleChipQuantityChange} onValueChange={handleChipValueChange} />
            ))}
          </View>
          <ThemedButton title="Start Game" onPress={handleStartGame} icon={<Ionicons name="play" size={24} color="#FFFFFF" />} style={styles.startGameButton} type="primary" />
        </ScrollView>
        {/* Modal for editing chip autogen controls */}
        <ChipAutogenModal
          visible={showAutogenModal}
          onClose={() => setShowAutogenModal(false)}
          bigBlindAmount={bigBlindAmount}
          chipSetType={chipSetType}
          onBigBlindChange={val => { setBigBlindAmount(val); }}
          onChipSetChange={setChipSetType}
          buyInAmount={buyInAmount}
        />
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
  subLabel: {
    fontSize: 12,
    marginTop: 0,
    opacity: 0.7,
    textAlign: 'center',
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
  startGameButton: {
    marginTop: 20,
    marginBottom: 30,
  },
});

const newStyles = StyleSheet.create({
  bigBlindContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  autoCalculatedText: {
    fontSize: 12,
    fontStyle: 'italic',
    opacity: 0.7,
  },
  chipSetContainer: {
    width: '100%',
    marginBottom: 15,
  },
  chipSetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customizedText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginLeft: 6,
    color: '#f57c00',
  },
  chipConfigHeader: {
    flexDirection: 'column',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: 0,
  },
  chipConfigControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 6,
    gap: 12,
  },
  chipConfigControlItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
    gap: 4,
  },
  chipConfigLabel: {
    fontSize: 14,
    marginRight: 2,
    opacity: 0.8,
  },
  chipConfigInput: {
    width: 60,
    height: 30,
    fontSize: 14,
    textAlign: 'center',
    marginHorizontal: 2,
  },
  resetButton: {
    padding: 5,
    height: 30,
    marginRight: 10,
  },
  chipValueInput: {
    width: 60,
    height: 35,
    textAlign: 'center',
    marginHorizontal: 5,
  },
  chipValueInputSmall: {
    width: 60,
    height: 35,
    textAlign: 'center',
    marginHorizontal: 5,
    fontSize: 14,
    paddingVertical: 0,
  },
  chipConfigSummaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 2,
    gap: 8,
  },
  chipConfigSummaryText: {
    paddingBottom: 10,
    fontSize: 12,
    opacity: 0.7,
  },
  chipConfigEditBtn: {
    flexDirection: 'row',
    height: 22,
  },
  chipConfigEditText: {
    fontSize: 12,
    marginLeft: 4,
    color: '#1976d2',
    textTransform: 'lowercase',
  },
  chipConfigHeaderSpacer: {
    height: 2,
  },
  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: 320,
    borderRadius: 14,
    borderWidth: 1,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 8,
  },
  modalRow: {
    flexDirection: 'column',
    alignItems: 'center',
    marginVertical: 12,
  },
  modalRowCompact: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 16,
  },
  bigBlindInputSmall: {
    width: 60,
    height: 32,
    fontSize: 15,
    textAlign: 'center',
    marginHorizontal: 4,
    paddingVertical: 0,
  },
});
