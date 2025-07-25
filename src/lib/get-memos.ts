
import 'server-only'
import type { Locale } from '@/i18n-config'

const memos = {
  en: () => import('@/lib/memos.en').then((module) => module.memos),
  fr: () => import('@/lib/memos.fr').then((module) => module.memos),
}

export const getMemos = async (locale: Locale) => memos[locale]()
