import type { PlayerId } from '../../types';

interface Props {
  winner: PlayerId | 'tie' | null;
  onPlayAgain: () => void;
}

export function GameOverModal({ winner, onPlayAgain }: Props) {
  const title =
    winner === 'player' ? '⚔ Victory!' : winner === 'ai' ? '💀 Defeated' : '⚖ Draw';
  const subtitle =
    winner === 'player'
      ? 'The Cosmere bends to your will.'
      : winner === 'ai'
      ? 'The darkness wins this day.'
      : 'Honor and Odium stand equal.';
  const color = winner === 'player' ? '#60a5fa' : winner === 'ai' ? '#ef4444' : '#9ca3af';

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50"
      style={{ background: 'rgba(0,0,0,0.75)' }}
    >
      <div
        className="rounded-2xl p-10 text-center"
        style={{
          background: '#1a1a2e',
          border: `2px solid ${color}`,
          boxShadow: `0 0 40px ${color}44`,
          minWidth: 320,
        }}
      >
        <div className="text-5xl font-bold mb-3" style={{ color }}>
          {title}
        </div>
        <div className="text-gray-300 mb-8 text-lg">{subtitle}</div>
        <button
          onClick={onPlayAgain}
          className="px-8 py-3 rounded-lg font-bold text-white transition-all hover:scale-105"
          style={{ background: color, color: '#0f0f1a' }}
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
