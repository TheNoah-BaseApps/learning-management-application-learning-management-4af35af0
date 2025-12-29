import { Inter } from 'next/font/google';
import { Toaster } from '@/components/ui/sonner';
import '@/app/globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Learning Management System',
  description: 'AI-powered LMS to manage employee learning',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}