import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { FamilyTreeProvider } from '@/contexts/FamilyTreeContext';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Our Family Tree — Kassim Pillai Family',
  description: 'Preserving our family history for generations to come. A private digital archive for the Kassim Pillai family.',
  robots: 'noindex, nofollow', // Private site
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <FamilyTreeProvider>
            {children}
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: '#fff',
                  color: '#292524',
                  border: '1px solid #e7e5e4',
                  borderRadius: '12px',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                  padding: '12px 16px',
                  fontSize: '14px',
                },
                success: {
                  iconTheme: { primary: '#059669', secondary: '#fff' },
                },
                error: {
                  iconTheme: { primary: '#dc2626', secondary: '#fff' },
                },
              }}
            />
          </FamilyTreeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
