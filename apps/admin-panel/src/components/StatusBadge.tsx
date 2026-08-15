export default function StatusBadge({ status }: { status: string }) {
  let color = '#94A3B8';
  let bg = 'rgba(255, 255, 255, 0.05)';
  let borderColor = 'rgba(255, 255, 255, 0.08)';
  
  if (['Active', 'Online', 'Completed', 'Verified', 'Settled & Paid', 'Resolved'].includes(status)) {
    color = '#10B981';
    bg = 'rgba(16, 185, 129, 0.08)';
    borderColor = 'rgba(16, 185, 129, 0.25)';
  } else if (['Suspended', 'Offline', 'Frozen', 'Action Required', 'Cancelled', 'High'].includes(status)) {
    color = '#F43F5E';
    bg = 'rgba(244, 63, 94, 0.08)';
    borderColor = 'rgba(244, 63, 94, 0.25)';
  } else if (['Searching', 'Pending', 'Pending Clearance', 'Pending Review', 'Medium', 'Open Investigation'].includes(status)) {
    color = '#F59E0B';
    bg = 'rgba(245, 158, 11, 0.08)';
    borderColor = 'rgba(245, 158, 11, 0.25)';
  } else if (['En-route', 'Assigned', 'Auto-Dispatching', 'Low'].includes(status)) {
    color = '#38BDF8';
    bg = 'rgba(56, 189, 248, 0.08)';
    borderColor = 'rgba(56, 189, 248, 0.25)';
  } else if (['Towing', 'Driver On Scene'].includes(status)) {
    color = '#A855F7';
    bg = 'rgba(168, 85, 247, 0.08)';
    borderColor = 'rgba(168, 85, 247, 0.25)';
  }

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      padding: '3px 9px',
      borderRadius: '100px',
      fontSize: '0.75rem',
      fontWeight: 600,
      color,
      background: bg,
      border: `1px solid ${borderColor}`,
      letterSpacing: '0.02em',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '3px', background: color }} />
      {status}
    </span>
  );
}
