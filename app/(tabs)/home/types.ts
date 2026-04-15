export type Bet = {
  id: string;
  title: string;
  context?: string | null;
  creator_id: string;
  deadline?: string | null;
  status: 'open' | 'closed' | 'resolved';
  result?: 'yes' | 'no' | null;
  result_image_url?: string | null;
  created_at: string;
};

export type UserLite = {
  id: string;
  username: string;
};

export type PredictionChoice = 'yes' | 'no';

export type BetUserStatus = 'pending' | 'done' | 'late';
