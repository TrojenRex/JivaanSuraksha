import type {Metadata} from 'next';
import { Inter } from 'next/font/google'
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import PlusBackground from '@/components/plus-background';
import { ThemeProvider } from '@/components/theme-provider';
import { LanguageProvider } from '@/components/language-provider';
import ScrollToTopButton from '@/components/scroll-to-top';
import { TransitionProvider } from '@/components/transition-provider';
import PageTransition from '@/components/page-transition';
import SplashScreen from '@/components/splash-screen';


const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-body',
})

export const metadata: Metadata = {
  title: 'Jivaan Suraksha',
  description: 'An AI-powered symptom checker for all diseases.',
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
              <TransitionProvider>
                <div className="ocean">
                    <div className="wave"></div>
                    <div className="wave"></div>
                </div>
                <SplashScreen />
                <PageTransition />
                {children}
                <Toaster />
                <ScrollToTopButton />
              </TransitionProvider>
            </LanguageProvider>
          </ThemeProvider>
      </body>
    </html>
  );
}
