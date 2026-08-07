function Error({ statusCode }: { statusCode?: number }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#0A0E17',
      color: '#fff',
      fontFamily: 'system-ui',
    }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 800 }}>{statusCode || 'Error'}</h1>
      <p style={{ color: '#8B9DC3', fontSize: '1.25rem' }}>
        {statusCode ? `A ${statusCode} error occurred on server` : 'An error occurred on client'}
      </p>
      <a href="/" style={{
        marginTop: '1rem',
        padding: '0.75rem 1.5rem',
        background: '#00CFFF',
        color: '#000',
        borderRadius: '8px',
        fontWeight: 600,
        textDecoration: 'none',
      }}>Back to Dashboard</a>
    </div>
  );
}

Error.getInitialProps = ({ res, err }: { res?: { statusCode: number }, err?: { statusCode: number } }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;
  return { statusCode };
};

export default Error;
