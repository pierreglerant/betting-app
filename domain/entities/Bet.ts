export interface Bet {
  id: string;
  title: string;
  context: string;
  endDate: Date | null;
  isOpen: boolean;
  result: string | null;
  resultImageUrl: string | null;
  createdAt: Date;
  /** Créateur (ex. creator_id côté API). Null si non fourni par le backend. */
  creatorId: string | null;
}
