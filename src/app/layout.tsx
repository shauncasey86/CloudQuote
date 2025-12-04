import type { Metadata } from 'next';
import { Josefin_Slab } from 'next/font/google';
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
    <html lang="en" suppressHydrationWarning className={josefinSlab.variable}>
      <head>
        {/* Sansation font from Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Sansation:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "'Sansation', sans-serif" }}>
        <ThemeProvider>
          <ReactQueryProvider>{children}</ReactQueryProvider>
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
