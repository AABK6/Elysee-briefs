import { memos } from '@/lib/memos';
import { notFound } from 'next/navigation';
import { AppHeader } from '@/components/app-header';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, FileText, ArrowLeft, Star } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import type { Metadata } from 'next';

type MemoPageProps = {
  params: {
    id: string;
  };
};

export async function generateMetadata({ params }: MemoPageProps): Promise<Metadata> {
  const memo = memos.find((m) => m.id === params.id);

  if (!memo) {
    return {
      title: 'Note non trouvée',
    }
  }

  return {
    title: `${memo.title} | Dossiers de l'Élysée`,
    description: memo.summary,
  }
}

export default function MemoPage({ params }: MemoPageProps) {
  const memo = memos.find((m) => m.id === params.id);

  if (!memo) {
    notFound();
  }

  return (
    <div className="bg-background min-h-screen font-body text-foreground">
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <AppHeader />
        
        <div className="mb-8">
            <Button asChild variant="outline">
                <Link href="/">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour à la chronologie
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
                            <time dateTime={memo.date}>{format(new Date(memo.date), 'd MMMM yyyy', { locale: fr })}</time>
                        </div>
                        <CardTitle className="font-headline text-3xl text-primary">{memo.title}</CardTitle>
                        </div>
                        {memo.isQuinquennatEvent && (
                        <div className="p-2 bg-accent/10 rounded-full flex-shrink-0" title="Événement marquant du quinquennat">
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
                    <div className="prose prose-lg max-w-none text-foreground/80 leading-relaxed">
                        <p>Cette section contiendrait le texte intégral de la note s'il était disponible. Pour l'instant, elle sert d'exemple pour illustrer la structure d'une vue détaillée de note.</p>
                        <p>Le contenu pourrait inclure des paragraphes détaillés, des listes et même des citations du document original, fournissant une ressource complète pour les chercheurs et les historiens.</p>
                        <ul>
                            <li>Conclusion clé 1 du document.</li>
                            <li>Conclusion clé 2 avec plus de détails.</li>
                            <li>Conclusion clé 3 et ses implications.</li>
                        </ul>
                        <p>Une analyse plus approfondie et des informations contextuelles suivraient, faisant de cette page une source canonique pour ce dossier spécifique.</p>
                    </div>
                </CardContent>
                <CardFooter>
                <Button asChild>
                    <a href={memo.documentUrl} target="_blank" rel="noopener noreferrer">
                    <FileText className="mr-2 h-4 w-4" />
                    Voir le document source original
                    </a>
                </Button>
                </CardFooter>
            </Card>
        </article>

      </main>
    </div>
  );
}

export async function generateStaticParams() {
    return memos.map((memo) => ({
      id: memo.id,
    }));
}
