export interface User {
  id: string;
  username: string;
  avatarUrl: string | null;
  points: number;
  createdAt: Date;
}
