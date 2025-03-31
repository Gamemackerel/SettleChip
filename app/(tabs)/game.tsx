import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  TouchableOpacity,
  Modal,
  Text,
  Alert,
  FlatList
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

// Player card component
const PlayerCard = ({
  player,
  onPress
}: {
  player: { id: string; name: string; buyIn: number };
  onPress: () => void;
}) => {
  const colorScheme = useColorScheme() ?? 'light';
  const cardBackground = colorScheme === 'dark' ? '#333' : '#f5f5f5';
  const borderColor = useThemeColor({}, 'icon');

  return (
    <TouchableOpacity
      style={[
        styles.playerCard,
        {
          backgroundColor: cardBackground,
          borderColor
        }
      ]}
      onPress={onPress}
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
    </TouchableOpacity>
  );
};

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
    const numAmount = parseInt(amount, 10);
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
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={handleClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[
          styles.modalContent,
          {
            backgroundColor: modalBackground,
            borderColor
          }
        ]}>
          <View style={styles.modalHeader}>
            <ThemedText style={styles.modalTitle}>{player.name}</ThemedText>
            <TouchableOpacity onPress={handleClose}>
              <Ionicons
                name="close"
                size={24}
                color={Colors[colorScheme].text}
              />
            </TouchableOpacity>
          </View>

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

                <ThemedButton
                  title="Cash Out (Coming Soon)"
                  type="secondary"
                  disabled={true}
                  onPress={() => {}}
                  icon={<Ionicons name="cash-outline" size={24} color="#FFFFFF" />}
                  style={styles.actionButtonSpacing}
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
                    type="accent"
                  />
                </View>
              </View>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default function GameScreen() {
  const { gameState, addFunds, finishGame } = useGameContext();
  const [selectedPlayer, setSelectedPlayer] = useState<{ id: string; name: string; buyIn: number } | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

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
    router.navigate("/(tabs)/tallyup");
  };

  // Display initial buy-in amount at the top
  const renderBuyInInfo = () => {
    if (gameState.buyInAmount > 0) {
      return (
        <View style={styles.buyInInfoContainer}>
          <ThemedText style={styles.buyInInfoLabel}>Initial Buy-In:</ThemedText>
          <ThemedText style={styles.buyInInfoAmount}>${gameState.buyInAmount}</ThemedText>
        </View>
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={useThemeColor({}, 'text')} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>Game in Progress</ThemedText>
          <View style={styles.placeholder} />
        </View>

        {renderBuyInInfo()}

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
              <PlayerCard
                key={player.id}
                player={player}
                onPress={() => handlePlayerPress(player)}
              />
            ))
          )}
        </ScrollView>

        <View style={styles.bottomButtonContainer}>
          <ThemedButton
            title="Finish Game"
            onPress={handleFinishGame}
            type="accent"
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
    </SafeAreaView>
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
  backButton: {
    padding: 5,
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
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.2)',
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
  playerCard: {
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
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    borderRadius: 10,
    borderWidth: 1,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
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
    marginTop: 10,
    marginBottom: 10,
  },
});
