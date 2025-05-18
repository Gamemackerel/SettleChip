
// Chip colors
type ChipColor = "White" | "Red" | "Blue" | "Green" | "Black";
const chipColors: ChipColor[] = ["White", "Red", "Blue", "Green", "Black"];

// Multiplier data (raw format)
type MultiplierData = {
    multipliers: number[];           // Actual multipliers applied to V1 [1, m2, m2*m3, m2*m3*m4, m2*m3*m4*m5]
    individualMultipliers: number[]; // Individual multiplier jumps [1, m2, m3, m4, m5]
};

// A complete solution
type Solution = {
    multipliers: number[];           // Actual multipliers applied to V1
    individualMultipliers: number[]; // Individual multiplier jumps
    chipValues: number[];            // Dollar values for each chip
    distribution: number[];          // Number of each chip in distribution
    totalChips: number;              // Total number of chips in distribution
    totalValue: number;              // Total value of distribution in dollars
};

// Formatted solution for display
type FormattedSolution = {
    name?: string;
    multipliers: string[];                   // String representation of multipliers
    chipValues: {                            // Formatted chip values
        color: ChipColor;
        value: string;                         // Formatted as "$1.00"
        multiplier: string;                    // Formatted as "2x" or "-"
    }[];
    distribution: {                          // Formatted distribution
        color: ChipColor;
        count: number;
        value: string;                         // Formatted as "$1.00"
        totalValue: string;                    // Formatted as "2.00"
    }[];
    totalChips: number;
    totalValue: string;                      // Formatted as "10.00"
};


// Constants for our constraints
const MIN_CHIPS_PER_PLAYER = 15;
const MAX_CHIPS_PER_PLAYER = 35;
const PREFERRED_TOTAL_CHIPS = 25;
const MIN_SMALL_BLIND_RATIO = 0.4; // 40% of chips should be small blind chips

// Possible multipliers
const possibleMultipliers = [2, 4, 5];

// Function to generate all valid multiplier combinations
function generateMultiplierCombinations() {
  const combinations = [];

  for (const m2 of possibleMultipliers) {
    for (const m3 of possibleMultipliers) {
      for (const m4 of possibleMultipliers) {
        for (const m5 of possibleMultipliers) {
          // Calculate the actual multiplier values
          const multipliers = [1, m2, m2 * m3, m2 * m3 * m4, m2 * m3 * m4 * m5];
          combinations.push({
            multipliers,
            individualMultipliers: [1, m2, m3, m4, m5]
          });
        }
      }
    }
  }

  return combinations;
}

