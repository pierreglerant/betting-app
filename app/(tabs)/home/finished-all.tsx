import React from 'react';
import BetRow from './components/BetRow';
import BetsAllScreenShell from './components/BetsAllScreenShell';
import { useFinishedBetsData } from './hooks/useBetQueries';

export default function FinishedAllScreen() {
  const { bets, reload } = useFinishedBetsData();

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
