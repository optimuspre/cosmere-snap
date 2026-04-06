import { useState } from 'react';
import type { World } from '../../types/card.types';
import { ALL_CARDS } from '../../data/cards';
import { useGameStore } from '../../store/gameStore';
import { useHistoryStore } from '../../store/historyStore';
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

const WORLD_LABELS: Record<World, string> = {
  'roshar': 'Roshar',
  'scadrial-era1': 'Scadrial I',
  'scadrial-era2': 'Scadrial II',
  'nalthis': 'Nalthis',
  'sel': 'Sel',
  'cosmere-wide': 'Cosmere',
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export function WorldSelectScreen() {
  const startGame = useGameStore((s) => s.startGame);
  const { results, clearHistory } = useHistoryStore();
  const [selected, setSelected] = useState<Set<World>>(new Set(ALL_WORLD_KEYS));
  const [showHistory, setShowHistory] = useState(false);

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

      {/* Win/Loss History */}
      {results.length > 0 && (
        <div className="w-full mb-6" style={{ maxWidth: 520 }}>
          {/* Stats row + toggle */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex gap-4 text-sm font-semibold">
              <span style={{ color: '#60a5fa' }}>{results.filter(r => r.result === 'win').length}W</span>
              <span style={{ color: '#ef4444' }}>{results.filter(r => r.result === 'loss').length}L</span>
              <span style={{ color: '#9ca3af' }}>{results.filter(r => r.result === 'tie').length}T</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowHistory((v) => !v)}
                className="text-xs font-medium"
                style={{ color: '#6b7280' }}
              >
                History {showHistory ? '▴' : '▾'}
              </button>
              <button
                onClick={clearHistory}
                className="text-xs"
                style={{ color: '#4b5563' }}
              >
                Clear
              </button>
            </div>
          </div>

          {/* Expandable history list */}
          {showHistory && (
            <div
              className="rounded-xl overflow-hidden"
              style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}
            >
              {results.slice(0, 10).map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between px-3 py-2 text-xs"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
                >
                  <span
                    className="font-bold px-2 py-0.5 rounded-full"
                    style={{
                      background: r.result === 'win' ? 'rgba(96,165,250,0.15)' : r.result === 'loss' ? 'rgba(239,68,68,0.15)' : 'rgba(156,163,175,0.15)',
                      color: r.result === 'win' ? '#60a5fa' : r.result === 'loss' ? '#ef4444' : '#9ca3af',
                      minWidth: 36,
                      textAlign: 'center',
                    }}
                  >
                    {r.result === 'win' ? 'Win' : r.result === 'loss' ? 'Loss' : 'Tie'}
                  </span>
                  <span className="text-gray-500 flex-1 mx-3 truncate">
                    {r.worlds.map((w) => WORLD_LABELS[w]).join(', ')}
                  </span>
                  <span style={{ color: '#4b5563' }}>{formatDate(r.date)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

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
