'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { DateRange } from 'react-day-picker';
import { Calendar as CalendarIcon, Search, X } from 'lucide-react';
import { format, formatISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card } from '@/components/ui/card';

interface SearchFiltersProps {
  searchTerm: string;
  dateRange: DateRange | undefined;
}

export function SearchFilters({
  searchTerm: initialSearchTerm,
  dateRange: initialDateRange,
}: SearchFiltersProps) {
  const [searchTerm, setSearchTerm] = useState(initialSearchTerm);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(initialDateRange);
  const router = useRouter();

  useEffect(() => {
    setSearchTerm(initialSearchTerm);
  }, [initialSearchTerm]);

  useEffect(() => {
    setDateRange(initialDateRange);
  }, [initialDateRange]);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchTerm) {
      params.set('q', searchTerm);
    }
    if (dateRange?.from) {
      params.set('from', formatISO(dateRange.from, { representation: 'date' }));
      if (dateRange.to) {
        params.set('to', formatISO(dateRange.to, { representation: 'date' }));
      }
    }
    router.push(`/?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setDateRange(undefined);
    router.push('/');
  }

  const handleDateChange = (newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
    const params = new URLSearchParams();
    if (searchTerm) {
        params.set('q', searchTerm);
    }
    if (newDateRange?.from) {
        params.set('from', formatISO(newDateRange.from, { representation: 'date' }));
        if (newDateRange.to) {
            params.set('to', formatISO(newDateRange.to, { representation: 'date' }));
        }
    }
    router.push(`/?${params.toString()}`);
  }

  return (
    <Card className="p-4 sm:p-6 sticky top-4 z-20 shadow-lg bg-card/80 backdrop-blur-sm border-primary/20">
      <form onSubmit={handleSearch}>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative md:col-span-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher par mot-clé ou catégorie..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 text-base h-12"
              aria-label="Rechercher dans les notes"
            />
             <button type="submit" className="hidden">Soumettre</button>
          </div>
          <div className="md:col-span-2 flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={'outline'}
                  className={cn(
                    'w-full justify-start text-left font-normal text-base h-12',
                    !dateRange && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateRange?.from ? (
                    dateRange.to ? (
                      <>
                        {format(dateRange.from, 'd LLL y', { locale: fr })} -{' '}
                        {format(dateRange.to, 'd LLL y', { locale: fr })}
                      </>
                    ) : (
                      format(dateRange.from, 'd LLL y', { locale: fr })
                    )
                  ) : (
                    <span>Filtrer par date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateRange?.from}
                  selected={dateRange}
                  onSelect={handleDateChange}
                  numberOfMonths={2}
                  locale={fr}
                />
              </PopoverContent>
            </Popover>
            {(initialSearchTerm || initialDateRange) && (
              <Button variant="ghost" size="icon" onClick={clearFilters} aria-label="Effacer les filtres">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </form>
    </Card>
  );
}
