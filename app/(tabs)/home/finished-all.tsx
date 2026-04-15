import { useAuth } from '@/contexts/auth-context';
import React from 'react';
import BetRow from './components/BetRow';
import BetsAllScreenShell from './components/BetsAllScreenShell';
import { useBetsBundle } from './hooks/useBetsBundle';

export default function FinishedAllScreen() {
  const { user } = useAuth();
  const { finishedBets: bets, reload } = useBetsBundle(user?.id, 0);

  return (
    <BetsAllScreenShell
      title="Paris cloturés"
      emptyMessage="Aucun pari cloturé"
      reload={reload}
      isEmpty={bets.length === 0}
    >
      {bets.map((bet) => (
        <BetRow key={bet.id} title={bet.title} context={bet.context} deadline={bet.deadline} />
      ))}
    </BetsAllScreenShell>
  );
}
