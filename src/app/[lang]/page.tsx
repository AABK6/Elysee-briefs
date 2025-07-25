
import type { DateRange } from 'react-day-picker';
import { AppHeader } from '@/components/app-header';
import { SearchFilters } from '@/components/search-filters';
import { MemoCard } from '@/components/memo-card';
import { getMemos } from '@/lib/get-memos';
import { parseISO } from 'date-fns';
import { getDictionary } from '@/lib/get-dictionary'
import { Locale } from '@/i18n-config';
import type { Memo } from '@/types';

type PageProps = {
  params: { lang: Locale };
  searchParams?: {
    q?: string;
    from?: string;
    to?: string;
  };
};

export default async function Home({ params: { lang }, searchParams }: PageProps) {
  const dictionary = await getDictionary(lang);
  const allMemos = await getMemos(lang);

  const searchTerm = searchParams?.q || '';
  const dateRange: DateRange | undefined =
    searchParams?.from 
      ? { from: parseISO(searchParams.from), to: searchParams.to ? parseISO(searchParams.to) : undefined }
      : undefined;

  const filteredMemos = allMemos
    .filter((memo) => {
      const lowerCaseSearch = searchTerm.toLowerCase();
      const matchesSearchTerm =
        memo.title.toLowerCase().includes(lowerCaseSearch) ||
        memo.summary.toLowerCase().includes(lowerCaseSearch) ||
        memo.categories.some((cat) => cat.toLowerCase().includes(lowerCaseSearch));

      if (!matchesSearchTerm) return false;

      if (dateRange?.from) {
        const memoDate = new Date(memo.date);
        const fromDate = new Date(dateRange.from);
        fromDate.setHours(0, 0, 0, 0);

        if (dateRange.to) {
          const toDate = new Date(dateRange.to);
          toDate.setHours(23, 59, 59, 999);
          return memoDate >= fromDate && memoDate <= toDate;
        }
        const fromDateEnd = new Date(dateRange.from);
        fromDateEnd.setHours(23, 59, 59, 999);
        return memoDate >= fromDate && memoDate <= fromDateEnd;
      }

      return true;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="bg-background min-h-screen font-body text-foreground">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <AppHeader dictionary={dictionary.appHeader} lang={lang} />
        <SearchFilters
          dictionary={dictionary.searchFilters}
          searchTerm={searchTerm}
          dateRange={dateRange}
          lang={lang}
          memos={allMemos}
        />
        <div className="mt-12">
          <div className="relative">
            <div className="absolute left-4 -ml-px h-full w-0.5 bg-primary/20" aria-hidden="true" />
            <div className="space-y-12">
              {filteredMemos.length > 0 ? (
                filteredMemos.map((memo, index) => (
                  <MemoCard key={memo.id} memo={memo} index={index} dictionary={dictionary.memoCard} lang={lang} />
                ))
              ) : (
                <div className="text-center py-16 bg-card rounded-lg shadow-sm ml-12">
                  <p className="text-lg font-semibold text-foreground">{dictionary.home.noMemosFound}</p>
                  <p className="text-muted-foreground">{dictionary.home.adjustSearch}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
