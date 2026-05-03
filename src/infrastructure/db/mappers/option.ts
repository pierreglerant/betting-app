export function mapOption(dto: any) {
  return {
    id: dto.id,
    betId: dto.bet_id,
    value: dto.value,
  };
}
