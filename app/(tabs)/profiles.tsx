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
import { Stack } from 'expo-router';

const ProfilesScreen = () => {
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [history, setHistory] = useState<GameHistoryEntry[]>([]);
  const [players, setPlayers] = useState<{ [key: string]: { name: string; totalProfit: number; gamesPlayed: number; wins: number } }>({});

  // Refresh history when tab is focused
  useFocusEffect(
    React.useCallback(() => {
      const fetchHistory = async () => {
        try {
          const h = await getGameHistory();
          setHistory(h);

          // Aggregate player data
          const playerStats: { [key: string]: { name: string; totalProfit: number; gamesPlayed: number; wins: number } } = {};
          h.forEach(game => {
            game.players.forEach(player => {
              const playerName = player.name;
              if (!playerStats[playerName]) {
                playerStats[playerName] = {
                  name: playerName,
                  totalProfit: 0,
                  gamesPlayed: 0,
                  wins: 0
                };
              }
              playerStats[playerName].totalProfit += player.profitLoss;
              playerStats[playerName].gamesPlayed++;

              // Check if this player won this game
              const maxProfit = Math.max(...game.players.map(p => p.profitLoss));
              if (player.profitLoss === maxProfit) {
                playerStats[playerName].wins++;
              }
            });
          });
          setPlayers(playerStats);
        } catch (err) {
          console.error('[ProfilesScreen] Error loading history:', err);
        }
      };
      fetchHistory();
    }, [])
  );

  const colorScheme = useColorScheme() ?? 'light';
  const textColor = useThemeColor({}, 'text');
  const cardBg = useThemeColor({}, 'background');
  const modalBg = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'icon');

  return (
      <ThemedView style={styles.container}>
        <Stack.Screen options={{ headerShown: true, headerTitle: 'Player Profiles' }} />
        <FlatList
          data={Object.values(players)}
          keyExtractor={item => item.name}
          renderItem={({ item }) => {
            return (
              <TouchableOpacity
                style={[styles.entryCard, { backgroundColor: cardBg, borderColor }]}
                onPress={() => {
                  setSelectedPlayer(item.name);
                  setModalVisible(true);
                }}
              >
                <ThemedText style={styles.entryName}>{item.name}</ThemedText>
                <View style={styles.statsContainer}>
                  <ThemedText style={styles.stat}>
                    Games Played: {item.gamesPlayed}
                  </ThemedText>
                  <ThemedText style={styles.stat}>
                    Wins: {item.wins}
                  </ThemedText>
                  <ThemedText
                    style={[styles.stat, { color: item.totalProfit >= 0 ? '#4CAF50' : '#F44336' }]}
                  >
                    Total Profit: {item.totalProfit >= 0 ? '+' : ''}${item.totalProfit.toLocaleString()}
                  </ThemedText>
                </View>
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
              {selectedPlayer && (
                <ScrollView contentContainerStyle={{ paddingBottom: 16 }}>
                  <ThemedText type="subtitle" style={styles.modalTitle}>{selectedPlayer}</ThemedText>
                  <View style={styles.playerDetails}>
                    <ThemedText style={styles.detailLabel}>Games Played:</ThemedText>
                    <ThemedText style={styles.detailValue}>{players[selectedPlayer].gamesPlayed}</ThemedText>
                  </View>
                  <View style={styles.playerDetails}>
                    <ThemedText style={styles.detailLabel}>Wins:</ThemedText>
                    <ThemedText style={styles.detailValue}>{players[selectedPlayer].wins}</ThemedText>
                  </View>
                  <View style={styles.playerDetails}>
                    <ThemedText style={styles.detailLabel}>Win Rate:</ThemedText>
                    <ThemedText style={styles.detailValue}>
                      {(players[selectedPlayer].wins / players[selectedPlayer].gamesPlayed * 100).toFixed(1)}%
                    </ThemedText>
                  </View>
                  <View style={styles.playerDetails}>
                    <ThemedText style={styles.detailLabel}>Total Profit:</ThemedText>
                    <ThemedText
                      style={[styles.detailValue, { color: players[selectedPlayer].totalProfit >= 0 ? '#4CAF50' : '#F44336' }]}
                    >
                      {players[selectedPlayer].totalProfit >= 0 ? '+' : ''}${players[selectedPlayer].totalProfit.toLocaleString()}
                    </ThemedText>
                  </View>
                  <ThemedText style={styles.gameHistoryTitle}>Game History</ThemedText>
                  {history
                    .filter(game => game.players.some(p => p.name === selectedPlayer))
                    .map((game, i) => (
                      <View key={i} style={styles.gameHistoryItem}>
                        <ThemedText style={styles.gameHistoryDate}>
                          {new Date(game.date).toLocaleDateString()}
                        </ThemedText>
                        <ThemedText style={styles.gameHistoryProfit}>
                          Profit: {game.players.find(p => p.name === selectedPlayer)?.profitLoss ?
                            (game.players.find(p => p.name === selectedPlayer)!.profitLoss >= 0 ? '+' : '') +
                            game.players.find(p => p.name === selectedPlayer)!.profitLoss.toLocaleString() :
                            'N/A'}
                        </ThemedText>
                      </View>
                    ))}
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      </ThemedView>
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
    marginBottom: 20,
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
  },
  entryName: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
  },
  statsContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  stat: {
    fontSize: 14,
    marginVertical: 2,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 300,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  playerDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  detailLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 16,
  },
  gameHistoryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 15,
  },
  gameHistoryItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  gameHistoryDate: {
    fontSize: 14,
    color: '#666',
  },
  gameHistoryProfit: {
    fontSize: 14,
    fontWeight: '600',
  },
});

export default ProfilesScreen;
