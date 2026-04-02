import type { CardInstance } from '../../types';
import { CARD_REGISTRY } from '../../data/cards';
import { WorldBadge } from '../shared/WorldBadge';

interface Props {
  card: CardInstance;
  isSelected?: boolean;
  isPending?: boolean;
  onClick?: () => void;
  onDetailClick?: () => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  size?: 'sm' | 'md';
}

export function CardComponent({
  card,
  isSelected,
  isPending,
  onClick,
  onDetailClick,
  onDragStart,
  onDragEnd,
  size = 'md',
}: Props) {
  const def = CARD_REGISTRY.get(card.definitionId);
  if (!def) return null;

  const isSmall = size === 'sm';

  function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    onClick?.();
  }

  function handleContextMenu(e: React.MouseEvent) {
    e.preventDefault();
    onDetailClick?.();
  }

  // Long-press for mobile detail view
  let pressTimer: ReturnType<typeof setTimeout> | null = null;
  function handleTouchStart() {
    pressTimer = setTimeout(() => {
      onDetailClick?.();
    }, 500);
  }
  function handleTouchEnd() {
    if (pressTimer) clearTimeout(pressTimer);
  }

  return (
    <div
      data-world={def.world}
      className={`card select-none relative ${isPending ? 'pending' : ''} ${isSelected ? 'ring-2 ring-blue-400' : ''}`}
      style={{
        width: isSmall ? 68 : 96,
        minHeight: isSmall ? 90 : 126,
        padding: isSmall ? '4px' : '6px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        touchAction: 'manipulation',
      }}
      draggable={!!onDragStart}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchEnd}
    >
      {/* Cost */}
      <div className="flex justify-between items-start">
        <span
          className="font-bold text-white rounded-full flex items-center justify-center text-xs"
          style={{
            width: 18, height: 18,
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid var(--world-accent)',
            flexShrink: 0,
          }}
        >
          {def.cost}
        </span>
        {!isSmall && <WorldBadge world={def.world} />}
      </div>

      {/* Name */}
      <div
        className="text-center"
        style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '2px 0' }}
      >
        <div
          className="font-bold leading-tight text-center"
          style={{ color: 'var(--world-accent)', fontSize: isSmall ? '0.58rem' : '0.72rem' }}
        >
          {def.name}
        </div>
        {!isSmall && def.abilityText !== 'No ability.' && (
          <div className="text-gray-300 mt-1 leading-tight text-center" style={{ fontSize: '0.58rem' }}>
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
            fontSize: isSmall ? '0.82rem' : '1rem',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          {card.currentPower}
        </span>
      </div>

      {/* Detail hint on small cards */}
      {isSmall && onDetailClick && (
        <div
          className="absolute bottom-0.5 left-0 right-0 text-center"
          style={{ fontSize: '0.45rem', color: 'rgba(255,255,255,0.25)', pointerEvents: 'none' }}
        >
          hold
        </div>
      )}
    </div>
  );
}
