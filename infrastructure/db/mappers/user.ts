export function mapUser(dto: any) {
  return {
    id: dto.id,
    username: dto.username,
    avatarUrl: dto.avatar_url,
    createdAt: new Date(dto.created_at),
    points: dto.points,
  };
}
