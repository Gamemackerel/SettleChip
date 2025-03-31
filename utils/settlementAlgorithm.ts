import { Player } from '@/context/GameContext';

// Define types
export type PlayerBalance = {
  player: Player;
  amount: number;
};

export type Transaction = {
  id: string;
  from: Player;
  to: Player;
  amount: number;
  writeOff?: number;
};

export type SettlementResult = {
  transactions: Transaction[];
  totalWriteOff: number;
  originalSum: number;
  finalSum: number;
  simplificationPossible: boolean;
};

/**
 * Calculates the optimal settlement transactions between players
 * @param players List of players with their final amounts
 * @param useWriteOffThreshold Whether to use the write-off threshold
 * @param writeOffThreshold The threshold amount for write-offs
 * @returns Object containing transactions and metadata about the settlement
 */
export function calculateOptimalSettlement(
  players: Player[], 
  useWriteOffThreshold: boolean = false,
  writeOffThreshold: number = 0.01
): { 
  transactions: Transaction[],
  simplifiedTransactions: Transaction[],
  simplificationPossible: boolean,
  transactionDifference: number,
  totalWriteOff: number
} {
  // Calculate each player's balance (positive = creditor, negative = debtor)
  const balances: Record<string, number> = {};
  
  players.forEach(player => {
    if (player.finalAmount === undefined) return;
    
    const balance = player.finalAmount - player.buyIn;
    balances[player.id] = balance;
  });
  
  // Always calculate both versions to compare
  const regularResult = { 
    transactions: optimalSettlement(balances), 
    totalWriteOff: 0, 
    originalSum: 0, 
    finalSum: 0 
  };
  
  const simplifiedResult = optimalSettlementWithThreshold(balances, writeOffThreshold);
  
  // Determine if simplification is possible and beneficial
  const simplificationPossible = simplifiedResult.transactions.length < regularResult.transactions.length;
  const transactionDifference = regularResult.transactions.length - simplifiedResult.transactions.length;
  
  // Convert to our Transaction type with full Player objects
  const convertToTransactions = (algorithmTransactions: any[]) => {
    return algorithmTransactions.map(transaction => {
      // Handle write-off special cases
      if (transaction.from === "WRITE-OFF") {
        // Find a player to represent the system (we'll use the first player as a placeholder)
        const systemPlayer = players[0];
        return {
          id: `writeoff-${transaction.to}`,
          from: systemPlayer,
          to: players.find(p => p.id === transaction.to)!,
          amount: 0,
          writeOff: transaction.writeOff
        };
      } else if (transaction.to === "WRITE-OFF") {
        // Find a player to represent the system (we'll use the first player as a placeholder)
        const systemPlayer = players[0];
        return {
          id: `${transaction.from}-writeoff`,
          from: players.find(p => p.id === transaction.from)!,
          to: systemPlayer,
          amount: 0,
          writeOff: transaction.writeOff
        };
      } else {
        return {
          id: `${transaction.from}-${transaction.to}`,
          from: players.find(p => p.id === transaction.from)!,
          to: players.find(p => p.id === transaction.to)!,
          amount: transaction.amount,
          writeOff: transaction.writeOff
        };
      }
    });
  };
  
  const regularTransactions = convertToTransactions(regularResult.transactions);
  const simplifiedTransactions = convertToTransactions(simplifiedResult.transactions);
  
  // Return the appropriate transactions based on the useWriteOffThreshold flag
  return {
    transactions: useWriteOffThreshold ? simplifiedTransactions : regularTransactions,
    simplifiedTransactions: simplifiedTransactions,
    simplificationPossible,
    transactionDifference,
    totalWriteOff: simplifiedResult.totalWriteOff
  };
}

/**
 * A more sophisticated settlement algorithm that better minimizes transactions
 * by avoiding unnecessary splits and favoring exact matches
 */
function optimalSettlement(balances: Record<string, number>) {
  // Separate creditors and debtors
  const creditors: { name: string; amount: number }[] = [];
  const debtors: { name: string; amount: number }[] = [];
  
  for (const player in balances) {
    if (balances[player] > 0) {
      creditors.push({ name: player, amount: balances[player] });
    } else if (balances[player] < 0) {
      debtors.push({ name: player, amount: -balances[player] }); // Store as positive
    }
  }
  
  // Step 1: Look for exact matches first
  const transactions = findExactMatches(debtors, creditors);
  
  // Step 2: Sort remaining by amount (descending)
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);
  
  // Step 3: Try to avoid splitting payments
  // For each debtor, find the creditor with the closest amount
  const remainingTransactions = minimizeSplits(debtors, creditors);
  
  return [...transactions, ...remainingTransactions];
}

