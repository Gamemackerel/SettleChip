import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  Alert,
  FlatList
} from 'react-native';
import { Card } from '@/components/ui/Card';
import { BaseModal } from '@/components/ui/BaseModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
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
import { chipConfigurationStyles } from '@/styles/styles';
import { ChipType } from '@/types/types';


// Player action modal component
const PlayerActionModal = ({
  visible,
  player,
  onClose,
  onAddFunds,
  onCashOut
}: {
  visible: boolean;
  player: { id: string; name: string; buyIn: number } | null;
  onClose: () => void;
  onAddFunds: (amount: number) => void;
  onCashOut: () => void;
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const borderColor = useThemeColor({}, 'icon');
  const buttonPrimaryColor = useThemeColor({}, 'buttonPrimary');
  const [amount, setAmount] = useState('');
  const [showAddFundsInput, setShowAddFundsInput] = useState(false);
  const modalBackground = colorScheme === 'dark' ? '#222' : '#fff';

  const handleAddFunds = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return;
    }

    onAddFunds(numAmount);
    setAmount('');
    setShowAddFundsInput(false);
  };

  const handleClose = () => {
    setShowAddFundsInput(false);
    onClose();
  };

  if (!player) return null;

  return (
    <BaseModal
      visible={visible}
      onClose={handleClose}
      title={player.name}
    >
      <View style={styles.modalBody}>
        {!showAddFundsInput ? (
          <>
            <ThemedButton
              title="Add Funds"
              onPress={() => setShowAddFundsInput(true)}
              icon={<Ionicons name="add-circle-outline" size={24} color="#FFFFFF" />}
              style={styles.actionButtonSpacing}
              type="primary"
            />
          </>
        ) : (
          <View style={styles.addFundsContainer}>
            <ThemedText style={styles.addFundsTitle}>Add Funds</ThemedText>
            <ThemedText style={styles.amountInputLabel}>Amount:</ThemedText>
            <View style={styles.moneyInputContainer}>
              <MoneyInput
                value={amount}
                onChangeText={setAmount}
                autoFocus={true}
              />
            </View>
            <View style={styles.buttonRow}>
              <ThemedButton
                title="Cancel"
                type="outline"
                onPress={() => setShowAddFundsInput(false)}
                style={{ flex: 1, marginRight: 10 }}
              />
              <ThemedButton
                title="Add"
                onPress={handleAddFunds}
                style={{ flex: 1 }}
                type="primary"
              />
            </View>
          </View>
        )}
      </View>
    </BaseModal>
  );
};


function ChipConfigItem({
  chip,
}: {
  chip: ChipType;
}) {
  const colorScheme = useColorScheme() ?? 'light';
  const borderColor = Colors[colorScheme].icon;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', marginRight: 10 }}>
      <View style={[chipConfigurationStyles.chipColorCircle, { backgroundColor: chip.color, borderColor }]}>
        <View style={[chipConfigurationStyles.chipColorCircleInner, { borderColor, backgroundColor: chip.id === 'black' && colorScheme === 'dark' ? '#444' : chip.color }]} />
      </View>
      <ThemedText>{chip.value.toString()}</ThemedText>
    </View>
  );
}

export default function GameScreen() {
  const { gameState, addFunds, finishGame, goToPreviousPhase } = useGameContext();
  const [selectedPlayer, setSelectedPlayer] = useState<{ id: string; name: string; buyIn: number } | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const { screenOptions } = useGameNavigation('Game in Progress', () => goToPreviousPhase());
  const textThemeColor = useThemeColor({}, 'text');
  const colorScheme = useColorScheme() ?? 'light';

  const handlePlayerPress = (player: { id: string; name: string; buyIn: number }) => {
    setSelectedPlayer(player);
    setModalVisible(true);
  };

  const handleAddFunds = (amount: number) => {
    if (selectedPlayer) {
      addFunds(selectedPlayer.id, amount);
    }
  };

  const handleCashOut = () => {
    // To be implemented
    Alert.alert('Coming Soon', 'Cash out functionality will be available soon');
  };

  const handleFinishGame = () => {
    if (gameState.players.length === 0) {
      Alert.alert('No Players', 'You need to add players before finishing a game');
      return;
    }
    finishGame();
    // finishGame sets the phase, which triggers the next screen
  };

  const calculatedStartingChips = gameState.chipValues;


  return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={screenOptions} />

        <View style={styles.buyInInfoContainer}>
          <ThemedText style={styles.buyInInfoLabel}>Initial Buy-In:</ThemedText>
          <ThemedText style={styles.buyInInfoAmount}>${gameState.buyInAmount}</ThemedText>
        </View>

        {calculatedStartingChips && calculatedStartingChips.length > 0 && (
          <View style={styles.chipListContainer}>
            <View style={[styles.horizontalChipList]}>

              {calculatedStartingChips.map(chip => (
                <ChipConfigItem key={chip.color} chip={chip} />
              ))}
            </View>
          </View>
        )}

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
        >
          {gameState.players.length === 0 ? (
            <ThemedText style={styles.emptyState}>
              No players in the game. Go back to setup screen to add players.
            </ThemedText>
          ) : (
            gameState.players.map(player => (
              <Card
                key={player.id}
                onPress={() => handlePlayerPress(player)}
              >
                <View style={styles.playerCardContent}>
                  <ThemedText style={styles.playerName}>{player.name}</ThemedText>
                  <ThemedText style={styles.playerBuyIn}>
                    ${player.buyIn.toLocaleString()}
                  </ThemedText>
                </View>
                <View style={styles.playerCardActions}>
                  <Ionicons
                    name="ellipsis-vertical"
                    size={24}
                    color={Colors[colorScheme].text}
                  />
                </View>
              </Card>
            ))
          )}
        </ScrollView>

        <View style={styles.bottomButtonContainer}>
          <ThemedButton
            title="Finish Game"
            onPress={handleFinishGame}
            type="primary"
            icon={<Ionicons name="checkmark-circle-outline" size={24} color="#FFFFFF" />}
          />
        </View>

        <PlayerActionModal
          visible={modalVisible}
          player={selectedPlayer}
          onClose={() => setModalVisible(false)}
          onAddFunds={handleAddFunds}
          onCashOut={handleCashOut}
        />
      </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
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
  buyInInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15
  },
  chipListContainer: {
    paddingBottom: 15,
    marginBottom: 0,
    alignItems: 'center'
  },
  horizontalChipList: {
    flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center',
  },
  buyInInfoLabel: {
    fontSize: 16,
    marginRight: 5,
    opacity: 0.8,
  },
  buyInInfoAmount: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollView: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.2)',
    paddingTop: 15,
    paddingBottom: 15,
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
  playerBuyIn: {
    fontSize: 16,
  },
  modalBody: {
    alignItems: 'stretch',
  },
  actionButtonSpacing: {
    marginBottom: 15,
  },
  addFundsContainer: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  addFundsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  amountInputLabel: {
    fontSize: 16,
    marginBottom: 5,
  },
  moneyInputContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  bottomButtonContainer: {
    marginTop: 0,
    marginBottom: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.2)'
  },
});
