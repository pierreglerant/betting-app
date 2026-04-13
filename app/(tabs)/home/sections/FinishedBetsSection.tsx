import { supabase } from '@/libs/supabase';
import React from 'react';
import BetRow from '../components/BetRow';
import BetsSection from '../components/BetsSection';
import BetStatusBadge from '../components/BetStatusBadge';
import { Bet } from '../types';

type FinishedBetsSectionProps = {
  refreshKey: number;
};

export default function FinishedBetsSection({ refreshKey }: FinishedBetsSectionProps) {
  const [bets, setBets] = React.useState<Bet[]>([]);

  const fetchFinishedBets = async () => {
    const { data, error } = await supabase
      .from('bets')
      .select('*')
      .eq('status', 'resolved')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching finished bets:', error);
      return;
    }

    setBets(data || []);
  };

  React.useEffect(() => {
    fetchFinishedBets();
  }, [refreshKey]);

  return (
    <BetsSection
      title="Paris cloturés"
      isEmpty={bets.length === 0}
      emptyMessage="Aucun pari cloturé"
    >
      {bets.map((bet) => (
        <BetRow
          key={bet.id}
          title={bet.title}
          context={bet.context}
          deadline={bet.deadline}
          rightElement={
            bet.result === 'yes' ? (
              <BetStatusBadge status="resolved_yes" />
            ) : bet.result === 'no' ? (
              <BetStatusBadge status="resolved_no" />
            ) : null
          }
        />
      ))}
    </BetsSection>
  );
}