// Modified settlement algorithm with a write-off threshold
function optimalSettlementWithThreshold(balances: Record<string, number>, threshold = 0.01) {
  // Create a copy of balances to avoid modifying the original
  const adjustedBalances = { ...balances };
  
  // Calculate the sum before adjustments
  const originalSum = Object.values(balances).reduce((sum, val) => sum + val, 0);
  
  // First, handle small balances that are within the threshold
  let totalWriteOff = 0;
  for (const player in adjustedBalances) {
    if (Math.abs(adjustedBalances[player]) <= threshold) {
      totalWriteOff += adjustedBalances[player];
      adjustedBalances[player] = 0;
    }
  }
  
  // Separate creditors and debtors
  const creditors: { name: string; amount: number }[] = [];
  const debtors: { name: string; amount: number }[] = [];
  
  for (const player in adjustedBalances) {
    if (adjustedBalances[player] > 0) {
      creditors.push({ name: player, amount: adjustedBalances[player] });
    } else if (adjustedBalances[player] < 0) {
      debtors.push({ name: player, amount: -adjustedBalances[player] }); // Store as positive
    }
  }
  
  // Step 1: Look for exact matches first, with the threshold
  const transactions = findExactMatchesWithThreshold(debtors, creditors, threshold);
  
  // Step 2: Sort remaining by amount (descending)
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);
  
  // Step 3: Try to avoid splitting payments
  // For each debtor, find the creditor with the closest amount
  const remainingTransactions = minimizeSplitsWithThreshold(debtors, creditors, threshold);
  
  // Calculate the sum after adjustments
  const finalSum = Object.values(adjustedBalances).reduce((sum, val) => sum + val, 0);
  
  return {
    transactions: [...transactions, ...remainingTransactions],
    totalWriteOff,
    originalSum,
    finalSum
  };
}

// Find exact matches between debtors and creditors
function findExactMatches(
  debtors: { name: string; amount: number }[],
  creditors: { name: string; amount: number }[]
) {
  const transactions: { from: string; to: string; amount: number; writeOff?: number }[] = [];
  const exactMatchDebtorIndices: number[] = [];
  const exactMatchCreditorIndices: number[] = [];
  
  // First pass: look for exact matches
  for (let i = 0; i < debtors.length; i++) {
    for (let j = 0; j < creditors.length; j++) {
      // Skip if this debtor or creditor was already matched
      if (exactMatchDebtorIndices.includes(i) || exactMatchCreditorIndices.includes(j)) {
        continue;
      }
      
      // If we find an exact match
      if (Math.abs(debtors[i].amount - creditors[j].amount) < 0.01) {
        transactions.push({
          from: debtors[i].name,
          to: creditors[j].name,
          amount: debtors[i].amount
        });
        
        exactMatchDebtorIndices.push(i);
        exactMatchCreditorIndices.push(j);
        
        // Set to zero to mark as processed
        debtors[i].amount = 0;
        creditors[j].amount = 0;
      }
    }
  }
  
  // Remove settled debtors and creditors
  for (let i = debtors.length - 1; i >= 0; i--) {
    if (debtors[i].amount < 0.01) {
      debtors.splice(i, 1);
    }
  }
  
  for (let i = creditors.length - 1; i >= 0; i--) {
    if (creditors[i].amount < 0.01) {
      creditors.splice(i, 1);
    }
  }
  
  return transactions;
}

// Find exact matches between debtors and creditors with threshold
function findExactMatchesWithThreshold(
  debtors: { name: string; amount: number }[],
  creditors: { name: string; amount: number }[],
  threshold: number
) {
  const transactions: { from: string; to: string; amount: number; writeOff?: number }[] = [];
  const exactMatchDebtorIndices: number[] = [];
  const exactMatchCreditorIndices: number[] = [];
  
  // First pass: look for exact matches or close enough matches
  for (let i = 0; i < debtors.length; i++) {
    for (let j = 0; j < creditors.length; j++) {
      // Skip if this debtor or creditor was already matched
      if (exactMatchDebtorIndices.includes(i) || exactMatchCreditorIndices.includes(j)) {
        continue;
      }
      
      // If we find an exact match or close enough match
      if (Math.abs(debtors[i].amount - creditors[j].amount) <= threshold) {
        // Use the smaller amount for the transaction
        const amount = Math.min(debtors[i].amount, creditors[j].amount);
        transactions.push({
          from: debtors[i].name,
          to: creditors[j].name,
          amount: amount,
          // Note the write-off if there was one
          writeOff: Math.abs(debtors[i].amount - creditors[j].amount)
        });
        
        exactMatchDebtorIndices.push(i);
        exactMatchCreditorIndices.push(j);
        
        // Set to zero to mark as processed
        debtors[i].amount = 0;
        creditors[j].amount = 0;
      }
    }
  }
  
  // Remove settled debtors and creditors
  for (let i = debtors.length - 1; i >= 0; i--) {
    if (debtors[i].amount <= threshold) {
      debtors.splice(i, 1);
    }
  }
  
  for (let i = creditors.length - 1; i >= 0; i--) {
    if (creditors[i].amount <= threshold) {
      creditors.splice(i, 1);
    }
  }
  
  return transactions;
}

