import GlassCard from './GlassCard';

export default function DataTable({ columns, data }: { columns: string[], data: any[] }) {
  return (
    <GlassCard style={{ padding: 0, overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid var(--glass-border)' }}>
              {columns.map((col, i) => (
                <th key={i} style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.9rem' }}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid var(--glass-border)' }}>
                {Object.values(row).map((val: any, j) => (
                  <td key={j} style={{ padding: '1rem', fontSize: '0.95rem' }}>{val}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </GlassCard>
  );
}