// Find valid chip distributions for a given set of multipliers
function findChipDistributions(multiplierData: MultiplierData, buyIn: number, smallBlind: number, playerCount: number, availableChips: number[]) {
  const { multipliers, individualMultipliers } = multiplierData;
  const V1 = smallBlind; // smallest chip value = small blind
  const chipValues = multipliers.map(m => V1 * m);

  const solutions: Solution[] = [];

  // Try different numbers of total chips per player
  for (let totalChips = MIN_CHIPS_PER_PLAYER; totalChips <= MAX_CHIPS_PER_PLAYER; totalChips++) {
    // Try different distributions of the smallest chip
    for (let x1 = Math.ceil(totalChips * MIN_SMALL_BLIND_RATIO); x1 <= totalChips; x1++) {
      // Maximum possible x2 to ensure x1 > x2
      const maxX2 = x1 - 1;

      if (maxX2 <= 0) continue; // Skip if we can't satisfy x1 > x2

      // Try different values for x2
      for (let x2 = 1; x2 <= maxX2; x2++) {
        // Maximum possible x3 to ensure x2 > x3
        const maxX3 = x2 - 1;

        // Calculate remaining chips and value
        const usedChips = x1 + x2;
        const usedValue = x1 * chipValues[0] + x2 * chipValues[1];
        const remainingChips = totalChips - usedChips;
        const remainingValue = buyIn - usedValue;

        // If we have no more room for chips or we've exceeded the buy-in, skip
        if (remainingChips <= 0 || remainingValue <= 0) {
          // Check if we have a valid solution with just x1 and x2
          if (remainingChips === 0 && Math.abs(remainingValue) < 0.001) {
            const distribution = [x1, x2, 0, 0, 0];

            // Check if this distribution violates our available chips constraint
            let valid = true;
            for (let i = 0; i < distribution.length; i++) {
              if (distribution[i] * playerCount > availableChips[i]) {
                valid = false;
                break;
              }
            }

            if (valid) {
              solutions.push({
                multipliers,
                individualMultipliers,
                chipValues,
                distribution,
                totalChips: usedChips,
                totalValue: usedValue
              });
            }
          }
          continue;
        }

        // If we can't satisfy x2 > x3, skip further recursive checks
        if (maxX3 <= 0) continue;

        // Try different values for x3
        for (let x3 = 0; x3 <= maxX3; x3++) {
          if (x3 > 0) {
            // Maximum possible x4 to ensure x3 > x4
            const maxX4 = x3 - 1;

            // Calculate remaining chips and value with x3
            const usedChipsWithX3 = usedChips + x3;
            const usedValueWithX3 = usedValue + x3 * chipValues[2];
            const remainingChipsWithX3 = totalChips - usedChipsWithX3;
            const remainingValueWithX3 = buyIn - usedValueWithX3;

            // If we have no more room for chips or we've exceeded the buy-in, skip
            if (remainingChipsWithX3 <= 0 || remainingValueWithX3 <= 0) {
              // Check if we have a valid solution with just x1, x2, and x3
              if (remainingChipsWithX3 === 0 && Math.abs(remainingValueWithX3) < 0.001) {
                const distribution = [x1, x2, x3, 0, 0];

                // Check if this distribution violates our available chips constraint
                let valid = true;
                for (let i = 0; i < distribution.length; i++) {
                  if (distribution[i] * playerCount > availableChips[i]) {
                    valid = false;
                    break;
                  }
                }

                if (valid) {
                  solutions.push({
                    multipliers,
                    individualMultipliers,
                    chipValues,
                    distribution,
                    totalChips: usedChipsWithX3,
                    totalValue: usedValueWithX3
                  });
                }
              }
              continue;
            }

            // If we can't satisfy x3 > x4, skip further recursive checks
            if (maxX4 <= 0) continue;

            // Try different values for x4
            for (let x4 = 0; x4 <= maxX4; x4++) {
              if (x4 > 0) {
                // Maximum possible x5 to ensure x4 > x5
                const maxX5 = x4 - 1;

                // Calculate remaining chips and value with x4
                const usedChipsWithX4 = usedChipsWithX3 + x4;
                const usedValueWithX4 = usedValueWithX3 + x4 * chipValues[3];
                const remainingChipsWithX4 = totalChips - usedChipsWithX4;
                const remainingValueWithX4 = buyIn - usedValueWithX4;

                // If we have no more room for chips or we've exceeded the buy-in, skip
                if (remainingChipsWithX4 <= 0 || remainingValueWithX4 <= 0) {
                  // Check if we have a valid solution with just x1, x2, x3, and x4
                  if (remainingChipsWithX4 === 0 && Math.abs(remainingValueWithX4) < 0.001) {
                    const distribution = [x1, x2, x3, x4, 0];

                    // Check if this distribution violates our available chips constraint
                    let valid = true;
                    for (let i = 0; i < distribution.length; i++) {
                      if (distribution[i] * playerCount > availableChips[i]) {
                        valid = false;
                        break;
                      }
                    }

                    if (valid) {
                      solutions.push({
                        multipliers,
                        individualMultipliers,
                        chipValues,
                        distribution,
                        totalChips: usedChipsWithX4,
                        totalValue: usedValueWithX4
                      });
                    }
                  }
                  continue;
                }

                // If we can't satisfy x4 > x5, skip further recursive checks
                if (maxX5 <= 0) continue;

                // Try different values for x5
                for (let x5 = 0; x5 <= maxX5; x5++) {
                  // Calculate total chips and value with all denominations
                  const totalChipsUsed = usedChipsWithX4 + x5;
                  const totalValueUsed = usedValueWithX4 + x5 * chipValues[4];

                  // Check if we have a valid solution
                  if (totalChipsUsed <= totalChips && Math.abs(totalValueUsed - buyIn) < 0.001) {
                    const distribution = [x1, x2, x3, x4, x5];

                    // Check if this distribution violates our available chips constraint
                    let valid = true;
                    for (let i = 0; i < distribution.length; i++) {
                      if (distribution[i] * playerCount > availableChips[i]) {
                        valid = false;
                        break;
                      }
                    }

                    if (valid) {
                      solutions.push({
                        multipliers,
                        individualMultipliers,
                        chipValues,
                        distribution,
                        totalChips: totalChipsUsed,
                        totalValue: totalValueUsed
                      });
                    }
                  }
                }
              } else {
                // Handle case where x4 = 0 (skip to x5 = 0)
                // Check if we have a valid solution with just x1, x2, and x3
                const distribution = [x1, x2, x3, 0, 0];
                const totalChipsUsed = usedChipsWithX3;
                const totalValueUsed = usedValueWithX3;

                if (Math.abs(totalValueUsed - buyIn) < 0.001) {
                  // Check if this distribution violates our available chips constraint
                  let valid = true;
                  for (let i = 0; i < distribution.length; i++) {
                    if (distribution[i] * playerCount > availableChips[i]) {
                      valid = false;
                      break;
                    }
                  }

                  if (valid) {
                    solutions.push({
                      multipliers,
                      individualMultipliers,
                      chipValues,
                      distribution,
                      totalChips: totalChipsUsed,
                      totalValue: totalValueUsed
                    });
                  }
                }
              }
            }
          } else {
            // Handle case where x3 = 0 (skip to x4 = 0, x5 = 0)
            // Check if we have a valid solution with just x1 and x2
            const distribution = [x1, x2, 0, 0, 0];
            const totalChipsUsed = usedChips;
            const totalValueUsed = usedValue;

            if (Math.abs(totalValueUsed - buyIn) < 0.001) {
              // Check if this distribution violates our available chips constraint
              let valid = true;
              for (let i = 0; i < distribution.length; i++) {
                if (distribution[i] * playerCount > availableChips[i]) {
                  valid = false;
                  break;
                }
              }

              if (valid) {
                solutions.push({
                  multipliers,
                  individualMultipliers,
                  chipValues,
                  distribution,
                  totalChips: totalChipsUsed,
                  totalValue: totalValueUsed
                });
              }
            }
          }
        }
      }
    }
  }

  return solutions;
}

