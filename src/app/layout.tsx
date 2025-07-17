import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import { GameProvider } from '@/contexts/GameContext';
import { Toaster } from '@/components/ui/sonner';
const inter = Inter({ subsets: ['latin'] });
export const metadata: Metadata = {
  title: 'Tic-Tac-Toe - Professional Multiplayer Game',
  description: 'Play Tic-Tac-Toe online with friends, against AI, or with random players. Features include room codes, game history, and interactive tutorials.',
  keywords: 'tic-tac-toe, game, multiplayer, online, AI, tutorial',
  authors: [{ name: 'Tic-Tac-Toe Game' }],
  viewport: 'width=device-width, initial-scale=1',
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
          <GameProvider>
            {children}
            <Toaster />
          </GameProvider>
        </AuthProvider>
      </body>
    </html>
  );
}