'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navLinks = [
  { name: 'Dashboard', path: '/' },
  { name: 'Users', path: '/users' },
  { name: 'Drivers', path: '/drivers' },
  { name: 'Bookings', path: '/bookings' },
  { name: 'Revenue', path: '/revenue' },
  { name: 'Fleet Map', path: '/fleet' },
  { name: 'Settings', path: '/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside style={{
      width: '250px',
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--glass-border)',
      padding: '2rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '2rem'
    }}>
      <div style={{ padding: '0 1rem' }}>
        <h1 className="text-gradient" style={{ fontSize: '1.5rem', fontWeight: 800 }}>OmniGo Admin</h1>
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {navLinks.map((link) => {
          const isActive = pathname === link.path;
          return (
            <Link key={link.name} href={link.path}>
              <div style={{
                padding: '1rem',
                borderRadius: '12px',
                background: isActive ? 'var(--glass-bg)' : 'transparent',
                border: isActive ? '1px solid var(--accent-cyan)' : '1px solid transparent',
                boxShadow: isActive ? 'var(--glow-cyan)' : 'none',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                transition: 'all 0.3s ease',
                fontWeight: isActive ? 600 : 400,
              }}>
                {link.name}
              </div>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
