import { useEffect, useRef, useState } from 'react';
import { useGameStore } from '../store/gameStore';
import type { GameEvent, GameEventType } from '../types/game.types';

const DISPLAY_DURATION_MS = 1700;

const SHOWN_TYPES = new Set<GameEventType>([
  'card_played',
  'card_revealed',
  'ability_triggered',
  'card_destroyed',
  'location_revealed',
  'card_moved',
]);

export function useNarratorQueue() {
  const eventLog = useGameStore((s) => s.gameState.eventLog);
  const lastSeenIndex = useRef(0);
  const [queue, setQueue] = useState<GameEvent[]>([]);
  const [currentEvent, setCurrentEvent] = useState<GameEvent | null>(null);

  // Enqueue new events when the log grows
  useEffect(() => {
    const newEvents = eventLog
      .slice(lastSeenIndex.current)
      .filter((e) => SHOWN_TYPES.has(e.type));
    lastSeenIndex.current = eventLog.length;
    if (newEvents.length > 0) {
      setQueue((q) => [...q, ...newEvents]);
    }
  }, [eventLog.length]); // eslint-disable-line react-hooks/exhaustive-deps

  // Drain the queue one event at a time
  useEffect(() => {
    if (queue.length === 0) {
      setCurrentEvent(null);
      return;
    }
    setCurrentEvent(queue[0]);
    const t = setTimeout(() => {
      setQueue((q) => q.slice(1));
    }, DISPLAY_DURATION_MS);
    return () => clearTimeout(t);
  }, [queue]);

  return { currentEvent };
}
