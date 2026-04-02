import { useEffect } from 'react';
import { useGameStore } from '../store/gameStore';

export function useAITurn() {
  const { gameState, runRevealAndEndTurn } = useGameStore();

  useEffect(() => {
    if (gameState.phase !== 'ai_thinking') return;
    const timeout = setTimeout(() => {
      runRevealAndEndTurn();
    }, 900);
    return () => clearTimeout(timeout);
  }, [gameState.phase, runRevealAndEndTurn]);
}
