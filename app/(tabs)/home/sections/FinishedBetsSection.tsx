import { useRouter } from 'expo-router';
import React from 'react';
import { SECTION_PREVIEW_LIMIT } from '@/constants/bets';
import { useFinishedBetsData } from '../hooks/useBetQueries';
import BetRow from '../components/BetRow';
import BetsSection from '../components/BetsSection';

type FinishedBetsSectionProps = {
  refreshKey: number;
};

export default function FinishedBetsSection({ refreshKey }: FinishedBetsSectionProps) {
  const router = useRouter();
  const { bets, reload } = useFinishedBetsData();

  React.useEffect(() => {
    reload();
  }, [reload, refreshKey]);

  const preview = bets.slice(0, SECTION_PREVIEW_LIMIT);
  const showSeeAll = bets.length > SECTION_PREVIEW_LIMIT;

  return (
    <BetsSection
      title="Paris cloturés"
      showSeeAll={showSeeAll}
      onSeeAll={() => router.push('/home/finished-all')}
      isEmpty={bets.length === 0}
      emptyMessage="Aucun pari cloturé"
    >
      {preview.map((bet) => (
        <BetRow key={bet.id} title={bet.title} context={bet.context} deadline={bet.deadline} />
      ))}
    </BetsSection>
  );
}
