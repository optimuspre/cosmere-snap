import { LOCATION_REGISTRY } from '../../data/locations';
import { useHistoryStore } from '../../store/historyStore';
import type { LocationState } from '../../types/location.types';
import type { PlayerId } from '../../types';

interface Props {
  winner: PlayerId | 'tie' | null;
  locations: LocationState[];
  onPlayAgain: () => void;
  onViewBoard: () => void;
}

export function GameOverModal({ winner, locations, onPlayAgain, onViewBoard }: Props) {
  const results = useHistoryStore((s) => s.results);
  const wins   = results.filter((r) => r.result === 'win').length;
  const losses = results.filter((r) => r.result === 'loss').length;
  const ties   = results.filter((r) => r.result === 'tie').length;

  const title =
    winner === 'player' ? 'Victory!' : winner === 'ai' ? 'Defeated' : 'Draw';
  const subtitle =
    winner === 'player'
      ? 'The Cosmere bends to your will.'
      : winner === 'ai'
      ? 'The darkness wins this day.'
      : 'Honor and Odium stand equal.';
  const accentColor = winner === 'player' ? '#60a5fa' : winner === 'ai' ? '#ef4444' : '#9ca3af';

  const playerTotal = locations.reduce((s, l) => s + l.powerTotals.player, 0);
  const aiTotal = locations.reduce((s, l) => s + l.powerTotals.ai, 0);
  const playerLocWins = locations.filter((l) => l.winner === 'player').length;
  const aiLocWins = locations.filter((l) => l.winner === 'ai').length;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0,0,0,0.80)' }}
    >
      <div
        className="rounded-2xl text-center flex flex-col gap-4"
        style={{
          background: '#1a1a2e',
          border: `2px solid ${accentColor}`,
          boxShadow: `0 0 40px ${accentColor}44`,
          minWidth: 300,
          maxWidth: 420,
          width: '92vw',
          padding: '28px 24px 24px',
        }}
      >
        {/* Header */}
        <div>
          <div className="text-4xl font-bold mb-1" style={{ color: accentColor }}>
            {title}
          </div>
          <div className="text-gray-400 text-sm">{subtitle}</div>
          {results.length > 0 && (
            <div className="text-xs mt-2" style={{ color: '#6b7280' }}>
              Record:{' '}
              <span style={{ color: '#60a5fa', fontWeight: 600 }}>{wins}W</span>
              {' · '}
              <span style={{ color: '#ef4444', fontWeight: 600 }}>{losses}L</span>
              {' · '}
              <span style={{ color: '#9ca3af', fontWeight: 600 }}>{ties}T</span>
            </div>
          )}
        </div>

        {/* Location breakdown */}
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.08)' }}
        >
          {/* Column headers */}
          <div
            className="grid text-xs font-bold text-gray-500 px-3 py-1.5"
            style={{ gridTemplateColumns: '1fr auto auto auto', gap: '6px', background: 'rgba(255,255,255,0.04)' }}
          >
            <span className="text-left">Location</span>
            <span style={{ minWidth: 32, textAlign: 'right' }}>You</span>
            <span style={{ minWidth: 12, textAlign: 'center' }}></span>
            <span style={{ minWidth: 32, textAlign: 'left' }}>AI</span>
          </div>

          {locations.map((loc) => {
            const def = LOCATION_REGISTRY.get(loc.definitionId);
            const locName = def?.name ?? loc.definitionId;
            const locWinner = loc.winner;
            const rowBg =
              locWinner === 'player'
                ? 'rgba(96,165,250,0.07)'
                : locWinner === 'ai'
                ? 'rgba(239,68,68,0.07)'
                : 'transparent';
            const playerBold = locWinner === 'player';
            const aiBold = locWinner === 'ai';
            const winnerDot =
              locWinner === 'player' ? '◀' : locWinner === 'ai' ? '▶' : '—';
            const dotColor =
              locWinner === 'player' ? '#60a5fa' : locWinner === 'ai' ? '#ef4444' : '#6b7280';

            return (
              <div
                key={loc.definitionId}
                className="grid items-center px-3 py-2 text-sm"
                style={{
                  gridTemplateColumns: '1fr auto auto auto',
                  gap: '6px',
                  background: rowBg,
                  borderTop: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <span className="text-left text-gray-300 text-xs truncate">{locName}</span>
                <span
                  style={{
                    minWidth: 32,
                    textAlign: 'right',
                    fontWeight: playerBold ? 700 : 400,
                    color: playerBold ? '#60a5fa' : '#d1d5db',
                  }}
                >
                  {loc.powerTotals.player}
                </span>
                <span style={{ minWidth: 12, textAlign: 'center', color: dotColor, fontSize: '0.7rem' }}>
                  {winnerDot}
                </span>
                <span
                  style={{
                    minWidth: 32,
                    textAlign: 'left',
                    fontWeight: aiBold ? 700 : 400,
                    color: aiBold ? '#ef4444' : '#d1d5db',
                  }}
                >
                  {loc.powerTotals.ai}
                </span>
              </div>
            );
          })}

          {/* Totals row */}
          <div
            className="grid items-center px-3 py-2 text-sm"
            style={{
              gridTemplateColumns: '1fr auto auto auto',
              gap: '6px',
              borderTop: '1px solid rgba(255,255,255,0.12)',
              background: 'rgba(255,255,255,0.04)',
            }}
          >
            <span className="text-left text-gray-500 text-xs font-bold">Total</span>
            <span
              style={{
                minWidth: 32,
                textAlign: 'right',
                fontWeight: 700,
                color: playerTotal >= aiTotal ? '#60a5fa' : '#9ca3af',
              }}
            >
              {playerTotal}
            </span>
            <span style={{ minWidth: 12 }} />
            <span
              style={{
                minWidth: 32,
                textAlign: 'left',
                fontWeight: 700,
                color: aiTotal >= playerTotal ? '#ef4444' : '#9ca3af',
              }}
            >
              {aiTotal}
            </span>
          </div>
        </div>

        {/* Locations won summary */}
        <div className="text-sm text-gray-400">
          You won{' '}
          <span style={{ color: '#60a5fa', fontWeight: 700 }}>{playerLocWins}</span>
          {' / 3 locations · AI won '}
          <span style={{ color: '#ef4444', fontWeight: 700 }}>{aiLocWins}</span>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onViewBoard}
            className="flex-1 px-4 py-2.5 rounded-lg font-bold text-sm transition-all hover:scale-105"
            style={{
              background: 'rgba(255,255,255,0.07)',
              color: '#d1d5db',
              border: '1px solid rgba(255,255,255,0.12)',
            }}
          >
            View Board
          </button>
          <button
            onClick={onPlayAgain}
            className="flex-1 px-4 py-2.5 rounded-lg font-bold text-sm transition-all hover:scale-105"
            style={{ background: accentColor, color: '#0f0f1a' }}
          >
            New Game
          </button>
        </div>
      </div>
    </div>
  );
}