// Function to find all valid solutions
export function findAllSolutions(buyIn: number, bigBlind: number, playerCount: number, availableChips: number[]) {
  const smallBlind = bigBlind / 2;
  const multiplierCombinations = generateMultiplierCombinations();
  let allSolutions: Solution[] = [];

  console.log(`Generated ${multiplierCombinations.length} valid multiplier combinations`);
  console.log(`Generating solutions...`);
  console.log('availableChips: ' + availableChips.join(', '));
  for (const multiplierData of multiplierCombinations) {
    const solutions = findChipDistributions(multiplierData, buyIn, smallBlind, playerCount, availableChips);
    allSolutions = allSolutions.concat(solutions);
  }
  console.log(`Generated ${allSolutions.length} valid solutions`);

  // console.log(allSolutions[0]);

  return allSolutions;
}

// Function to find the best solution for a given scenario
export function findBestSolution(solutions: Solution[]) {
  if (solutions.length === 0) {
    return null;
  }

  // Sort by distance to preferred chip count
  solutions.sort((a, b) => Math.abs(a.totalChips - PREFERRED_TOTAL_CHIPS) - Math.abs(b.totalChips - PREFERRED_TOTAL_CHIPS));

  // First try to find solutions with exactly 25 chips and 3 colors
  const threeColorSolutions = solutions.filter(sol =>
    sol.totalChips === PREFERRED_TOTAL_CHIPS &&
    sol.distribution.filter(c => c > 0).length <= 3
  );

  if (threeColorSolutions.length > 0) {
    return threeColorSolutions[0];
  }

  // If no 3-color solutions, try 4-color solutions with 25 chips
  const fourColorSolutions = solutions.filter(sol =>
    sol.totalChips === PREFERRED_TOTAL_CHIPS &&
    sol.distribution.filter(c => c > 0).length === 4
  );

  if (fourColorSolutions.length > 0) {
    return fourColorSolutions[0];
  }

  // If no 4-color solutions, fall back to any solution with 25 chips
  const twentyFiveChipSolutions = solutions.filter(sol =>
    sol.totalChips === PREFERRED_TOTAL_CHIPS
  );

  if (twentyFiveChipSolutions.length > 0) {
    return twentyFiveChipSolutions[0];
  }

  // If no 25-chip solutions, fall back to closest solution
  return solutions[0];
}

// Format solution for display
function formatSolution(solution: Solution) {
  if (!solution) {
    return null;
  }

  const { multipliers, individualMultipliers, chipValues, distribution, totalChips, totalValue } = solution;

  return {
    multipliers: individualMultipliers.map(m => m.toString()),
    chipValues: chipValues.map((v, i) => ({
      color: chipColors[i],
      value: `$${v.toFixed(2)}`,
      multiplier: i > 0 ? `${individualMultipliers[i]}x` : "-"
    })),
    distribution: distribution.map((count, i) => ({
      color: chipColors[i],
      count,
      value: `$${chipValues[i].toFixed(2)}`,
      totalValue: (count * chipValues[i]).toFixed(2)
    })),
    totalChips,
    totalValue: totalValue.toFixed(2),
    smallBlindRatio: distribution[0] / totalChips
  };
}

// Generate multiple solutions for variety
function generateVariedSolutions(solutions: Solution[]) {
  if (solutions.length === 0) return [];

  const varietyOptions = [
    { name: "Standard", preferredChips: 25, requirement: (sol: Solution) => sol.totalChips >= 23 && sol.totalChips <= 27 },
    { name: "Compact", preferredChips: 17, requirement: (sol: Solution) => sol.totalChips <= 20 },
    { name: "More Small Chips", preferredChips: 30, requirement: (sol: Solution) => sol.totalChips >= 28 },
    { name: "Skip Black", preferredChips: 25, requirement: (sol: Solution) => sol.distribution[4] === 0 && sol.distribution[3] > 0 },
    { name: "Three Colors", preferredChips: 25, requirement: (sol: Solution) => sol.distribution.filter(c => c > 0).length === 3 },
  ];

  const variedSolutions: FormattedSolution[] = [];

  // Find best solution for each variety
  for (const variety of varietyOptions) {
    const validSolutions = solutions.filter(variety.requirement);

    if (validSolutions.length > 0) {
      // Sort by distance to preferred chip count
      const sortedSolutions = validSolutions.map(sol => ({
        solution: sol,
        distance: Math.abs(sol.totalChips - variety.preferredChips)
      })).sort((a, b) => a.distance - b.distance);

      // Add the best solution for this variety
      const bestSolution = formatSolution(sortedSolutions[0].solution);
      variedSolutions.push(bestSolution!);
    }
  }

  return variedSolutions;
}