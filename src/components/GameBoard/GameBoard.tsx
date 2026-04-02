import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useAITurn } from '../../hooks/useAITurn';
import { LocationSlot } from '../Location/LocationSlot';
import { PlayerHand } from '../PlayerHand/PlayerHand';
import { EnergyBar } from '../EnergyBar/EnergyBar';
import { GameLog } from '../GameLog/GameLog';
import { GameOverModal } from '../GameOver/GameOverModal';
import { CardBack } from '../Card/CardBack';

export function GameBoard() {
  useAITurn();

  const { gameState, playCard, removePlay, endPlayerTurn, resetGame } = useGameStore();
  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [hoveredLocationIndex, setHoveredLocationIndex] = useState<number | null>(null);

  const player = gameState.players.player;
  const ai = gameState.players.ai;
  const isPlayerTurn = gameState.phase === 'player_action';

  function handleDrop(locationIndex: number) {
    if (draggingCardId && isPlayerTurn) {
      playCard(draggingCardId, locationIndex);
      setDraggingCardId(null);
    }
    setHoveredLocationIndex(null);
  }

  function handleCardClick(cardId: string) {
    // If already pending, remove it
    if (player.pendingPlays.some((p) => p.cardInstanceId === cardId)) {
      removePlay(cardId);
    }
  }

  const phaseLabel: Record<string, string> = {
    player_action: 'Your Turn',
    ai_thinking: 'Opponent Thinking...',
    revealing: 'Revealing...',
    end_of_turn: 'End of Turn...',
    game_over: 'Game Over',
  };

  return (
    <div
      className="flex flex-col h-full"
      style={{ background: 'var(--bg)', padding: '8px', gap: 6 }}
    >
      {/* Header bar */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">Turn</span>
          <span className="text-white font-bold text-lg">{gameState.turn}/6</span>
        </div>
        <div className="text-center">
          <span
            className="text-sm font-bold px-3 py-1 rounded"
            style={{
              background: isPlayerTurn ? 'rgba(96,165,250,0.15)' : 'rgba(239,68,68,0.12)',
              color: isPlayerTurn ? '#60a5fa' : '#ef4444',
              border: `1px solid ${isPlayerTurn ? '#60a5fa' : '#ef4444'}`,
            }}
          >
            {phaseLabel[gameState.phase] ?? gameState.phase}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">AI hand:</span>
          <div className="flex gap-0.5">
            {ai.hand.map((c) => (
              <CardBack key={c.instanceId} size="sm" />
            ))}
          </div>
        </div>
      </div>

      {/* AI energy bar */}
      <div className="flex justify-end px-2">
        <EnergyBar current={ai.currentEnergy} max={ai.maxEnergy} />
      </div>

      {/* Locations row */}
      <div className="flex gap-2" style={{ flex: 1, minHeight: 0 }}>
        {gameState.locations.map((loc, idx) => (
          <LocationSlot
            key={loc.definitionId}
            locationState={loc}
            locationIndex={idx}
            isDropTarget={hoveredLocationIndex === idx && isPlayerTurn}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setHoveredLocationIndex(idx); }}
            onDragLeave={() => setHoveredLocationIndex(null)}
            onCardClick={handleCardClick}
          />
        ))}

        {/* Game log sidebar */}
        <div style={{ width: 200, flexShrink: 0 }}>
          <GameLog events={gameState.eventLog} />
        </div>
      </div>

      {/* Player hand and controls */}
      <div style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '8px', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-2 px-1">
          <EnergyBar current={player.currentEnergy} max={player.maxEnergy} />
          <div className="text-xs text-gray-500">
            Deck: {player.deck.length} | Hand: {player.hand.length}
          </div>
          <button
            onClick={endPlayerTurn}
            disabled={!isPlayerTurn}
            className="px-5 py-2 rounded-lg font-bold text-sm transition-all"
            style={{
              background: isPlayerTurn ? '#2563eb' : '#374151',
              color: isPlayerTurn ? 'white' : '#6b7280',
              cursor: isPlayerTurn ? 'pointer' : 'not-allowed',
            }}
          >
            End Turn →
          </button>
        </div>

        <PlayerHand
          cards={player.hand}
          pendingPlayIds={player.pendingPlays.map((p) => p.cardInstanceId)}
          draggingCardId={draggingCardId}
          onDragStart={setDraggingCardId}
          onDragEnd={() => setDraggingCardId(null)}
          onCardClick={handleCardClick}
        />

        {player.pendingPlays.length > 0 && (
          <div className="text-xs text-gray-500 text-center mt-1">
            {player.pendingPlays.length} card(s) queued — click to cancel
          </div>
        )}
      </div>

      {gameState.phase === 'game_over' && (
        <GameOverModal winner={gameState.winner} onPlayAgain={resetGame} />
      )}
    </div>
  );
}
