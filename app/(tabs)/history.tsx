import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, StyleSheet, Modal, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedButton } from '@/components/ThemedButton';
import { Ionicons } from '@expo/vector-icons';
import { getGameHistory, GameHistoryEntry } from '@/utils/gameHistory';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useFocusEffect } from '@react-navigation/native';

const HistoryScreen = () => {
  const [selected, setSelected] = useState<GameHistoryEntry | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [history, setHistory] = useState<GameHistoryEntry[]>([]);

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
  const modalBg = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'icon');

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
              <ThemedButton title="Close" onPress={() => setModalVisible(false)} style={{ marginTop: 10 }} />
            </View>
          </View>
        </Modal>
      </ThemedView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
