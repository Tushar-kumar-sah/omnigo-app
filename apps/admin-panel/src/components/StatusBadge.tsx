export default function StatusBadge({ status }: { status: string }) {
  let color = 'var(--text-secondary)';
  let bg = 'rgba(255,255,255,0.1)';
  
  if (['Active', 'Online', 'Completed'].includes(status)) {
    color = 'var(--accent-green)';
    bg = 'rgba(0, 255, 151, 0.15)';
  } else if (['Suspended', 'Offline'].includes(status)) {
    color = 'var(--danger)';
    bg = 'rgba(255, 59, 59, 0.15)';
  } else if (['Searching'].includes(status)) {
    color = 'var(--warning)';
    bg = 'rgba(255, 184, 0, 0.15)';
  }

  return (
    <span style={{
      padding: '0.25rem 0.75rem',
      borderRadius: '999px',
      fontSize: '0.85rem',
      fontWeight: 600,
      color,
      background: bg,
      border: `1px solid ${color}`,
      boxShadow: `0 0 10px ${bg}`
    }}>
      {status}
    </span>
  );
}
