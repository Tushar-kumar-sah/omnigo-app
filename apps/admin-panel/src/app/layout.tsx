import './globals.css';
import { Inter } from 'next/font/google';
import ClientLayout from '@/components/ClientLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'OmniGo Super Admin',
  description: 'Admin dashboard for OmniGo towing platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ display: 'flex', minHeight: '100vh' }}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
