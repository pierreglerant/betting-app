import { useRouter } from 'expo-router';
import React from 'react';
import { SECTION_PREVIEW_LIMIT } from '@/constants/bets';
import BetRow from '../components/BetRow';
import BetsSection from '../components/BetsSection';
import BetStatusBadge from '../components/BetStatusBadge';
import ResolveBetModal from '../components/ResolveBetModal';
import { Bet } from '@/presentation/home/types';

type MyLaunchedBetsSectionProps = {
  bets: Bet[];
  onDataChanged: () => void;
};

export default function MyLaunchedBetsSection({ bets, onDataChanged }: MyLaunchedBetsSectionProps) {
  const router = useRouter();

  const [manageModalVisible, setManageModalVisible] = React.useState(false);
  const [currentBet, setCurrentBet] = React.useState<Bet | null>(null);

  const handleChanged = () => {
    setManageModalVisible(false);
    setCurrentBet(null);
    onDataChanged();
  };

  const preview = bets.slice(0, SECTION_PREVIEW_LIMIT);
  const showSeeAll = bets.length > SECTION_PREVIEW_LIMIT;

  return (
    <>
      <BetsSection
        title="Paris créés"
        showSeeAll={showSeeAll}
        onSeeAll={() => router.push('/home/my-launched-all')}
        isEmpty={bets.length === 0}
        emptyMessage="Aucun pari créé"
      >
        {preview.map((bet) => (
          <BetRow
            key={bet.id}
            title={bet.title}
            context={bet.context}
            deadline={bet.deadline}
            rightElement={<BetStatusBadge status="manage" />}
            onPress={() => {
              setCurrentBet(bet);
              setManageModalVisible(true);
            }}
          />
        ))}
      </BetsSection>

      <ResolveBetModal
        visible={manageModalVisible}
        bet={currentBet}
        onClose={() => {
          setManageModalVisible(false);
          setCurrentBet(null);
        }}
        onChanged={handleChanged}
      />
    </>
  );
}
