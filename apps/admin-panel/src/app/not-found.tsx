export default function NotFound() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: '1rem',
    }}>
      <h2 style={{ fontSize: '4rem', fontWeight: 800 }} className="text-gradient">404</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.25rem' }}>Page not found</p>
      <a href="/" style={{
        marginTop: '1rem',
        padding: '0.75rem 1.5rem',
        background: 'var(--accent-cyan)',
        color: '#000',
        borderRadius: '8px',
        fontWeight: 600,
        textDecoration: 'none',
      }}>Back to Dashboard</a>
    </div>
  );
}
