export function mapComment(dto: any) {
  return {
    id: dto.id,
    userBetId: dto.user_bet_id,
    content: dto.content,
    createdAt: new Date(dto.created_at),
  };
}
