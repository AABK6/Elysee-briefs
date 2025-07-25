'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { i18n, type Locale } from '@/i18n-config'
import { Button } from '@/components/ui/button'
import { Globe } from 'lucide-react'

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const FR_FLAG = '🇫🇷'
const EN_FLAG = '🇬🇧'

export function LanguageSwitcher() {
  const pathName = usePathname()

  const getFlag = (locale: Locale) => {
    if (locale === 'fr') return FR_FLAG;
    return EN_FLAG;
  }

  const redirectedPathName = (locale: Locale) => {
    if (!pathName) return '/'
    const segments = pathName.split('/')
    segments[1] = locale
    return segments.join('/')
  }
  
  const currentLocale = pathName.split('/')[1] as Locale;
  const otherLocales = i18n.locales.filter(l => l !== currentLocale);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <span className="text-lg">{getFlag(currentLocale)}</span>
          <span className="sr-only">Changer de langue</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {otherLocales.map(locale => (
          <DropdownMenuItem key={locale} asChild>
            <Link href={redirectedPathName(locale)}>
              <span className="mr-2">{getFlag(locale)}</span>
              {locale.toUpperCase()}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
