import { AnimatePresence, motion } from 'framer-motion';
import type { GameEvent, GameEventType, GamePhase } from '../../types/game.types';

const ICON_MAP: Record<GameEventType, string> = {
  card_played: '🃏',
  card_revealed: '✨',
  ability_triggered: '⚡',
  card_destroyed: '💥',
  location_revealed: '🗺️',
  card_moved: '↔️',
  power_changed: '💪',
  turn_ended: '⏱️',
  game_ended: '🏆',
};

interface TurnNarratorProps {
  currentEvent: GameEvent | null;
  phase: GamePhase;
}

export function TurnNarrator({ currentEvent, phase }: TurnNarratorProps) {
  const showThinking = phase === 'ai_thinking' && !currentEvent;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 210,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 60,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <AnimatePresence mode="wait">
        {currentEvent ? (
          <motion.div
            key={currentEvent.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
            style={{
              background: 'rgba(15,15,26,0.93)',
              border: '1px solid #3b82f6',
              borderRadius: 9999,
              padding: '6px 16px',
              color: '#e2e8f0',
              fontSize: '0.82rem',
              fontWeight: 500,
              maxWidth: 320,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              boxShadow: '0 0 12px rgba(59,130,246,0.25)',
            }}
          >
            {ICON_MAP[currentEvent.type]} {currentEvent.message}
          </motion.div>
        ) : showThinking ? (
          <motion.div
            key="thinking"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.22 }}
            style={{
              background: 'rgba(15,15,26,0.93)',
              border: '1px solid #6b7280',
              borderRadius: 9999,
              padding: '6px 16px',
              color: '#9ca3af',
              fontSize: '0.82rem',
              fontWeight: 500,
              boxShadow: '0 0 8px rgba(0,0,0,0.4)',
            }}
          >
            🤔 Opponent is thinking…
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
