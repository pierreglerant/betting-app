import { useAuth } from '@/contexts/auth-context';
import React from 'react';
import BetRow from './components/BetRow';
import BetStatusBadge from './components/BetStatusBadge';
import BetsAllScreenShell from './components/BetsAllScreenShell';
import ResolveBetModal from './components/ResolveBetModal';
import { useMyLaunchedBetsData } from './hooks/useBetQueries';
import { Bet } from './types';

export default function MyLaunchedAllScreen() {
  const { user } = useAuth();
  const userId = user?.id;
  const { bets, reload } = useMyLaunchedBetsData(userId);

  const [manageModalVisible, setManageModalVisible] = React.useState(false);
  const [currentBet, setCurrentBet] = React.useState<Bet | null>(null);

  const handleChanged = () => {
    setManageModalVisible(false);
    setCurrentBet(null);
    reload();
  };

  if (!userId) {
    return null;
  }

  return (
    <BetsAllScreenShell
      title="Paris créés"
      emptyMessage="Aucun pari créé"
      reload={reload}
      isEmpty={bets.length === 0}
      footer={
        <ResolveBetModal
          visible={manageModalVisible}
          bet={currentBet}
          onClose={() => {
            setManageModalVisible(false);
            setCurrentBet(null);
          }}
          onChanged={handleChanged}
        />
      }
    >
      {bets.map((bet) => (
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
    </BetsAllScreenShell>
  );
}
