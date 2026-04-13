import { supabase } from '@/libs/supabase';
import React from 'react';
import { Pressable } from 'react-native';
import BetRow from '../components/BetRow';
import BetsSection from '../components/BetsSection';
import BetStatusBadge from '../components/BetStatusBadge';
import ResolveBetModal from '../components/ResolveBetModal';
import { Bet } from '../types';

type MyLaunchedBetsSectionProps = {
  userId: string;
  refreshKey: number;
  onDataChanged: () => void;
};

export default function MyLaunchedBetsSection({
  userId,
  refreshKey,
  onDataChanged,
}: MyLaunchedBetsSectionProps) {
  const [bets, setBets] = React.useState<Bet[]>([]);
  const [manageModalVisible, setManageModalVisible] = React.useState(false);
  const [currentBet, setCurrentBet] = React.useState<Bet | null>(null);

  const fetchMyLaunchedBets = React.useCallback(async () => {
    const { data, error } = await supabase
      .from('bets')
      .select('*')
      .eq('creator_id', userId)
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching my launched bets:', error);
      return;
    }

    setBets(data || []);
  }, [userId]);

  React.useEffect(() => {
    const loadMyLaunchedBets = async () => {
      await fetchMyLaunchedBets();
    };

    loadMyLaunchedBets();
  }, [fetchMyLaunchedBets, refreshKey]);

  const handleChanged = () => {
    setManageModalVisible(false);
    setCurrentBet(null);
    onDataChanged();
  };

  return (
    <>
      <BetsSection
        title="Mes paris lancés"
        isEmpty={bets.length === 0}
        emptyMessage="Aucun pari lancé en cours"
      >
        {bets.map((bet) => (
          <BetRow
            key={bet.id}
            title={bet.title}
            context={bet.context}
            deadline={bet.deadline}
            rightElement={
              <Pressable
                onPress={() => {
                  setCurrentBet(bet);
                  setManageModalVisible(true);
                }}
              >
                <BetStatusBadge status="manage" />
              </Pressable>
            }
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
