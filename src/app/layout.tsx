import type { Metadata } from 'next';
import { Josefin_Slab, Sansation } from 'next/font/google';
import '@/styles/globals.css';
import { ReactQueryProvider } from '@/components/providers/ReactQueryProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Toaster } from 'sonner';

// Header font - Josefin Slab Bold 700 UPPERCASE
const josefinSlab = Josefin_Slab({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-header',
  display: 'swap',
});

// Body font - Sansation Regular 400
const sansation = Sansation({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'CloudQuote - Kitchen Quoting System',
  description: 'Internal kitchen installation quoting system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${josefinSlab.variable} ${sansation.variable}`}>
      <body className={sansation.className}>
        <ThemeProvider>
          <ReactQueryProvider>{children}</ReactQueryProvider>
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
