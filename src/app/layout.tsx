import type { Metadata } from 'next';
import { Outfit, JetBrains_Mono } from 'next/font/google';
import localFont from 'next/font/local';
import '@/styles/globals.css';
import { ReactQueryProvider } from '@/components/providers/ReactQueryProvider';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Toaster } from 'sonner';

// Header font - Outfit Bold - geometric, modern, architectural
const outfit = Outfit({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-header',
  display: 'swap',
});

// Body font - Sansation - humanist sans-serif with futuristic feel
// Using local font since Sansation is not on Google Fonts
const sansation = localFont({
  src: [
    {
      path: '../../public/fonts/Sansation-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Sansation-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Sansation-Light.woff2',
      weight: '300',
      style: 'normal',
    },
  ],
  variable: '--font-body',
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
});

// Monospace font - JetBrains Mono - for prices and IDs
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
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
    <html
      lang="en"
      suppressHydrationWarning
      className={`${outfit.variable} ${sansation.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        <ThemeProvider>
          <ReactQueryProvider>{children}</ReactQueryProvider>
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
