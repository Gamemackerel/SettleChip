import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TextInput,
  Alert,
  Switch,
  Text
} from 'react-native';
import { Card } from '@/components/ui/Card';
import { BaseModal } from '@/components/ui/BaseModal';
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
import { Player } from '@/context/GameContext';
import { saveGameToHistory } from '@/utils/gameHistory';

// Chip Tally Modal Component
const ChipTallyModal = ({
  visible,
  player,
  onClose,
  onSaveTally
}: {
  visible: boolean;
  player: Player | null;
  onClose: () => void;
  onSaveTally: (amount: number, method: 'direct' | 'chips') => void;
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const borderColor = useThemeColor({}, 'icon');
  const buttonPrimaryColor = useThemeColor({}, 'buttonPrimary');
  const modalBackground = colorScheme === 'dark' ? '#222' : '#fff';

  const [directAmount, setDirectAmount] = useState('0');
  const [useChipCounting, setUseChipCounting] = useState(false);
  const [chipCounts, setChipCounts] = useState<{ color: string; value: number; count: number }[]>([
    { color: 'white', value: 1, count: 0 },
    { color: 'red', value: 5, count: 0 },
    { color: 'blue', value: 10, count: 0 },
    { color: 'green', value: 25, count: 0 },
    { color: 'black', value: 100, count: 0 },
  ]);

  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (visible && player) {
      if (player.finalAmount !== undefined) {
        setDirectAmount(player.finalAmount.toString());
        setChipCounts([
          { color: 'white', value: 1, count: 0 },
          { color: 'red', value: 5, count: 0 },
          { color: 'blue', value: 10, count: 0 },
          { color: 'green', value: 25, count: 0 },
          { color: 'black', value: 100, count: 0 },
        ]);
      } else {
        setDirectAmount('0');
        setUseChipCounting(false);
        setChipCounts([
          { color: 'white', value: 1, count: 0 },
          { color: 'red', value: 5, count: 0 },
          { color: 'blue', value: 10, count: 0 },
          { color: 'green', value: 25, count: 0 },
          { color: 'black', value: 100, count: 0 },
        ]);
      }
    }
  }, [visible, player?.id]);

  const handleDirectAmountChange = (text: string) => {
    setDirectAmount(text);
  };

  const calculateTotalFromChips = () => {
    return chipCounts.reduce((total, chip) => total + (chip.value * chip.count), 0);
  };

  const handleChangeChipCount = (index: number, count: string) => {
    const newCount = parseInt(count) || 0;
    const newChipCounts = [...chipCounts];
    newChipCounts[index] = { ...newChipCounts[index], count: newCount };
    setChipCounts(newChipCounts);
  };

  const handleSaveTally = () => {
    if (useChipCounting) {
      const totalAmount = calculateTotalFromChips();
      onSaveTally(totalAmount, 'chips');
    } else {
      const amountNum = parseFloat(directAmount) || 0;
      if (amountNum < 0) {
        Alert.alert('Invalid Amount', 'Please enter a valid amount');
        return;
      }
      onSaveTally(amountNum, 'direct');
    }
    onClose();
  };

  const renderChipCountingForm = () => {
    return (
      <View style={styles.chipCountingForm}>
        <ThemedText style={styles.chipCountingTitle}>Count Chips</ThemedText>

        {chipCounts.map((chip, index) => (
          <View key={chip.color} style={styles.chipCountRow}>
            <View style={[styles.chipIcon, { backgroundColor: chip.color }]} />
            <ThemedText style={styles.chipValue}>${chip.value}</ThemedText>
            <TextInput
              style={[
                styles.chipCountInput,
                {
                  color: Colors[colorScheme].text,
                  borderColor,
                  backgroundColor: colorScheme === 'dark' ? '#333' : '#f5f5f5'
                }
              ]}
              value={chip.count.toString()}
              onChangeText={(text) => handleChangeChipCount(index, text)}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={Colors[colorScheme].tabIconDefault}
            />
            <ThemedText style={styles.chipTotal}>
              ${(chip.value * chip.count).toLocaleString()}
            </ThemedText>
          </View>
        ))}

        <View style={styles.totalRow}>
          <ThemedText style={styles.totalLabel}>Total:</ThemedText>
          <ThemedText style={styles.totalAmount}>
            ${calculateTotalFromChips().toLocaleString()}
          </ThemedText>
        </View>
      </View>
    );
  };

  const renderDirectAmountForm = () => {
    return (
      <View style={styles.directAmountForm}>
        <ThemedText style={styles.directAmountTitle}>
          Enter Final Amount <Text style={{ fontSize: 24 }}>💰</Text>
        </ThemedText>
        <MoneyInput
          value={directAmount}
          onChangeText={handleDirectAmountChange}
          autoFocus={true}
        />
      </View>
    );
  };

  const playerName = player ? player.name : '';

  return (
    <BaseModal
      visible={visible}
      onClose={onClose}
      title={`${playerName}'s Final Tally`}
    >
      {player && (
        <>
          <View style={styles.inputMethodToggle}>
            <ThemedText style={styles.toggleLabel}>Enter total amount</ThemedText>
            <Switch
              value={useChipCounting}
              onValueChange={setUseChipCounting}
              trackColor={{ false: '#767577', true: buttonPrimaryColor }}
              thumbColor="#f4f3f4"
            />
            <ThemedText style={styles.toggleLabel}>Count chips</ThemedText>
          </View>

          <ScrollView style={styles.modalBody}>
            {useChipCounting ? renderChipCountingForm() : renderDirectAmountForm()}
          </ScrollView>

          <View style={styles.buttonRow}>
            <ThemedButton
              title="Cancel"
              type="outline"
              onPress={onClose}
              style={{ flex: 1, marginRight: 10 }}
            />
            <ThemedButton
              title="Save"
              onPress={handleSaveTally}
              style={{ flex: 1 }}
              type="primary"
            />
          </View>
        </>
      )}
    </BaseModal>
  );
};

