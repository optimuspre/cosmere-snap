import type { GameEvent } from '../../types';

interface Props {
  events: GameEvent[];
  expanded?: boolean;
}

export function GameLog({ events, expanded }: Props) {
  const limit = expanded ? 50 : 8;
  const recent = [...events].reverse().slice(0, limit);
  return (
    <div>
      {recent.length === 0 && <div className="text-xs text-gray-600 py-1">No events yet.</div>}
      {recent.map((evt) => (
        <div key={evt.id} className="text-xs text-gray-400 leading-snug mb-1">
          <span className="text-gray-600">T{evt.turn} </span>
          {evt.message}
        </div>
      ))}
    </div>
  );
}
