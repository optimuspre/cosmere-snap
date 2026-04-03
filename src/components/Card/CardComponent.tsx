import { useState } from 'react';
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
  const [isHovered, setIsHovered] = useState(false);

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
      className={`card select-none relative ${isPending ? 'pending' : ''} ${isSelected ? 'ring-2 ring-blue-400 selected' : ''}`}
      style={{
        width: isSmall ? 136 : 192,
        height: isSmall ? 180 : 252,
        padding: isSmall ? '8px' : '10px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        touchAction: 'manipulation',
        overflow: 'hidden',
        flexShrink: 0,
      }}
      draggable={!!onDragStart}
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchMove={handleTouchEnd}
    >
      {/* Cost */}
      <div className="flex justify-between items-start">
        <span
          className="font-bold text-white rounded-full flex items-center justify-center"
          style={{
            width: isSmall ? 22 : 28, height: isSmall ? 22 : 28,
            fontSize: isSmall ? '0.75rem' : '0.9rem',
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid var(--world-accent)',
            flexShrink: 0,
          }}
        >
          {def.cost}
        </span>
        <WorldBadge world={def.world} />
      </div>

      {/* Name */}
      <div
        className="text-center"
        style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '4px 0' }}
      >
        <div
          className="font-bold leading-tight text-center"
          style={{ color: 'var(--world-accent)', fontSize: isSmall ? '0.75rem' : '0.95rem' }}
        >
          {def.name}
        </div>
      </div>

      {/* Flavor text */}
      {def.flavorText && (
        <div
          className="italic text-center leading-tight"
          style={{
            color: 'rgba(255,255,255,0.45)',
            fontSize: isSmall ? '0.55rem' : '0.65rem',
            padding: '0 2px 4px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: 4,
          }}
        >
          {def.flavorText}
        </div>
      )}

      {/* Power */}
      <div className="flex justify-end">
        <span
          className="font-bold rounded text-white px-1"
          style={{
            background: 'rgba(0,0,0,0.5)',
            fontSize: isSmall ? '1rem' : '1.25rem',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          {card.currentPower}
        </span>
      </div>

      {/* Ability/flavor overlay — shown on hover or when selected */}
      {(def.abilityText !== 'No ability.' || def.flavorText) && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: isSmall ? '4px' : '6px',
            background: 'rgba(0,0,0,0.82)',
            borderRadius: 8,
            opacity: isHovered || isSelected ? 1 : 0,
            transition: 'opacity 0.15s ease',
            pointerEvents: 'none',
          }}
        >
          <div
            className="text-center leading-tight text-gray-100"
            style={{ fontSize: isSmall ? '0.7rem' : '0.85rem' }}
          >
            {def.abilityText !== 'No ability.' ? def.abilityText : (
              <span className="italic text-gray-400">{def.flavorText}</span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
