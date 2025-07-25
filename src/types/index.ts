
export type MemoCategory =
  | 'Politique Économique'
  | 'Affaires Étrangères'
  | 'Politique Sociale'
  | 'Défense'
  | 'Sécurité Intérieure'
  | 'Environnement'
  | 'Technologie'
  | 'Economic Policy'
  | 'Foreign Affairs'
  | 'Social Policy'
  | 'Homeland Security';


export interface Memo {
  id: string;
  title: string;
  date: string;
  summary: string;
  categories: MemoCategory[];
  documentUrl: string;
  isQuinquennatEvent: boolean;
  fullContent: string;
}
