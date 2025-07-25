import { format } from 'date-fns';
import { Calendar, FileText, Star } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Memo } from '@/types';
import { cn } from '@/lib/utils';

interface MemoCardProps {
  memo: Memo;
  index: number;
}

export function MemoCard({ memo, index }: MemoCardProps) {
  return (
    <div className="pl-12 relative animate-in fade-in-0 duration-500" style={{ animationDelay: `${index * 100}ms`}}>
      <div
        className={cn(
          'absolute left-4 -ml-[9px] top-5 h-5 w-5 rounded-full bg-background border-4',
          memo.isQuinquennatEvent ? 'border-accent' : 'border-primary'
        )}
        aria-hidden="true"
      />
      <Card
        className={cn(
          'w-full transition-all duration-300 ease-in-out hover:shadow-xl transform hover:-translate-y-1',
          memo.isQuinquennatEvent && 'border-accent border-2 shadow-accent/20'
        )}
      >
        <CardHeader>
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="flex items-center text-sm text-muted-foreground mb-2">
                <Calendar className="h-4 w-4 mr-2" />
                <time dateTime={memo.date}>{format(new Date(memo.date), 'MMMM d, yyyy')}</time>
              </div>
              <CardTitle className="font-headline text-2xl text-primary">{memo.title}</CardTitle>
            </div>
            {memo.isQuinquennatEvent && (
              <div className="p-2 bg-accent/10 rounded-full flex-shrink-0">
                <Star className="h-5 w-5 text-accent" fill="currentColor" />
              </div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {memo.categories.map((category) => (
              <Badge key={category} variant="secondary" className="font-normal border-transparent bg-primary/5 text-primary/80 hover:bg-primary/10">
                {category}
              </Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-foreground/80 text-base leading-relaxed">{memo.summary}</p>
        </CardContent>
        <CardFooter>
          <Button asChild>
            <a href={memo.documentUrl} target="_blank" rel="noopener noreferrer">
              <FileText className="mr-2 h-4 w-4" />
              View Source Document
            </a>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
