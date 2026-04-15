export interface Bet {
  id: string;
  title: string;
  context: string;
  endDate: Date | null;
  isOpen: boolean;
  result: string | null;
  resultImageUrl: string | null;
  createdAt: Date;
}
