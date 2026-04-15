export function mapBet(dto: any) {
  return {
    id: dto.id,
    title: dto.title,
    context: dto.context,
    endDate: dto.end_date ? new Date(dto.end_date) : null,
    isOpen: dto.is_open,
    result: dto.result,
    resultImageUrl: dto.result_image_url,
    createdAt: new Date(dto.created_at),
  };
}
