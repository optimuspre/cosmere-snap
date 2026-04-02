const WORLD_LABELS: Record<string, string> = {
  'roshar': 'Roshar',
  'scadrial-era1': 'Scadrial I',
  'scadrial-era2': 'Scadrial II',
  'nalthis': 'Nalthis',
  'sel': 'Sel',
  'cosmere-wide': 'Cosmere',
  'cognitive-realm': 'Shadesmar',
};

export function WorldBadge({ world }: { world: string }) {
  return (
    <span
      className="text-xs px-1.5 py-0.5 rounded font-mono opacity-80"
      style={{
        color: 'var(--world-accent)',
        background: 'rgba(0,0,0,0.3)',
        border: '1px solid var(--world-accent)',
      }}
      data-world={world}
    >
      {WORLD_LABELS[world] ?? world}
    </span>
  );
}
