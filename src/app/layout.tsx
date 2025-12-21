import type {Metadata} from 'next';
import { Inter } from 'next/font/google'
import './globals.css';
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from '@/components/theme-provider';
import { LanguageProvider } from '@/components/language-provider';
import ScrollToTopButton from '@/components/scroll-to-top';
import { TransitionProvider } from '@/components/transition-provider';
import PageTransition from '@/components/page-transition';
import SplashScreen from '@/components/splash-screen';
import PlusBackground from '@/components/plus-background';
import WaveBackground from '@/components/wave-background';


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
      <body className="font-body antialiased bg-background">
        <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
            <LanguageProvider>
              <TransitionProvider>
                <div className="fixed top-0 left-0 w-full h-full bg-blue-950 -z-10" />
                <WaveBackground />
                <PlusBackground />
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
