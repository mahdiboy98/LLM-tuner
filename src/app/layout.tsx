import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import '@/styles/globals.css';
import Sidebar from '@/components/Sidebar';
import ToastContainer from '@/components/ToastContainer';
import ErrorBoundary from '@/components/ErrorBoundary';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LLM Tuner',
  description: 'A beautiful GUI for tweaking local LLMs',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 custom-scrollbar`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <div className="flex h-screen">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8">
              <ErrorBoundary>
                {children}
              </ErrorBoundary>
            </main> 
            <ToastContainer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}