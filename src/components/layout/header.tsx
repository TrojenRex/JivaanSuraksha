'use client';

import { Menu, Settings, Sun, Moon, Languages, Home, Siren, Pill, Stethoscope, MapPin, Scan, Utensils, LifeBuoy, Newspaper, ArrowLeft } from 'lucide-react';
import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { useLanguage } from '../language-provider';
import { useTheme } from 'next-themes';
import TransitionLink from '../transition-link';
import Logo from '../logo';

type HeaderProps = {
  showBackButton?: boolean;
}

const Header: FC<HeaderProps> = ({ showBackButton = false }) => {
  const { t, setLanguage } = useLanguage();
  const { setTheme } = useTheme();

  return (
    <header className="absolute top-0 left-0 w-full z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <div className="flex items-center gap-2">
            {showBackButton && (
                <TransitionLink href="/">
                    <Button variant="outline" size="icon" className="mr-2">
                        <ArrowLeft className="h-6 w-6" />
                        <span className="sr-only">Back to Home</span>
                    </Button>
                </TransitionLink>
            )}
            <TransitionLink href="/" className="flex items-center gap-2 text-primary-foreground">
              <Logo className="h-10 w-10 sm:h-12 sm:w-12" />
              <span className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                {t('appName')}
              </span>
            </TransitionLink>
          </div>
          <nav className='flex items-center gap-1 sm:gap-2'>
             <Button asChild variant="destructive" className="animate-pulse px-2 sm:px-4">
                <a href="tel:102">
                    <Siren className="mr-0 sm:mr-2 h-5 w-5" />
                    <span className="hidden sm:inline">{t('emergency')}</span>
                </a>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <TransitionLink href="/">
                    <Home className="mr-2 h-4 w-4" />
                    <span>Home</span>
                  </TransitionLink>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <TransitionLink href="/symptom-checker">
                    <Stethoscope className="mr-2 h-4 w-4" />
                    <span>{t('symptomChecker')}</span>
                  </TransitionLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <TransitionLink href="/medicine-checker">
                    <Pill className="mr-2 h-4 w-4" />
                    <span>{t('medicineChecker')}</span>
                  </TransitionLink>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <TransitionLink href="/nearby-clinics">
                    <MapPin className="mr-2 h-4 w-4" />
                    <span>{t('nearbyClinics')}</span>
                  </TransitionLink>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                  <TransitionLink href="/skin-analyzer">
                    <Scan className="mr-2 h-4 w-4" />
                    <span>{t('skinAnalyzer')}</span>
                  </TransitionLink>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                  <TransitionLink href="/diet-planner">
                    <Utensils className="mr-2 h-4 w-4" />
                    <span>{t('dietPlanner')}</span>
                  </TransitionLink>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                  <TransitionLink href="/first-aid">
                    <LifeBuoy className="mr-2 h-4 w-4" />
                    <span>{t('firstAidGuide')}</span>
                  </TransitionLink>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                  <TransitionLink href="/health-articles">
                    <Newspaper className="mr-2 h-4 w-4" />
                    <span>{t('healthArticles')}</span>
                  </TransitionLink>
                </DropdownMenuItem>
                 <DropdownMenuItem asChild>
                  <TransitionLink href="/emergency-sos">
                    <Siren className="mr-2 h-4 w-4" />
                    <span>{t('emergencySOS')}</span>
                  </TransitionLink>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button variant="outline" size="icon">
                    <Settings className="h-6 w-6" />
                    <span className="sr-only">{t('settings')}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                 <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 mr-2" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 mr-2" />
                    <span>{t('theme')}</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => setTheme("light")}>
                        {t('light')}
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setTheme("dark")}>
                        {t('dark')}
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <Languages className="mr-2 h-4 w-4" />
                    <span>{t('language')}</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuPortal>
                    <DropdownMenuSubContent>
                      <DropdownMenuItem onClick={() => setLanguage('en')}>
                        English
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLanguage('bn')}>
                        বাংলা (Bengali)
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setLanguage('hi')}>
                        हिन्दी (Hindi)
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuPortal>
                </DropdownMenuSub>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
