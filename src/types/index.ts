export type MemoCategory =
  | 'Politique Économique'
  | 'Affaires Étrangères'
  | 'Politique Sociale'
  | 'Défense'
  | 'Sécurité Intérieure'
  | 'Environnement'
  | 'Technologie';

export interface Memo {
  id: string;
  title: string;
  date: string;
  summary: string;
  categories: MemoCategory[];
  documentUrl: string;
  isQuinquennatEvent: boolean;
}
