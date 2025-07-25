'use client';

import { useState, useMemo, useEffect } from 'react';
import type { DateRange } from 'react-day-picker';
import { AppHeader } from '@/components/app-header';
import { SearchFilters } from '@/components/search-filters';
import { MemoCard } from '@/components/memo-card';
import { memos as allMemos } from '@/lib/memos';
import { Skeleton } from '@/components/ui/skeleton';

export default function Home() {
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredMemos = useMemo(() => {
    return allMemos
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
  }, [searchTerm, dateRange]);
  
  const PageSkeleton = () => (
    <div className="space-y-8">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="pl-12 relative">
          <Skeleton className="absolute left-4 -ml-[9px] top-5 h-5 w-5 rounded-full" />
          <Skeleton className="h-64 w-full rounded-lg" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-background min-h-screen font-body text-foreground">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <AppHeader />
        <SearchFilters
          searchTerm={searchTerm}
          onSearchTermChange={setSearchTerm}
          dateRange={dateRange}
          onDateRangeChange={setDateRange}
        />
        <div className="mt-12">
          <div className="relative">
            <div className="absolute left-4 -ml-px h-full w-0.5 bg-primary/20" aria-hidden="true" />
            <div className="space-y-12">
              {!isClient ? <PageSkeleton /> :
              filteredMemos.length > 0 ? (
                filteredMemos.map((memo, index) => (
                  <MemoCard key={memo.id} memo={memo} index={index} />
                ))
              ) : (
                <div className="text-center py-16 bg-card rounded-lg shadow-sm ml-12">
                  <p className="text-lg font-semibold text-foreground">No memos found.</p>
                  <p className="text-muted-foreground">Try adjusting your search terms.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
