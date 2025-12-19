'use client';

import { Droplets, Menu, Stethoscope, MapPin, Newspaper, Settings } from 'lucide-react';
import Link from 'next/link';
import type { FC } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import SettingsSheet from '../settings-sheet';
import { useLanguage } from '../language-provider';

const Header: FC = () => {
  const { t } = useLanguage();

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Menu className="h-6 w-6" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
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
                <DropdownMenuItem asChild>
                  <Link href="/news">
                    <Newspaper className="mr-2 h-4 w-4" />
                    <span>{t('medicalNews')}</span>
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <SettingsSheet>
                <Button variant="outline" size="icon">
                    <Settings className="h-6 w-6" />
                    <span className="sr-only">{t('settings')}</span>
                </Button>
            </SettingsSheet>

          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
