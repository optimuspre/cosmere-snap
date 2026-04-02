import type { LocationState } from '../../types';
import { LOCATION_REGISTRY } from '../../data/locations';
import { CardComponent } from '../Card/CardComponent';
import { CardBack } from '../Card/CardBack';

interface Props {
  locationState: LocationState;
  locationIndex: number;
  isDropTarget: boolean;
  onDrop: (locationIndex: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onCardClick?: (cardInstanceId: string) => void;
}

export function LocationSlot({
  locationState,
  locationIndex,
  isDropTarget,
  onDrop,
  onDragOver,
  onDragLeave,
  onCardClick,
}: Props) {
  const locDef = LOCATION_REGISTRY.get(locationState.definitionId);

  const winnerClass =
    locationState.winner === 'player'
      ? 'winner-glow-player'
      : locationState.winner === 'ai'
      ? 'winner-glow-ai'
      : '';

  return (
    <div
      className={`location-slot flex flex-col ${isDropTarget ? 'drop-target' : ''} ${winnerClass} ${locationState.isRevealed ? 'location-reveal' : ''}`}
      style={{ flex: 1, minWidth: 0 }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={() => onDrop(locationIndex)}
    >
      {/* Location header */}
      <div
        className="text-center p-2 border-b"
        style={{ borderColor: 'var(--border)', minHeight: 72 }}
      >
        {locationState.isRevealed && locDef ? (
          <>
            <div className="font-bold text-sm text-white leading-tight">{locDef.name}</div>
            <div className="text-xs text-gray-400 mt-0.5 leading-tight">{locDef.effectText}</div>
          </>
        ) : (
          <div className="text-gray-600 text-xs mt-2">Unrevealed</div>
        )}
      </div>

      {/* Power totals */}
      <div className="flex justify-between px-3 py-1 text-sm font-bold">
        <span className="text-blue-400">{locationState.powerTotals.player}</span>
        <span className="text-gray-500 text-xs">vs</span>
        <span className="text-red-400">{locationState.powerTotals.ai}</span>
      </div>

      {/* AI cards (top) */}
      <div className="flex flex-wrap gap-1 justify-center p-1" style={{ minHeight: 60 }}>
        {locationState.cards.ai.map((card) =>
          card.isRevealed ? (
            <CardComponent key={card.instanceId} card={card} size="sm" />
          ) : (
            <CardBack key={card.instanceId} size="sm" />
          )
        )}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--border)', margin: '0 8px' }} />

      {/* Player cards (bottom) */}
      <div
        className="flex flex-wrap gap-1 justify-center p-1"
        style={{ minHeight: 60, flex: 1 }}
        onDrop={() => onDrop(locationIndex)}
      >
        {locationState.cards.player.map((card) => (
          <CardComponent
            key={card.instanceId}
            card={card}
            size="sm"
            onClick={() => onCardClick?.(card.instanceId)}
          />
        ))}
      </div>
    </div>
  );
}
