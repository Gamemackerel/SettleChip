import React, { useState } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedButton } from '@/components/ThemedButton';
import { Ionicons } from '@expo/vector-icons';
import { getGameHistory, GameHistoryEntry, deleteGameFromHistory } from '@/utils/gameHistory';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useModalStyles } from '@/hooks/useThemedStyles';
import { useFocusEffect } from '@react-navigation/native';
import { Stack } from 'expo-router';
// Import common styles
import {
  layoutStyles,
  textStyles,
  cardStyles,
  modalStyles,
  listStyles,
  formStyles,
  playerStyles
} from '@/styles/commonStyles';

const HistoryScreen = () => {
  const [selected, setSelected] = useState<GameHistoryEntry | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [history, setHistory] = useState<GameHistoryEntry[]>([]);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

  // Theme colors
  const colorScheme = useColorScheme() ?? 'light';
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'icon');
  const themedModalStyles = useModalStyles();

  // Refresh history when tab is focused
  useFocusEffect(
    React.useCallback(() => {
      const fetchHistory = async () => {
        try {
          const h = await getGameHistory();
          setHistory(h);
        } catch (err) {
          console.error('[HistoryScreen] Error loading history:', err);
        }
      };
      fetchHistory();
    }, [])
  );

  const handlePress = (entry: GameHistoryEntry) => {
    setSelected(entry);
    setModalVisible(true);
  };

  // Find winner for each game (max profitLoss)
  function getWinner(players: GameHistoryEntry['players']): string[] {
    if (!players || players.length === 0) return [];
    let max = Math.max(...players.map((p: GameHistoryEntry['players'][number]) => p.profitLoss));
    return players.filter((p: GameHistoryEntry['players'][number]) => p.profitLoss === max).map((p: GameHistoryEntry['players'][number]) => p.name);
  }

  return (
      <ThemedView style={layoutStyles.container}>
        <Stack.Screen options={{ headerShown: true, headerTitle: 'Game History' }} />
        <FlatList
          style={listStyles.listContainer}
          data={history}
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
            const winners = getWinner(item.players);
            return (
              <TouchableOpacity style={[cardStyles.entryCard, { backgroundColor: cardBg, borderColor }]} onPress={() => handlePress(item)}>
                <ThemedText style={styles.entryDate}>{new Date(item.date).toLocaleString()}</ThemedText>
                <ThemedText style={styles.entryPlayers}>
                  {item.players.map((p: GameHistoryEntry['players'][number], idx: number) => (
                    <ThemedText
                      key={p.name}
                      style={winners.includes(p.name) ? styles.winnerText : undefined}
                    >
                      {p.name}{idx < item.players.length - 1 ? ', ' : ''}
                    </ThemedText>
                  ))}
                </ThemedText>
                <Ionicons name="chevron-forward" size={20} color={textColor} />
              </TouchableOpacity>
            );
          }}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={[modalStyles.modalOverlay, themedModalStyles.overlay]}>
            <View style={[modalStyles.modalContentWide, themedModalStyles.content]}>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={textColor} />
              </TouchableOpacity>
              {selected && (
                <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
                  <ThemedText type="subtitle" style={modalStyles.modalTitle}>
                    Game on {new Date(selected.date).toLocaleString()}
                  </ThemedText>
                  {selected.players.map((p: GameHistoryEntry['players'][number], i: number) => (
                    <View key={i} style={styles.playerRow}>
                      <ThemedText style={playerStyles.playerName}>{p.name}</ThemedText>
                      <ThemedText style={styles.playerStat}>Initial Buy-in: ${p.initialBuyIn.toLocaleString()}</ThemedText>
                      <ThemedText style={styles.playerStat}>Total Buy-in: ${p.totalBuyIn.toLocaleString()}</ThemedText>
                      <ThemedText style={styles.playerStat}>Final: ${p.finalAmount.toLocaleString()}</ThemedText>
                      <ThemedText style={[styles.playerStat, { color: p.profitLoss >= 0 ? '#4CAF50' : '#F44336' }]}>
                        Profit/Loss: {p.profitLoss >= 0 ? '+' : ''}{p.profitLoss.toLocaleString()}
                      </ThemedText>
                    </View>
                  ))}
                </ScrollView>
              )}
              <View style={formStyles.formButtonRow}>
                <ThemedButton
                  title="Delete Game"
                  onPress={() => {
                    setDeleteConfirmVisible(true);
                  }}
                  type="outline"
                  style={{ marginTop: 10 }}
                />
                <ThemedButton
                  title="Close"
                  onPress={() => setModalVisible(false)}
                  style={{ marginTop: 10 }}
                />
              </View>
              <Modal
                visible={deleteConfirmVisible}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setDeleteConfirmVisible(false)}
              >
                <View style={[modalStyles.modalOverlay, themedModalStyles.overlay]}>
                  <View style={[modalStyles.modalContentWide, themedModalStyles.content]}>
                    <ThemedText style={styles.deleteConfirmText}>
                      Are you sure you want to delete this game?
                    </ThemedText>
                    <View style={styles.deleteButtonContainer}>
                      <ThemedButton
                        title="Cancel"
                        onPress={() => setDeleteConfirmVisible(false)}
                        type="outline"
                        style={{ marginHorizontal: 5 }}
                      />
                      <ThemedButton
                        title="Delete"
                        onPress={async () => {
                          try {
                            await deleteGameFromHistory(selected?.id || '');
                            const h = await getGameHistory();
                            setHistory(h);
                            setSelected(null);
                            setModalVisible(false);
                            setDeleteConfirmVisible(false);
                          } catch (err) {
                            console.error('[HistoryScreen] Error deleting game:', err);
                            Alert.alert('Error', 'Failed to delete game. Please try again.');
                          }
                        }}
                        type="danger"
                        style={{ marginHorizontal: 5 }}
                      />
                    </View>
                  </View>
                </View>
              </Modal>
            </View>
          </View>
        </Modal>
      </ThemedView>
  );
};

// Component-specific styles only
const styles = StyleSheet.create({
  entryDate: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  entryPlayers: {
    flex: 1,
    marginLeft: 8,
  },
  winnerText: {
    color: '#4CAF50',
    fontWeight: 'bold'
  },
  closeButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    zIndex: 1,
  },
  playerRow: {
    marginBottom: 14,
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingBottom: 8,
  },
  playerStat: {
    fontSize: 14,
    marginLeft: 10,
    marginTop: 2,
  },
  deleteButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  deleteConfirmText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
});

export default HistoryScreen;