export default function TallyUpScreen() {
  const {
    gameState,
    updatePlayerFinalAmount,
    areAllPlayersComplete,
    getPlayerProfit,
    getTotalBuyIn,
    getTotalCashOut,
    goToNextPhase,
    goToPreviousPhase
  } = useGameContext();
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const handlePlayerPress = (player: Player) => {
    setSelectedPlayer(player);
    setModalVisible(true);
  };

  const handleSaveTally = (amount: number, method: 'direct' | 'chips') => {
    if (selectedPlayer) {
      updatePlayerFinalAmount(selectedPlayer.id, amount);
    }
  };

  const handleSettleUp = async () => {
    // Gather player history data
    const players = gameState.players.map(player => {
      const initialBuyIn = gameState.buyInAmount;
      const totalBuyIn = player.buyIn;
      const finalAmount = player.finalAmount ?? 0;
      const profitLoss = finalAmount - totalBuyIn;
      return {
        name: player.name,
        initialBuyIn,
        totalBuyIn,
        finalAmount,
        profitLoss,
      };
    });
    const entry = {
      id: `${Date.now()}-${Math.floor(Math.random() * 100000)}`,
      date: new Date().toISOString(),
      players,
    };
    try {
      await saveGameToHistory(entry);
    } catch (err) {
      console.error('[SettleUp] Error saving entry:', err);
    }
    goToNextPhase();
  };

  const { screenOptions } = useGameNavigation('Tally Up Results', () => goToPreviousPhase());
  const textColor = useThemeColor({}, 'text');
  const colorScheme = useColorScheme() ?? 'light';
  const totalBuyIn = getTotalBuyIn();
  const totalCashOut = getTotalCashOut();
  const isBalanced = Math.abs(totalBuyIn - totalCashOut) < 0.01;
  const allPlayersHaveEntered = gameState.players.length > 0 && gameState.players.every(player => player.isComplete);

  const renderPlayerCard = (player: Player) => {
    const profit = player.finalAmount !== undefined ? player.finalAmount - player.buyIn : 0;

    return (
      <Card
        key={player.id}
        onPress={() => handlePlayerPress(player)}
        highlighted={player.isComplete}
        highlightColor={player.hasError ? '#FF9800' : '#4CAF50'}
      >
        <View style={styles.playerCardContent}>
          <ThemedText style={styles.playerName}>{player.name}</ThemedText>

          {player.isComplete ? (
            <View style={styles.playerStatRow}>
              <View style={styles.statItem}>
                <ThemedText style={styles.statLabel}>Buy-in</ThemedText>
                <ThemedText style={styles.statValue}>${player.buyIn.toLocaleString()}</ThemedText>
              </View>

              <View style={styles.statItem}>
                <ThemedText style={styles.statLabel}>Cash-out</ThemedText>
                <ThemedText style={styles.statValue}>${player.finalAmount?.toLocaleString() || '0'}</ThemedText>
              </View>

              <View style={styles.statItem}>
                <ThemedText style={styles.statLabel}>Profit</ThemedText>
                <ThemedText style={[styles.statValue, { color: profit >= 0 ? '#4CAF50' : '#F44336' }]}>
                  {profit >= 0 ? '+' : ''}{profit.toLocaleString()}
                </ThemedText>
              </View>
            </View>
          ) : (
            <View style={styles.tapToTallyContainer}>
              <Ionicons name="calculator-outline" size={20} color={textColor} />
              <ThemedText style={styles.tapToTallyText}>Tap to enter final amount</ThemedText>
            </View>
          )}
        </View>

        <View style={styles.playerCardActions}>
          {player.isComplete ? (
            player.hasError ? (
              <Ionicons
                name="warning"
                size={24}
                color="#FF9800"
              />
            ) : (
              <Ionicons
                name="checkmark-circle"
                size={24}
                color="#4CAF50"
              />
            )
          ) : (
            <Ionicons
              name="chevron-forward"
              size={24}
              color={Colors[colorScheme].text}
            />
          )}
        </View>
      </Card>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={screenOptions} />

      {allPlayersHaveEntered && !isBalanced && (
        <View style={styles.errorBanner}>
          <Ionicons name="warning" size={20} color="#FFFFFF" />
          <ThemedText style={styles.errorText}>
            Total buy-in (${totalBuyIn}) doesn't match total cash-out (${totalCashOut})
          </ThemedText>
        </View>
      )}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {gameState.players.length === 0 ? (
          <ThemedText style={styles.emptyState}>
            No players in the game. Return to the game screen to add players.
          </ThemedText>
        ) : (
          gameState.players.map(player => renderPlayerCard(player))
        )}
      </ScrollView>

      <View style={styles.bottomButtonContainer}>
        <ThemedButton
          title="Settle Up"
          onPress={handleSettleUp}
          type="primary"
          icon={<Ionicons name="cash-outline" size={24} color="#FFFFFF" />}
          disabled={!areAllPlayersComplete()}
        />
      </View>

      <ChipTallyModal
        visible={modalVisible}
        player={selectedPlayer}
        onClose={() => setModalVisible(false)}
        onSaveTally={handleSaveTally}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  placeholder: {
    width: 34, // Same as backButton to center the title
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  scrollView: {
    paddingTop: 15,
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  emptyState: {
    textAlign: 'center',
    marginTop: 50,
    opacity: 0.7,
  },
  playerCardContent: {
    flex: 1,
  },
  playerCardActions: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  playerName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  playerStatRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 5,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  tapToTallyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  tapToTallyText: {
    marginLeft: 5,
    fontSize: 14,
    opacity: 0.7,
  },
  modalBody: {
    maxHeight: 400,
  },
  inputMethodToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
  },
  toggleLabel: {
    marginHorizontal: 8,
    fontSize: 14,
  },
  directAmountForm: {
    paddingVertical: 10,
  },
  directAmountTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  chipCountingForm: {
    paddingVertical: 10,
  },
  chipCountingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  chipCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 5,
  },
  chipIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.2)',
    marginRight: 10,
  },
  chipValue: {
    width: 50,
    fontSize: 16,
  },
  chipCountInput: {
    height: 40,
    width: 60,
    borderWidth: 1,
    borderRadius: 5,
    textAlign: 'center',
    fontSize: 16,
    marginHorizontal: 10,
  },
  chipTotal: {
    flex: 1,
    fontSize: 16,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  bottomButtonContainer: {
    marginTop: 0,
    marginBottom: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.2)'
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF9800',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  errorText: {
    color: '#FFFFFF',
    marginLeft: 10,
    flex: 1,
    fontSize: 14,
  },
});