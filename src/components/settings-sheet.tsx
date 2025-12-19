"use client"

import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Label } from "./ui/label"
import { RadioGroup, RadioGroupItem } from "./ui/radio-group"
import { useLanguage } from "./language-provider"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion"

export default function SettingsSheet({ children }: { children: React.ReactNode }) {
    const { setTheme, theme } = useTheme()
    const { setLanguage, language, t } = useLanguage()

  return (
    <Sheet>
      <SheetTrigger asChild>
        {children}
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>{t('settings')}</SheetTitle>
          <SheetDescription>
            {t('settingsDescription')}
          </SheetDescription>
        </SheetHeader>
        <Accordion type="single" collapsible className="w-full mt-4">
          <AccordionItem value="item-1">
            <AccordionTrigger>{t('theme')}</AccordionTrigger>
            <AccordionContent>
              <div className="grid gap-3 pl-2">
                <RadioGroup id="theme" defaultValue={theme} onValueChange={(value) => setTheme(value)}>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="light" id="theme-light" />
                        <Label htmlFor="theme-light">{t('light')}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="dark" id="theme-dark" />
                        <Label htmlFor="theme-dark">{t('dark')}</Label>
                    </div>
                </RadioGroup>
              </div>
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>{t('language')}</AccordionTrigger>
            <AccordionContent>
               <div className="grid gap-3 pl-2">
                <RadioGroup id="language" defaultValue={language} onValueChange={(value) => setLanguage(value as any)}>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="en" id="lang-en" />
                        <Label htmlFor="lang-en">English</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="bn" id="lang-bn" />
                        <Label htmlFor="lang-bn">বাংলা (Bengali)</Label>
                    </div>
                     <div className="flex items-center space-x-2">
                        <RadioGroupItem value="hi" id="lang-hi" />
                        <Label htmlFor="lang-hi">हिन्दी (Hindi)</Label>
                    </div>
                </RadioGroup>
            </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </SheetContent>
    </Sheet>
  )
}
