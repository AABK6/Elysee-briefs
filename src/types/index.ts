export type MemoCategory =
  | 'Economic Policy'
  | 'Foreign Affairs'
  | 'Social Policy'
  | 'Defense'
  | 'Internal Security'
  | 'Environment'
  | 'Technology';

export interface Memo {
  id: string;
  title: string;
  date: string;
  summary: string;
  categories: MemoCategory[];
  documentUrl: string;
  isQuinquennatEvent: boolean;
}
