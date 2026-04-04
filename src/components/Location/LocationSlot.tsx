import type { LocationState, CardInstance } from '../../types';
import { LOCATION_REGISTRY } from '../../data/locations';
import { CardComponent } from '../Card/CardComponent';
import { CardBack } from '../Card/CardBack';
import { useIsMobile } from '../../hooks/useIsMobile';

interface Props {
  locationState: LocationState;
  locationIndex: number;
  isDropTarget: boolean;
  selectedHandCardId: string | null;
  onDrop: (locationIndex: number) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onTap: (locationIndex: number) => void;
  onBoardCardClick: (card: CardInstance) => void;
}

export function LocationSlot({
  locationState,
  locationIndex,
  isDropTarget,
  selectedHandCardId,
  onDrop,
  onDragOver,
  onDragLeave,
  onTap,
  onBoardCardClick,
}: Props) {
  const isMobile = useIsMobile();
  const locDef = LOCATION_REGISTRY.get(locationState.definitionId);

  const winnerClass =
    locationState.winner === 'player'
      ? 'winner-glow-player'
      : locationState.winner === 'ai'
      ? 'winner-glow-ai'
      : '';

  const isTapTarget = !!selectedHandCardId && locationState.isRevealed;

  return (
    <div
      className={`location-slot flex flex-col ${isDropTarget || isTapTarget ? 'drop-target' : ''} ${winnerClass} ${locationState.isRevealed ? 'location-reveal' : ''}`}
      style={{ flex: 1, minWidth: 0, cursor: isTapTarget ? 'pointer' : 'default' }}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={() => onDrop(locationIndex)}
      onClick={() => isTapTarget && onTap(locationIndex)}
    >
      {/* Location header */}
      <div
        className="text-center px-1 py-1 border-b"
        style={{ borderColor: 'var(--border)', minHeight: isMobile ? 52 : 56 }}
      >
        {locationState.isRevealed && locDef ? (
          <>
            <div className="font-bold text-white leading-tight" style={{ fontSize: isMobile ? '0.6rem' : '0.75rem' }}>{locDef.name}</div>
            <div className="text-gray-400 mt-0.5 leading-tight" style={{ fontSize: isMobile ? '0.5rem' : '0.58rem' }}>{locDef.effectText}</div>
          </>
        ) : (
          <div className="text-gray-600 text-xs mt-2">?</div>
        )}
      </div>

      {/* Power totals */}
      <div className="flex justify-between px-2 py-0.5 text-xs font-bold">
        <span className="text-blue-400">{locationState.powerTotals.player}</span>
        <span className="text-gray-600">·</span>
        <span className="text-red-400">{locationState.powerTotals.ai}</span>
      </div>

      {/* AI cards (top) */}
      <div className="flex flex-wrap gap-0.5 justify-center p-1" style={{ minHeight: isMobile ? 20 : 48 }}>
        {locationState.cards.ai.map((card) =>
          card.isRevealed ? (
            <CardComponent
              key={card.instanceId}
              card={card}
              size={isMobile ? 'xxs' : 'sm'}
              onClick={() => onBoardCardClick(card)}
            />
          ) : (
            <CardBack key={card.instanceId} size="sm" />
          )
        )}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'var(--border)', margin: '0 6px' }} />

      {/* Player cards (bottom) */}
      <div
        className="flex flex-wrap gap-0.5 justify-center p-1"
        style={{ minHeight: isMobile ? 20 : 48, flex: 1, alignContent: 'flex-start' }}
        onDrop={() => onDrop(locationIndex)}
      >
        {locationState.cards.player.map((card) => (
          <CardComponent
            key={card.instanceId}
            card={card}
            size={isMobile ? 'xxs' : 'sm'}
            onClick={() => onBoardCardClick(card)}
          />
        ))}
      </div>
    </div>
  );
}
