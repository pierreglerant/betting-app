export interface BetParticipant {
  id: string;
  userId: string;
  username: string;
  optionId: number | null;
  optionValue: string | null;
  points: number;
  isCreator: boolean;
  updatedAt: Date | null;
}
