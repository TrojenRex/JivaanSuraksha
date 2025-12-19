'use client';

import { Droplets, Menu, Stethoscope, MapPin, Settings, Sun, Moon, Languages, Home, Siren } from 'lucide-react';
import Link from 'next/link';
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
} from "@/components/ui/dropdown-menu"
import { useLanguage } from '../language-provider';
import { useTheme } from 'next-themes';

const Header: FC = () => {
  const { t, setLanguage } = useLanguage();
  const { setTheme } = useTheme();

  return (
    <header className="absolute top-0 left-0 w-full z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          <Link href="/" className="flex items-center gap-3 text-primary-foreground">
            <div className="bg-primary/80 backdrop-blur-sm p-2 rounded-lg shadow-md">
              <Droplets className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl md:text-2xl font-bold text-foreground">
              {t('appName')}
            </span>
          </Link>
          <nav className='flex items-center gap-2'>
             <Button asChild variant="destructive" className="animate-pulse">
                <a href="tel:102">
                    <Siren className="mr-2 h-5 w-5" />
                    {t('emergency')}
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
                  <Link href="/">
                    <Home className="mr-2 h-4 w-4" />
                    <span>Home</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/symptom-checker">
                    <Stethoscope className="mr-2 h-4 w-4" />
                    <span>{t('symptomChecker')}</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/nearby-clinics">
                    <MapPin className="mr-2 h-4 w-4" />
                    <span>{t('nearbyClinics')}</span>
                  </Link>
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
