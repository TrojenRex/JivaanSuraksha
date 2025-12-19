import type {Metadata} from 'next';
import { Inter } from 'next/font/google'
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import PlusBackground from '@/components/plus-background';

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'Jivaan Suraksha',
  description: 'AI-powered symptom checker for water-borne diseases.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${inter.variable}`}>
      <body className="font-body antialiased">
        <PlusBackground />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
