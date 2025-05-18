import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, Modal, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedButton } from '@/components/ThemedButton';
import { Ionicons } from '@expo/vector-icons';
import { getGameHistory, GameHistoryEntry, deleteGameFromHistory } from '@/utils/gameHistory';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useFocusEffect } from '@react-navigation/native';

const HistoryScreen = () => {
  const [selected, setSelected] = useState<GameHistoryEntry | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [history, setHistory] = useState<GameHistoryEntry[]>([]);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);

  // Refresh history when tab is focused
  useFocusEffect(
    React.useCallback(() => {
      const fetchHistory = async () => {
        try {
          const h = await getGameHistory();
          console.log('[HistoryScreen] Loaded history:', h);
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

  const colorScheme = useColorScheme() ?? 'light';
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'icon');
  const modalBg = useThemeColor({}, 'background');

  // Find winner for each game (max profitLoss)
  function getWinner(players: GameHistoryEntry['players']): string[] {
    if (!players || players.length === 0) return [];
    let max = Math.max(...players.map((p: GameHistoryEntry['players'][number]) => p.profitLoss));
    return players.filter((p: GameHistoryEntry['players'][number]) => p.profitLoss === max).map((p: GameHistoryEntry['players'][number]) => p.name);
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>Game History</ThemedText>
        <FlatList
          data={history}
          keyExtractor={item => item.id}
          renderItem={({ item }) => {
            const winners = getWinner(item.players);
            return (
              <TouchableOpacity style={[styles.entryCard, { backgroundColor: cardBg, borderColor }]} onPress={() => handlePress(item)}>
                <ThemedText style={styles.entryDate}>{new Date(item.date).toLocaleString()}</ThemedText>
                <ThemedText style={styles.entryPlayers}>
                  {item.players.map((p: GameHistoryEntry['players'][number], idx: number) => (
                    <ThemedText
                      key={p.name}
                      style={winners.includes(p.name) ? { color: '#4CAF50', fontWeight: 'bold' } : undefined}
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
          <View style={[styles.modalOverlay, { backgroundColor: colorScheme === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)' }] }>
            <View style={[styles.modalContent, { backgroundColor: modalBg, borderColor }] }>
              <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={textColor} />
              </TouchableOpacity>
              {selected && (
                <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
                  <ThemedText type="subtitle" style={styles.modalTitle}>Game on {new Date(selected.date).toLocaleString()}</ThemedText>
                  {selected.players.map((p: GameHistoryEntry['players'][number], i: number) => (
                    <View key={i} style={styles.playerRow}>
                      <ThemedText style={styles.playerName}>{p.name}</ThemedText>
                      <ThemedText style={styles.playerStat}>Initial Buy-in: ${p.initialBuyIn.toLocaleString()}</ThemedText>
                      <ThemedText style={styles.playerStat}>Total Buy-in: ${p.totalBuyIn.toLocaleString()}</ThemedText>
                      <ThemedText style={styles.playerStat}>Final: ${p.finalAmount.toLocaleString()}</ThemedText>
                      <ThemedText style={[styles.playerStat, { color: p.profitLoss >= 0 ? '#4CAF50' : '#F44336' }]}>Profit/Loss: {p.profitLoss >= 0 ? '+' : ''}{p.profitLoss.toLocaleString()}</ThemedText>
                    </View>
                  ))}
                </ScrollView>
              )}
              <View style={styles.buttonContainer}>
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
                <View style={[styles.modalOverlay, { backgroundColor: colorScheme === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.4)' }]}>
                  <View style={[styles.modalContent, { backgroundColor: modalBg, borderColor, width: '90%', marginHorizontal: '5%' }]}>
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
                            // Refresh history after deletion
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
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
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  entryCard: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  entryDate: {
    fontWeight: 'bold',
    marginRight: 8,
  },
  entryPlayers: {
    flex: 1,
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    borderRadius: 12,
    padding: 24,
    width: '90%',
    maxHeight: '80%',
    borderWidth: 1,
  },
  closeButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    zIndex: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 18,
    textAlign: 'center',
  },
  playerRow: {
    marginBottom: 14,
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingBottom: 8,
  },
  playerName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  playerStat: {
    fontSize: 14,
    marginLeft: 10,
    marginTop: 2,
  },
});

export default HistoryScreen;