// Try to minimize splitting payments
function minimizeSplits(
  debtors: { name: string; amount: number }[],
  creditors: { name: string; amount: number }[]
) {
  const transactions: { from: string; to: string; amount: number; writeOff?: number }[] = [];
  
  // If no debtors or creditors remain, we're done
  if (debtors.length === 0 || creditors.length === 0) {
    return transactions;
  }
  
  // Create a copy of the arrays to avoid modifying the originals
  const remainingDebtors = [...debtors];
  const remainingCreditors = [...creditors];
  
  // Look for near matches (within 10%)
  for (let i = 0; i < remainingDebtors.length; i++) {
    if (remainingDebtors[i].amount < 0.01) continue;
    
    let bestCreditorIndex = -1;
    let bestDifference = Infinity;
    
    // Find the creditor with the closest amount
    for (let j = 0; j < remainingCreditors.length; j++) {
      if (remainingCreditors[j].amount < 0.01) continue;
      
      const difference = Math.abs(remainingDebtors[i].amount - remainingCreditors[j].amount);
      
      // If this is a close match, prefer it
      if (difference < bestDifference) {
        bestDifference = difference;
        bestCreditorIndex = j;
      }
    }
    
    // If we found a good match
    if (bestCreditorIndex !== -1) {
      const amount = Math.min(remainingDebtors[i].amount, remainingCreditors[bestCreditorIndex].amount);
      
      transactions.push({
        from: remainingDebtors[i].name,
        to: remainingCreditors[bestCreditorIndex].name,
        amount: amount
      });
      
      remainingDebtors[i].amount -= amount;
      remainingCreditors[bestCreditorIndex].amount -= amount;
    }
  }
  
  // If we still have unsettled balances, use the greedy approach for the rest
  let d = 0;
  let c = 0;
  
  while (d < remainingDebtors.length && c < remainingCreditors.length) {
    // Skip settled players
    while (d < remainingDebtors.length && remainingDebtors[d].amount < 0.01) d++;
    while (c < remainingCreditors.length && remainingCreditors[c].amount < 0.01) c++;
    
    // If we've reached the end of either list, we're done
    if (d >= remainingDebtors.length || c >= remainingCreditors.length) break;
    
    const amount = Math.min(remainingDebtors[d].amount, remainingCreditors[c].amount);
    
    transactions.push({
      from: remainingDebtors[d].name,
      to: remainingCreditors[c].name,
      amount: amount
    });
    
    remainingDebtors[d].amount -= amount;
    remainingCreditors[c].amount -= amount;
  }
  
  return transactions;
}

