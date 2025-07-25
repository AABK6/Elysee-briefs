
import { getMemos } from '@/lib/get-memos';
import { notFound } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, ArrowLeft, Star } from 'lucide-react';
import { format } from 'date-fns';
import { fr, enUS } from 'date-fns/locale';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';
import { getDictionary } from '@/lib/get-dictionary';
import { Locale } from '@/i18n-config';
import type { Memo } from '@/types';

type MemoPageProps = {
  params: {
    id: string;
    lang: Locale;
  };
};

export async function generateMetadata({ params }: MemoPageProps): Promise<Metadata> {
  const memos = await getMemos(params.lang);
  const memo = memos.find((m) => m.id === params.id);
  const dictionary = await getDictionary(params.lang);

  if (!memo) {
    return {
      title: dictionary.memoPage.notFound,
    }
  }

  return {
    title: `${memo.title} | ${dictionary.metadata.title}`,
    description: memo.summary,
  }
}

export default async function MemoPage({ params }: MemoPageProps) {
  const memos = await getMemos(params.lang);
  const memo = memos.find((m) => m.id === params.id);
  const dictionary = await getDictionary(params.lang);
  const dateLocale = params.lang === 'fr' ? fr : enUS;

  if (!memo) {
    notFound();
  }

  return (
    <div className="bg-background min-h-screen font-body text-foreground">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <AppHeader dictionary={dictionary.appHeader} />
        
        <div className="mb-8">
            <Button asChild variant="outline">
                <Link href={`/${params.lang}`}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {dictionary.memoPage.backToTimeline}
                </Link>
            </Button>
        </div>

        <article>
            <Card
                className={cn(
                'w-full',
                memo.isQuinquennatEvent && 'border-accent border-2 shadow-accent/20'
                )}
            >
                <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                        <div>
                        <div className="flex items-center text-sm text-muted-foreground mb-2">
                            <Calendar className="h-4 w-4 mr-2" />
                            <time dateTime={memo.date}>{format(new Date(memo.date), 'd MMMM yyyy', { locale: dateLocale })}</time>
                        </div>
                        <CardTitle className="font-headline text-3xl text-foreground">{memo.title}</CardTitle>
                        </div>
                        {memo.isQuinquennatEvent && (
                        <div className="p-2 bg-accent/10 rounded-full flex-shrink-0" title={dictionary.memoPage.majorEventTitle}>
                            <Star className="h-6 w-6 text-accent" fill="currentColor" />
                        </div>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2 pt-4">
                        {memo.categories.map((category) => (
                        <Badge key={category} variant="secondary" className="font-normal border-transparent bg-primary/5 text-primary/80 hover:bg-primary/10">
                            {category}
                        </Badge>
                        ))}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <p className="text-foreground/90 text-xl leading-relaxed font-semibold">{memo.summary}</p>
                    <div className="prose prose-lg max-w-none text-foreground/80 leading-relaxed" dangerouslySetInnerHTML={{ __html: memo.fullContent }}/>
                </CardContent>
                <CardFooter>
                <Button asChild>
                    <a href={memo.documentUrl} target="_blank" rel="noopener noreferrer">
                    <FileText className="mr-2 h-4 w-4" />
                    {dictionary.memoPage.viewSource}
                    </a>
                </Button>
                </CardFooter>
            </Card>
        </article>

      </main>
    </div>
  );
}

export async function generateStaticParams({ params: { lang } }: { params: { lang: Locale }}) {
    const memos = await getMemos(lang);
    return memos.map((memo: Memo) => ({
      id: memo.id,
    }));
}
