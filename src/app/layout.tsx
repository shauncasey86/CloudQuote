import type { Metadata } from 'next';
import { Josefin_Slab, Open_Sans } from 'next/font/google';
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

// Body font - Open Sans (similar to Sansation)
const openSans = Open_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
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
    <html lang="en" suppressHydrationWarning className={`${josefinSlab.variable} ${openSans.variable}`}>
      <body className={openSans.className}>
        <ThemeProvider>
          <ReactQueryProvider>{children}</ReactQueryProvider>
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
