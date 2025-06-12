import React, { useMemo, useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  ScrollView,
  FlatList,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Stack } from 'expo-router';
import { useGameNavigation } from '@/hooks/useGameNavigation';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { ThemedButton } from '@/components/ThemedButton';
import { useThemeColor } from '@/hooks/useThemeColor';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useGameContext } from '@/context/GameContext';
import { Transaction, calculateOptimalSettlement } from '@/utils/settlementAlgorithm';
// Import common styles
import {
  layoutStyles,
  textStyles,
  cardStyles,
  listStyles,
  buttonStyles,
  infoStyles,
  iconStyles
} from '@/styles/commonStyles';

// Transaction card component
const TransactionCard = ({ transaction }: { transaction: Transaction }) => {
  const backgroundColor = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'border');
  const textColor = useThemeColor({}, 'text');

  // Handle write-off display
  const hasWriteOff = transaction.writeOff && transaction.writeOff > 0;

  return (
    <View style={[cardStyles.transactionCard, { backgroundColor, borderColor }]}>
      <View style={styles.transactionArrow}>
        <ThemedText style={styles.fromName}>{transaction.from.name}</ThemedText>
        <View style={styles.arrowContainer}>
          <Ionicons name="arrow-forward" size={20} color={textColor} />
        </View>
        <ThemedText style={styles.toName}>{transaction.to.name}</ThemedText>
      </View>
      <ThemedText style={styles.transactionAmount}>
        {transaction.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
      </ThemedText>

      {hasWriteOff && (
        <View style={styles.writeOffContainer}>
          <Ionicons name="information-circle-outline" size={16} color="#FF9800" />
          <ThemedText style={styles.writeOffText}>
            Includes write-off: {transaction.writeOff?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
          </ThemedText>
        </View>
      )}
    </View>
  );
};

export default function SettleUpScreen() {
  const { gameState, goToPreviousPhase, goToNextPhase, resetGame } = useGameContext();
  const [useWriteOffThreshold, setUseWriteOffThreshold] = useState(false);
  const [writeOffThreshold, setWriteOffThreshold] = useState(0);
  const colorScheme = useColorScheme();
  const { screenOptions } = useGameNavigation('Settle Up', () => goToPreviousPhase());
  const textColor = useThemeColor({}, 'text');
  const accentColor = useThemeColor({}, 'buttonAccent');
  const cardBackground = useThemeColor({}, 'background');
  const borderColor = useThemeColor({}, 'border');

  // Determine the write-off threshold based on chip values (less than 2 red chips)
  useEffect(() => {
    // Default to 1 for now TODO: get this from your chip configuration
    setWriteOffThreshold(1);
  }, []);

  // Calculate optimal transactions to settle debts using the new algorithm
  const settlementResult = useMemo(() => {
    if (!gameState.players.length || !gameState.isTallyBalanced) {
      return {
        transactions: [],
        simplifiedTransactions: [],
        simplificationPossible: false,
        transactionDifference: 0,
        totalWriteOff: 0
      };
    }

    return calculateOptimalSettlement(
      gameState.players,
      useWriteOffThreshold,
      writeOffThreshold
    );
  }, [gameState.players, gameState.isTallyBalanced, useWriteOffThreshold, writeOffThreshold]);

  const transactions = settlementResult.transactions;
  const simplificationPossible = settlementResult.simplificationPossible;
  const transactionDifference = settlementResult.transactionDifference;
  const totalWriteOff = settlementResult.totalWriteOff;

  const handleNewGame = () => {
    resetGame();
  };

  const toggleWriteOffThreshold = () => {
    setUseWriteOffThreshold(!useWriteOffThreshold);
  };

  return (
      <ThemedView style={layoutStyles.container}>
        <Stack.Screen options={screenOptions} />

        <ScrollView
          style={layoutStyles.scrollView}
          contentContainerStyle={layoutStyles.scrollContent}
        >
          {!gameState.isTallyBalanced ? (
            <View style={iconStyles.warningContainer}>
              <Ionicons name="warning" size={32} color="#FF9800" />
              <ThemedText style={textStyles.errorText}>
                Cannot calculate settlements because the tally is not balanced.
              </ThemedText>
              <ThemedButton
                title="Return to Tally"
                onPress={() => goToNextPhase()}
                type="secondary"
              />
            </View>
          ) : (
            <>
              {simplificationPossible && (
                <View style={[styles.settingsContainer, { borderColor, backgroundColor: cardBackground }]}>
                  <View style={styles.settingRow}>
                    <View style={styles.settingLabelContainer}>
                      <ThemedText style={styles.settingLabel}>
                        Simplify transactions
                      </ThemedText>
                      <ThemedText style={styles.settingDescription}>
                        {transactionDifference === 1
                          ? "1 fewer transaction"
                          : `${transactionDifference} fewer transactions`} if you write off small amounts under {writeOffThreshold.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                      </ThemedText>
                    </View>
                    <Switch
                      value={useWriteOffThreshold}
                      onValueChange={toggleWriteOffThreshold}
                      trackColor={{ false: '#767577', true: accentColor }}
                      thumbColor={useWriteOffThreshold ? '#fff' : '#f4f3f4'}
                      ios_backgroundColor="#3e3e3e"
                    />
                  </View>
                </View>
              )}

              {useWriteOffThreshold && totalWriteOff > 0 && (
                <View style={styles.writeOffSummary}>
                  <Ionicons name="information-circle" size={20} color="#FF9800" />
                  <ThemedText style={styles.writeOffSummaryText}>
                    Total simplified: {totalWriteOff.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                  </ThemedText>
                </View>
              )}

              <View style={styles.sectionContainer}>
                <ThemedText style={textStyles.sectionTitle}>Recommended Transactions</ThemedText>
                <ThemedText style={textStyles.sectionDescription}>
                  The following transactions will settle all debts with the minimum number of payments:
                </ThemedText>

                {transactions.length > 0 ? (
                  <FlatList
                    data={transactions}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => <TransactionCard transaction={item} />}
                    scrollEnabled={false}
                    style={listStyles.transactionList}
                  />
                ) : (
                  <View style={iconStyles.successContainer}>
                    <Ionicons name="checkmark-circle" size={32} color="#4CAF50" />
                    <ThemedText style={textStyles.noTransactionsText}>
                      No transactions needed! Everyone is settled up.
                    </ThemedText>
                  </View>
                )}
              </View>
            </>
          )}
        </ScrollView>

        <View style={buttonStyles.buttonContainer}>
          <ThemedButton
            title="New Game"
            onPress={handleNewGame}
            type="primary"
            icon={<Ionicons name="refresh" size={24} color="#FFFFFF" />}
          />
        </View>
      </ThemedView>
  );
}

// Component-specific styles only
const styles = StyleSheet.create({
  transactionArrow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  fromName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  arrowContainer: {
    paddingHorizontal: 8,
  },
  toName: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 8,
  },
  writeOffContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    padding: 4,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 4,
  },
  writeOffText: {
    fontSize: 12,
    marginLeft: 4,
    color: '#FF9800',
  },
  settingsContainer: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingLabelContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  writeOffSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 152, 0, 0.1)',
    borderRadius: 8,
    marginBottom: 20,
  },
  writeOffSummaryText: {
    fontSize: 14,
    marginLeft: 8,
  },
  sectionContainer: {
    marginBottom: 24,
  },
});
