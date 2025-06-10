import React, { useMemo } from 'react';
import { Stack } from 'expo-router';
import { useGameContext } from '@/context/GameContext';

// Import your game phase components
import SetupGameComponent from '@/components/game/SetupGameComponent';
import GameInProgressComponent from '@/components/game/InProgressGameComponent';
import TallyUpComponent from '@/components/game/TallyAmountsComponent';
import SettleUpComponent from '@/components/game/SettleDebtComponent';

export default function GameIndex() {
  const { gameState } = useGameContext();

  const headerTitle = useMemo(() => {
    switch (gameState.gamePhase) {
      case 'setup':
        return 'Setup Game';
      case 'inprogress':
        return 'Game in Progress';
      case 'tallyup':
        return 'Tally Up Results';
      case 'settle':
        return 'Settle Up';
      default:
        return 'Poker Game';
    }
  }, [gameState.gamePhase]);

  const CurrentComponent = useMemo(() => {
    console.log('[GameIndex] Current game phase:', gameState.gamePhase);
    switch (gameState.gamePhase) {
      case 'setup':
        return SetupGameComponent;
      case 'inprogress':
        return GameInProgressComponent;
      case 'tallyup':
        return TallyUpComponent;
      case 'settle':
        return SettleUpComponent;
      default:
        return SetupGameComponent;
    }
  }, [gameState.gamePhase]);

  return (
    <CurrentComponent key={gameState.gamePhase} />
  );
}