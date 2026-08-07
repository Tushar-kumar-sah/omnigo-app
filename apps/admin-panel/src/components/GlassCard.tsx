export default function GlassCard({ children, style }: { children: React.ReactNode, style?: React.CSSProperties }) {
  return (
    <div className="glass" style={{ padding: '1.5rem', ...style }}>
      {children}
    </div>
  );
}
