'use client';

import type { DateRange } from 'react-day-picker';
import { Calendar as CalendarIcon, Search, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card } from '@/components/ui/card';

interface SearchFiltersProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
  dateRange: DateRange | undefined;
  onDateRangeChange: (date: DateRange | undefined) => void;
}

export function SearchFilters({
  searchTerm,
  onSearchTermChange,
  dateRange,
  onDateRangeChange,
}: SearchFiltersProps) {
  return (
    <Card className="p-4 sm:p-6 sticky top-4 z-20 shadow-lg bg-card/80 backdrop-blur-sm border-primary/20">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="relative md:col-span-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search by keyword or category..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="pl-10 text-base h-12"
            aria-label="Search memos"
          />
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
                        {format(dateRange.from, 'LLL dd, y')} -{' '}
                        {format(dateRange.to, 'LLL dd, y')}
                    </>
                    ) : (
                    format(dateRange.from, 'LLL dd, y')
                    )
                ) : (
                    <span>Filter by date</span>
                )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={onDateRangeChange}
                numberOfMonths={2}
                />
            </PopoverContent>
            </Popover>
            {dateRange && (
                <Button variant="ghost" size="icon" onClick={() => onDateRangeChange(undefined)} aria-label="Clear date filter">
                    <X className="h-4 w-4" />
                </Button>
            )}
        </div>
      </div>
    </Card>
  );
}
