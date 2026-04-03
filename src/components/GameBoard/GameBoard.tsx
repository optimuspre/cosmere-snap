import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useAITurn } from '../../hooks/useAITurn';
import { LocationSlot } from '../Location/LocationSlot';
import { PlayerHand } from '../PlayerHand/PlayerHand';
import { EnergyBar } from '../EnergyBar/EnergyBar';
import { GameLog } from '../GameLog/GameLog';
import { GameOverModal } from '../GameOver/GameOverModal';
import { CardDetailModal } from '../Card/CardDetailModal';
import { CardComponent } from '../Card/CardComponent';
import { CardBack } from '../Card/CardBack';
import type { CardInstance } from '../../types';

export function GameBoard() {
  useAITurn();

  const { gameState, playCard, removePlay, endPlayerTurn, resetGame, resolveCardTarget } = useGameStore();

  const [draggingCardId, setDraggingCardId] = useState<string | null>(null);
  const [hoveredLocationIndex, setHoveredLocationIndex] = useState<number | null>(null);
  const [selectedHandCardId, setSelectedHandCardId] = useState<string | null>(null);
  const [detailCard, setDetailCard] = useState<CardInstance | null>(null);
  const [showLog, setShowLog] = useState(false);

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

  function handleLocationTap(locationIndex: number) {
    if (!isPlayerTurn || !selectedHandCardId) return;
    playCard(selectedHandCardId, locationIndex);
    setSelectedHandCardId(null);
  }

  function handleHandCardTap(cardId: string) {
    if (!isPlayerTurn) return;
    // If already pending, cancel it
    if (player.pendingPlays.some((p) => p.cardInstanceId === cardId)) {
      removePlay(cardId);
      return;
    }
    // Toggle selection for tap-to-play
    setSelectedHandCardId((prev) => (prev === cardId ? null : cardId));
  }

  function handleBoardCardClick(card: CardInstance) {
    setDetailCard(card);
  }

  const phaseLabel: Record<string, string> = {
    player_action: 'Your Turn',
    ai_thinking: 'Thinking...',
    revealing: 'Revealing...',
    end_of_turn: 'Resolving...',
    game_over: 'Game Over',
  };

  const aiHandCount = ai.hand.length;

  return (
    <div
      className="flex flex-col"
      style={{ height: '100dvh', background: 'var(--bg)', padding: '6px', gap: 4, overflow: 'hidden' }}
    >
      {/* ── Header bar ── */}
      <div className="flex items-center justify-between px-1 flex-shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-white font-bold">T{gameState.turn}/6</span>
          <span
            className="text-xs font-bold px-2 py-0.5 rounded"
            style={{
              background: isPlayerTurn ? 'rgba(96,165,250,0.15)' : 'rgba(239,68,68,0.10)',
              color: isPlayerTurn ? '#60a5fa' : '#ef4444',
              border: `1px solid ${isPlayerTurn ? '#3b82f6' : '#dc2626'}`,
            }}
          >
            {phaseLabel[gameState.phase] ?? gameState.phase}
          </span>
        </div>

        {/* AI hand count */}
        <div className="flex items-center gap-1">
          <span className="text-xs text-gray-600">AI:</span>
          <div className="flex gap-0.5">
            {Array.from({ length: Math.min(aiHandCount, 7) }).map((_, i) => (
              <CardBack key={i} size="sm" />
            ))}
          </div>
          <span className="text-xs text-gray-600 ml-0.5">{aiHandCount}</span>
        </div>

        {/* Log toggle */}
        <button
          onClick={() => setShowLog((v) => !v)}
          className="text-gray-400 hover:text-white text-lg px-2 py-0.5 rounded"
          style={{ background: showLog ? 'rgba(255,255,255,0.08)' : 'transparent', border: '1px solid var(--border)' }}
          title="Event log"
        >
          📋
        </button>
      </div>

      {/* ── AI energy ── */}
      <div className="flex justify-end px-1 flex-shrink-0">
        <EnergyBar current={ai.currentEnergy} max={ai.maxEnergy} />
      </div>

      {/* ── Locations row ── */}
      <div className="flex gap-1.5 flex-shrink-0" style={{ flex: '1 1 0', minHeight: 0 }}>
        {gameState.locations.map((loc, idx) => (
          <LocationSlot
            key={loc.definitionId}
            locationState={loc}
            locationIndex={idx}
            isDropTarget={hoveredLocationIndex === idx && isPlayerTurn && !!draggingCardId}
            selectedHandCardId={selectedHandCardId}
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setHoveredLocationIndex(idx); }}
            onDragLeave={() => setHoveredLocationIndex(null)}
            onTap={handleLocationTap}
            onBoardCardClick={handleBoardCardClick}
          />
        ))}
      </div>

      {/* ── Player controls ── */}
      <div
        className="flex-shrink-0"
        style={{ background: 'rgba(0,0,0,0.25)', borderRadius: 10, padding: '6px 6px 8px', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between mb-2 px-1">
          <EnergyBar current={player.currentEnergy} max={player.maxEnergy} />
          <span className="text-xs text-gray-600">{player.deck.length} left</span>
          <button
            onClick={endPlayerTurn}
            disabled={!isPlayerTurn}
            className="font-bold text-sm rounded-lg px-4 py-1.5 transition-all"
            style={{
              background: isPlayerTurn ? '#2563eb' : '#374151',
              color: isPlayerTurn ? 'white' : '#6b7280',
              cursor: isPlayerTurn ? 'pointer' : 'not-allowed',
              touchAction: 'manipulation',
            }}
          >
            End Turn →
          </button>
        </div>

        <PlayerHand
          cards={player.hand}
          pendingPlayIds={player.pendingPlays.map((p) => p.cardInstanceId)}
          selectedHandCardId={selectedHandCardId}
          draggingCardId={draggingCardId}
          onDragStart={setDraggingCardId}
          onDragEnd={() => setDraggingCardId(null)}
          onCardTap={handleHandCardTap}
          onCardDetailClick={setDetailCard}
        />

        {selectedHandCardId && isPlayerTurn && (
          <div className="text-xs text-blue-400 text-center mt-1.5">
            Tap a location to play · tap card again to cancel
          </div>
        )}
        {player.pendingPlays.length > 0 && !selectedHandCardId && (
          <div className="text-xs text-gray-500 text-center mt-1">
            {player.pendingPlays.length} queued — tap to cancel
          </div>
        )}
      </div>

      {/* ── Log overlay ── */}
      {showLog && (
        <div
          className="fixed inset-0 z-40 flex items-end justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setShowLog(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl p-3"
            style={{ background: '#1a1a2e', border: '1px solid var(--border)', maxHeight: '60dvh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-bold text-gray-300">Event Log</span>
              <button onClick={() => setShowLog(false)} className="text-gray-500 hover:text-white">✕</button>
            </div>
            <GameLog events={gameState.eventLog} expanded />
          </div>
        </div>
      )}

      {/* ── Card detail modal ── */}
      {detailCard && (
        <CardDetailModal card={detailCard} onClose={() => setDetailCard(null)} />
      )}

      {/* ── Cultivation card-target picker ── */}
      {gameState.pendingTargetSelection?.type === 'card' && gameState.pendingTargetSelection.playerId === 'player' && (() => {
        const allPlayerCards = gameState.locations.flatMap((loc) =>
          loc.cards.player.filter((c) => !c.isDestroyed && c.instanceId !== gameState.pendingTargetSelection!.cardInstanceId)
        );
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.75)' }}
          >
            <div
              className="rounded-xl p-4 flex flex-col gap-3"
              style={{ background: '#1a1a2e', border: '1px solid var(--border)', maxWidth: 320, width: '90%' }}
            >
              <div className="text-center">
                <div className="text-white font-bold text-sm mb-1">Cultivation</div>
                <div className="text-gray-400 text-xs">Choose a friendly card to permanently gain +3 Power</div>
              </div>
              <div className="flex flex-wrap gap-2 justify-center">
                {allPlayerCards.map((card) => (
                  <div
                    key={card.instanceId}
                    onClick={() => resolveCardTarget(card.instanceId)}
                    style={{ cursor: 'pointer' }}
                  >
                    <CardComponent card={card} size="md" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ── Game over ── */}
      {gameState.phase === 'game_over' && (
        <GameOverModal winner={gameState.winner} onPlayAgain={resetGame} />
      )}
    </div>
  );
}
