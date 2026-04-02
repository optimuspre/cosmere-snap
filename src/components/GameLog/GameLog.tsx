import type { GameEvent } from '../../types';

interface Props {
  events: GameEvent[];
}

export function GameLog({ events }: Props) {
  const recent = [...events].reverse().slice(0, 8);
  return (
    <div
      className="rounded-lg p-2 overflow-hidden"
      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border)', minWidth: 180, maxWidth: 240 }}
    >
      <div className="text-xs text-gray-500 mb-1 font-bold">Event Log</div>
      {recent.length === 0 && <div className="text-xs text-gray-600">No events yet</div>}
      {recent.map((evt) => (
        <div key={evt.id} className="text-xs text-gray-400 leading-tight mb-0.5 truncate">
          <span className="text-gray-600">T{evt.turn}: </span>
          {evt.message}
        </div>
      ))}
    </div>
  );
}
