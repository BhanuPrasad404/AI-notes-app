import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import GlobalSocketListener from '@/components/GlobalSocketListener';
import { ThemeProvider } from 'next-themes';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AI Notes - Notion + Trello Hybrid',
  description: 'Your intelligent workspace with AI-powered notes and tasks',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>

          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
            {children}
            <GlobalSocketListener />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
