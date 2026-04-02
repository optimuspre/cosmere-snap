import type { CardInstance } from '../../types';
import { CARD_REGISTRY } from '../../data/cards';
import { WorldBadge } from '../shared/WorldBadge';

interface Props {
  card: CardInstance;
  isSelected?: boolean;
  isPending?: boolean;
  onClick?: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  size?: 'sm' | 'md';
}

export function CardComponent({ card, isSelected, isPending, onClick, onDragStart, onDragEnd, size = 'md' }: Props) {
  const def = CARD_REGISTRY.get(card.definitionId);
  if (!def) return null;

  const isSmall = size === 'sm';

  return (
    <div
      data-world={def.world}
      className={`card select-none relative ${isPending ? 'pending' : ''} ${isSelected ? 'ring-2 ring-blue-400' : ''}`}
      style={{
        width: isSmall ? 72 : 100,
        minHeight: isSmall ? 96 : 130,
        padding: isSmall ? '4px' : '6px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
      draggable={!!onDragStart}
      onClick={onClick}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      {/* Cost */}
      <div className="flex justify-between items-start">
        <span
          className="font-bold text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
          style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid var(--world-accent)' }}
        >
          {def.cost}
        </span>
        {!isSmall && <WorldBadge world={def.world} />}
      </div>

      {/* Name */}
      <div className="text-center" style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2px 0' }}>
        <div
          className="font-bold leading-tight text-center"
          style={{ color: 'var(--world-accent)', fontSize: isSmall ? '0.6rem' : '0.72rem' }}
        >
          {def.name}
        </div>
        {!isSmall && def.abilityText !== 'No ability.' && (
          <div className="text-gray-300 mt-1 leading-tight text-center" style={{ fontSize: '0.6rem' }}>
            {def.abilityText}
          </div>
        )}
      </div>

      {/* Power */}
      <div className="flex justify-end">
        <span
          className="font-bold rounded text-white px-1"
          style={{
            background: 'rgba(0,0,0,0.5)',
            fontSize: isSmall ? '0.85rem' : '1rem',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          {card.currentPower}
        </span>
      </div>
    </div>
  );
}
