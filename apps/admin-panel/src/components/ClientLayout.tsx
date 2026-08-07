'use client';
import dynamic from 'next/dynamic';

const Sidebar = dynamic(() => import('./Sidebar'), { ssr: false });

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Sidebar />
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', marginLeft: '250px' }}>
        {children}
      </main>
    </>
  );
}
