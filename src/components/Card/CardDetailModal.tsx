import type { CardInstance } from '../../types';
import { CARD_REGISTRY } from '../../data/cards';
import { WorldBadge } from '../shared/WorldBadge';

interface Props {
  card: CardInstance;
  onClose: () => void;
}

export function CardDetailModal({ card, onClose }: Props) {
  const def = CARD_REGISTRY.get(card.definitionId);
  if (!def) return null;

  const powerChanged = card.currentPower !== def.basePower;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
      onClick={onClose}
    >
      <div
        data-world={def.world}
        className="card relative flex flex-col gap-3 w-full max-w-xs"
        style={{ padding: '20px', cursor: 'default', minHeight: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-white text-lg leading-none"
          style={{ background: 'none', border: 'none', cursor: 'pointer', lineHeight: 1 }}
        >
          ✕
        </button>

        {/* Header row */}
        <div className="flex items-start justify-between gap-2 pr-6">
          <div>
            <div className="font-bold text-base leading-tight" style={{ color: 'var(--world-accent)' }}>
              {def.name}
            </div>
            <div className="mt-1">
              <WorldBadge world={def.world} />
            </div>
          </div>
          {/* Cost badge */}
          <div
            className="font-bold text-lg rounded-full w-9 h-9 flex items-center justify-center flex-shrink-0"
            style={{ background: 'rgba(0,0,0,0.5)', border: '2px solid var(--world-accent)', color: 'var(--world-accent)' }}
          >
            {def.cost}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--world-accent)', opacity: 0.2 }} />

        {/* Ability */}
        {def.abilityText !== 'No ability.' && (
          <div
            className="text-sm leading-snug text-gray-200 rounded p-2"
            style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.08)' }}
          >
            {def.abilityText}
          </div>
        )}

        {/* Tags */}
        {def.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {def.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs px-1.5 py-0.5 rounded"
                style={{ background: 'rgba(255,255,255,0.08)', color: '#9ca3af', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Flavor text */}
        {def.flavorText && (
          <div className="text-xs text-gray-500 italic leading-snug">
            "{def.flavorText}"
          </div>
        )}

        {/* Power */}
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs text-gray-500">Power</span>
          <div className="flex items-center gap-2">
            {powerChanged && (
              <span className="text-xs text-gray-600 line-through">{def.basePower}</span>
            )}
            <span
              className="font-bold text-2xl"
              style={{ color: powerChanged ? (card.currentPower > def.basePower ? '#4ade80' : '#f87171') : 'white' }}
            >
              {card.currentPower}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
