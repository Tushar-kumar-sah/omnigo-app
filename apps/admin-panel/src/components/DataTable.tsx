import GlassCard from './GlassCard';

export default function DataTable({ columns, data }: { columns: string[], data: any[] }) {
  return (
    <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255, 255, 255, 0.02)', borderBottom: '1px solid var(--glass-border)' }}>
              {columns.map((col, i) => (
                <th
                  key={i}
                  style={{
                    padding: '0.85rem 1.25rem',
                    color: 'var(--text-muted)',
                    fontWeight: 600,
                    fontSize: '0.72rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                  }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr
                key={i}
                style={{
                  borderBottom: '1px solid var(--glass-border-subtle)',
                  transition: 'background 0.15s ease',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
              >
                {Object.values(row).map((val: any, j) => (
                  <td key={j} style={{ padding: '0.95rem 1.25rem', fontSize: '0.86rem', color: 'var(--text-primary)' }}>
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
