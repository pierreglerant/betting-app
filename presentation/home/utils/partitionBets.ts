import type { Bet as DomainBet } from '@/domain/entities/Bet';
import type { Bet as AppBet } from '../types';

export function domainBetToAppBet(b: DomainBet): AppBet {
  const status: AppBet['status'] = b.isOpen ? 'open' : b.result != null ? 'resolved' : 'closed';

  return {
    id: b.id,
    title: b.title,
    context: b.context,
    creator_id: b.creatorId ?? '',
    deadline: b.endDate ? b.endDate.toISOString() : null,
    status,
    result: b.result ?? null,
    result_image_url: b.resultImageUrl,
    created_at: b.createdAt.toISOString(),
  };
}

export function partitionDomainBets(
  domainBets: DomainBet[],
  userId: string | undefined,
): {
  openBets: AppBet[];
  myLaunchedBets: AppBet[];
  finishedBets: AppBet[];
} {
  const ui = domainBets
    .map(domainBetToAppBet)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const uid = userId ?? '';
  return {
    openBets: ui.filter((b) => b.status === 'open'),
    myLaunchedBets: ui.filter((b) => b.status === 'open' && b.creator_id === uid),
    finishedBets: ui.filter((b) => b.status === 'resolved'),
  };
}
