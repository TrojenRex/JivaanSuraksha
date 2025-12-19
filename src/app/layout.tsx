import type {Metadata} from 'next';
import { Inter } from 'next/font/google'
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import PlusBackground from '@/components/plus-background';
import { ThemeProvider } from '@/components/theme-provider';
import { LanguageProvider } from '@/components/language-provider';
import ScrollToTopButton from '@/components/scroll-to-top';

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
    <html lang="en" className={`${inter.variable}`} suppressHydrationWarning>
      <body className="font-body antialiased">
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <LanguageProvider>
              <PlusBackground />
              {children}
              <Toaster />
              <ScrollToTopButton />
            </LanguageProvider>
          </ThemeProvider>
      </body>
    </html>
  );
}
