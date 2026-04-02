interface Props {
  current: number;
  max: number;
}

export function EnergyBar({ current, max }: Props) {
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-blue-300 mr-1">{current}/{max}</span>
      {Array.from({ length: max }).map((_, i) => (
        <div key={i} className={`energy-crystal ${i < current ? 'filled' : ''}`} />
      ))}
    </div>
  );
}
