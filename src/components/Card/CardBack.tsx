export function CardBack({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const isSmall = size === 'sm';
  return (
    <div
      className="rounded-lg flex items-center justify-center text-gray-600"
      style={{
        width: isSmall ? 72 : 100,
        minHeight: isSmall ? 96 : 130,
        background: 'repeating-linear-gradient(45deg, #1a1a2e 0px, #1a1a2e 4px, #16213e 4px, #16213e 8px)',
        border: '1px solid #2d2d4e',
      }}
    >
      <span style={{ fontSize: isSmall ? '1rem' : '1.5rem' }}>✦</span>
    </div>
  );
}
