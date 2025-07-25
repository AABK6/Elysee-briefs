import { Landmark } from 'lucide-react';
import Link from 'next/link';
import { Locale } from '@/i18n-config';

export function AppHeader({ dictionary, lang }: { dictionary: { title: string, subtitle: string }, lang: Locale }) {
  return (
    <header className="py-8 text-center border-b-2 border-foreground/10 mb-8">
      <Link href={`/${lang}`} className="inline-block">
        <div className="flex items-center justify-center gap-4">
          <Landmark className="h-10 w-10 sm:h-12 sm:w-12 text-foreground" />
          <h1 className="text-4xl sm:text-5xl font-bold font-headline text-foreground tracking-tight">
            {dictionary.title}
          </h1>
        </div>
      </Link>
      <p className="mt-3 text-base sm:text-lg text-muted-foreground font-light">
        {dictionary.subtitle}
      </p>
    </header>
  );
}
