import { useState } from 'react';
import type { World } from '../../types/card.types';
import { ALL_CARDS } from '../../data/cards';
import { useGameStore } from '../../store/gameStore';
import { DECK_SIZE } from '../../data/constants';

interface WorldMeta {
  key: World;
  name: string;
  subtitle: string;
}

const WORLDS: WorldMeta[] = [
  { key: 'roshar',        name: 'Roshar',            subtitle: 'The Stormlight Archive' },
  { key: 'scadrial-era1', name: 'Scadrial Era 1',    subtitle: 'Mistborn' },
  { key: 'scadrial-era2', name: 'Scadrial Era 2',    subtitle: 'Wax & Wayne' },
  { key: 'nalthis',       name: 'Nalthis',           subtitle: 'Warbreaker' },
  { key: 'sel',           name: 'Sel',               subtitle: 'Elantris' },
  { key: 'cosmere-wide',  name: 'Worldhoppers',      subtitle: 'Cosmere-wide' },
];

const cardCountByWorld = new Map<World, number>(
  WORLDS.map((w) => [w.key, ALL_CARDS.filter((c) => c.world === w.key).length])
);

const ALL_WORLD_KEYS: World[] = WORLDS.map((w) => w.key);

export function WorldSelectScreen() {
  const startGame = useGameStore((s) => s.startGame);
  const [selected, setSelected] = useState<Set<World>>(new Set(ALL_WORLD_KEYS));

  const poolSize = ALL_WORLD_KEYS
    .filter((w) => selected.has(w))
    .reduce((sum, w) => sum + (cardCountByWorld.get(w) ?? 0), 0);

  const canStart = poolSize >= DECK_SIZE;

  function toggle(world: World) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(world)) next.delete(world);
      else next.add(world);
      return next;
    });
  }

  function selectAll() { setSelected(new Set(ALL_WORLD_KEYS)); }
  function clearAll() { setSelected(new Set()); }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 py-10"
      style={{ background: '#0f0f1a', color: '#e5e7eb' }}
    >
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-1" style={{ color: '#60a5fa', letterSpacing: '0.05em' }}>
          Cosmere Clash
        </h1>
        <p className="text-gray-400 text-sm">Choose which worlds to include in your game</p>
      </div>

      {/* World grid */}
      <div className="grid gap-3 mb-6 w-full" style={{ maxWidth: 520, gridTemplateColumns: 'repeat(2, 1fr)' }}>
        {WORLDS.map((world) => {
          const isSelected = selected.has(world.key);
          const count = cardCountByWorld.get(world.key) ?? 0;
          return (
            <button
              key={world.key}
              data-world={world.key}
              onClick={() => toggle(world.key)}
              className="relative rounded-xl p-4 text-left transition-all hover:scale-[1.02] focus:outline-none"
              style={{
                background: isSelected
                  ? 'linear-gradient(135deg, var(--world-bg, #1e1e3a) 0%, color-mix(in srgb, var(--world-primary, #3b82f6) 20%, #1a1a2e) 100%)'
                  : 'rgba(255,255,255,0.04)',
                border: isSelected
                  ? '2px solid var(--world-primary, #3b82f6)'
                  : '2px solid rgba(255,255,255,0.08)',
                boxShadow: isSelected
                  ? '0 0 16px color-mix(in srgb, var(--world-primary, #3b82f6) 30%, transparent)'
                  : 'none',
                opacity: isSelected ? 1 : 0.55,
              }}
            >
              {/* Checkmark */}
              {isSelected && (
                <span
                  className="absolute top-2 right-2 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
                  style={{ background: 'var(--world-primary, #3b82f6)', color: '#fff' }}
                >
                  ✓
                </span>
              )}
              <div className="font-bold text-sm mb-0.5" style={{ color: isSelected ? 'var(--world-accent, #93c5fd)' : '#9ca3af' }}>
                {world.name}
              </div>
              <div className="text-xs text-gray-500">{world.subtitle}</div>
              <div className="text-xs mt-2 font-medium" style={{ color: isSelected ? 'var(--world-accent, #93c5fd)' : '#6b7280' }}>
                {count} cards
              </div>
            </button>
          );
        })}
      </div>

      {/* Pool info */}
      <div className="text-sm mb-4 text-center" style={{ color: canStart ? '#9ca3af' : '#f87171' }}>
        {canStart
          ? <>{poolSize} cards in pool</>
          : <>Need at least {DECK_SIZE} cards — currently {poolSize}</>
        }
      </div>

      {/* Controls */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={selectAll}
          className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-105"
          style={{ background: 'rgba(255,255,255,0.07)', color: '#d1d5db', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          Select All
        </button>
        <button
          onClick={clearAll}
          className="px-4 py-1.5 rounded-lg text-sm font-medium transition-all hover:scale-105"
          style={{ background: 'rgba(255,255,255,0.07)', color: '#d1d5db', border: '1px solid rgba(255,255,255,0.12)' }}
        >
          Clear
        </button>
      </div>

      {/* Start button */}
      <button
        onClick={() => canStart && startGame(Array.from(selected))}
        disabled={!canStart}
        className="px-10 py-3 rounded-xl font-bold text-lg transition-all"
        style={{
          background: canStart ? '#2563eb' : 'rgba(255,255,255,0.06)',
          color: canStart ? '#fff' : '#4b5563',
          cursor: canStart ? 'pointer' : 'not-allowed',
          transform: canStart ? undefined : 'none',
          boxShadow: canStart ? '0 0 24px rgba(37,99,235,0.4)' : 'none',
        }}
      >
        Begin
      </button>
    </div>
  );
}