// Try to minimize splitting payments with threshold
function minimizeSplitsWithThreshold(
  debtors: { name: string; amount: number }[],
  creditors: { name: string; amount: number }[],
  threshold: number
) {
  const transactions: { from: string; to: string; amount: number; writeOff?: number }[] = [];
  
  // If no debtors or creditors remain, we're done
  if (debtors.length === 0 || creditors.length === 0) {
    return transactions;
  }
  
  // Create a copy of the arrays to avoid modifying the originals
  const remainingDebtors = [...debtors];
  const remainingCreditors = [...creditors];
  
  // Look for near matches
  for (let i = 0; i < remainingDebtors.length; i++) {
    if (remainingDebtors[i].amount <= threshold) continue;
    
    let bestCreditorIndex = -1;
    let bestDifference = Infinity;
    
    // Find the creditor with the closest amount
    for (let j = 0; j < remainingCreditors.length; j++) {
      if (remainingCreditors[j].amount <= threshold) continue;
      
      const difference = Math.abs(remainingDebtors[i].amount - remainingCreditors[j].amount);
      
      // If this is a close match, prefer it
      if (difference < bestDifference) {
        bestDifference = difference;
        bestCreditorIndex = j;
      }
    }
    
    // If we found a match and the difference is small enough, treat it as an exact match
    if (bestCreditorIndex !== -1) {
      const debtorAmount = remainingDebtors[i].amount;
      const creditorAmount = remainingCreditors[bestCreditorIndex].amount;
      
      // If the difference is within the threshold, handle it as a write-off
      if (Math.abs(debtorAmount - creditorAmount) <= threshold) {
        const amount = Math.min(debtorAmount, creditorAmount);
        transactions.push({
          from: remainingDebtors[i].name,
          to: remainingCreditors[bestCreditorIndex].name,
          amount: amount,
          writeOff: Math.abs(debtorAmount - creditorAmount)
        });
        
        remainingDebtors[i].amount = 0;
        remainingCreditors[bestCreditorIndex].amount = 0;
      } else {
        // Otherwise, handle normally
        const amount = Math.min(debtorAmount, creditorAmount);
        transactions.push({
          from: remainingDebtors[i].name,
          to: remainingCreditors[bestCreditorIndex].name,
          amount: amount
        });
        
        remainingDebtors[i].amount -= amount;
        remainingCreditors[bestCreditorIndex].amount -= amount;
        
        // Handle small remaining amounts
        if (remainingDebtors[i].amount > 0 && remainingDebtors[i].amount <= threshold) {
          transactions[transactions.length - 1].writeOff = 
            (transactions[transactions.length - 1].writeOff || 0) + remainingDebtors[i].amount;
          remainingDebtors[i].amount = 0;
        }
        if (remainingCreditors[bestCreditorIndex].amount > 0 && remainingCreditors[bestCreditorIndex].amount <= threshold) {
          transactions[transactions.length - 1].writeOff = 
            (transactions[transactions.length - 1].writeOff || 0) + remainingCreditors[bestCreditorIndex].amount;
          remainingCreditors[bestCreditorIndex].amount = 0;
        }
      }
    }
  }
  
  // Clean up remaining debtors and creditors with amounts within threshold
  for (let i = 0; i < remainingDebtors.length; i++) {
    if (remainingDebtors[i].amount > 0 && remainingDebtors[i].amount <= threshold) {
      transactions.push({
        from: remainingDebtors[i].name,
        to: "WRITE-OFF",
        amount: 0,
        writeOff: remainingDebtors[i].amount
      });
      remainingDebtors[i].amount = 0;
    }
  }
  
  for (let i = 0; i < remainingCreditors.length; i++) {
    if (remainingCreditors[i].amount > 0 && remainingCreditors[i].amount <= threshold) {
      transactions.push({
        from: "WRITE-OFF",
        to: remainingCreditors[i].name,
        amount: 0,
        writeOff: remainingCreditors[i].amount
      });
      remainingCreditors[i].amount = 0;
    }
  }
  
  // If we still have unsettled balances, use the greedy approach for the rest
  let d = 0;
  let c = 0;
  
  while (d < remainingDebtors.length && c < remainingCreditors.length) {
    // Skip settled players
    while (d < remainingDebtors.length && remainingDebtors[d].amount <= threshold) d++;
    while (c < remainingCreditors.length && remainingCreditors[c].amount <= threshold) c++;
    
    // If we've reached the end of either list, we're done
    if (d >= remainingDebtors.length || c >= remainingCreditors.length) break;
    
    const amount = Math.min(remainingDebtors[d].amount, remainingCreditors[c].amount);
    
    transactions.push({
      from: remainingDebtors[d].name,
      to: remainingCreditors[c].name,
      amount: amount
    });
    
    remainingDebtors[d].amount -= amount;
    remainingCreditors[c].amount -= amount;
    
    // Handle small remaining amounts
    if (remainingDebtors[d].amount > 0 && remainingDebtors[d].amount <= threshold) {
      transactions[transactions.length - 1].writeOff = 
        (transactions[transactions.length - 1].writeOff || 0) + remainingDebtors[d].amount;
      remainingDebtors[d].amount = 0;
    }
    if (remainingCreditors[c].amount > 0 && remainingCreditors[c].amount <= threshold) {
      transactions[transactions.length - 1].writeOff = 
        (transactions[transactions.length - 1].writeOff || 0) + remainingCreditors[c].amount;
      remainingCreditors[c].amount = 0;
    }
  }
  
  return transactions;
}
