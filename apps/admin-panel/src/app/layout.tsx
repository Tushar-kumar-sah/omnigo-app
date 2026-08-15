import './globals.css';
import { Plus_Jakarta_Sans } from 'next/font/google';
import ClientLayout from '@/components/ClientLayout';

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
});

export const metadata = {
  title: 'OmniGo Super Admin | Enterprise Operations Console',
  description: 'Enterprise Operations & Financial Ledger Command Center for OmniGo',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: any;
}) {
  return (
    <html lang="en" className={jakarta.variable}>
      <body className={jakarta.className} style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}
