'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      gap: '1rem',
      textAlign: 'center',
    }}>
      <h2 style={{ fontSize: '3rem', fontWeight: 800, color: 'var(--accent-red)' }}>500</h2>
      <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem' }}>
        {error.message || 'Something went wrong on the dashboard.'}
      </p>
      <button
        onClick={() => reset()}
        style={{
          marginTop: '1rem',
          padding: '0.75rem 1.5rem',
          background: 'var(--accent-cyan)',
          color: '#000',
          borderRadius: '8px',
          fontWeight: 600,
          border: 'none',
          cursor: 'pointer',
        }}
      >
        Try Again
      </button>
    </div>
  );
}
