import { colors } from '@/constants/theme';
import { fonts } from '@/constants/typography';
import { useAuth } from '@/contexts/auth-context';
import React from 'react';
import { Pressable, Text } from 'react-native';
import BetRow from './components/BetRow';
import BetStatusBadge from './components/BetStatusBadge';
import BetsAllScreenShell from './components/BetsAllScreenShell';
import CreateBetModal from './components/CreateBetModal';
import PredictBetModal from './components/PredictBetModal';
import { useOpenBetsData } from './hooks/useBetQueries';
import { Bet, BetUserStatus } from './types';

export default function OpenBetsAllScreen() {
  const { user } = useAuth();
  const userId = user?.id;
  const { openBets, excludedSet, predictedSet, reload } = useOpenBetsData(userId);

  const [createModalVisible, setCreateModalVisible] = React.useState(false);
  const [predictionModalVisible, setPredictionModalVisible] = React.useState(false);
  const [currentBet, setCurrentBet] = React.useState<Bet | null>(null);

  const getStatus = (bet: Bet): BetUserStatus => {
    if (!userId) return 'pending';
    if (excludedSet.has(bet.id)) return 'excluded';
    if (predictedSet.has(bet.id)) return 'done';
    if (bet.deadline && new Date(bet.deadline) < new Date()) return 'late';
    return 'pending';
  };

  const handleCreated = () => {
    setCreateModalVisible(false);
    reload();
  };

  const handlePredicted = () => {
    setPredictionModalVisible(false);
    setCurrentBet(null);
    reload();
  };

  if (!userId) {
    return null;
  }

  return (
    <BetsAllScreenShell
      title="Paris en cours"
      emptyMessage="Aucun pari en cours"
      reload={reload}
      isEmpty={openBets.length === 0}
      listHeader={
        <Pressable
          onPress={() => setCreateModalVisible(true)}
          hitSlop={10}
          style={{ alignSelf: 'flex-start', marginLeft: 12, marginBottom: 18 }}
        >
          <Text style={{ color: colors.primary, fontFamily: fonts.semiBold, fontSize: 14 }}>
            Créer un pari
          </Text>
        </Pressable>
      }
      footer={
        <>
          <CreateBetModal
            visible={createModalVisible}
            onClose={() => setCreateModalVisible(false)}
            onCreated={handleCreated}
          />
          <PredictBetModal
            visible={predictionModalVisible}
            bet={currentBet}
            userId={userId}
            onClose={() => {
              setPredictionModalVisible(false);
              setCurrentBet(null);
            }}
            onPredicted={handlePredicted}
          />
        </>
      }
    >
      {openBets.map((bet) => {
        const status = getStatus(bet);
        return (
          <BetRow
            key={bet.id}
            title={bet.title}
            context={bet.context}
            deadline={bet.deadline}
            rightElement={<BetStatusBadge status={status} />}
            onPress={
              status === 'pending'
                ? () => {
                    setCurrentBet(bet);
                    setPredictionModalVisible(true);
                  }
                : undefined
            }
          />
        );
      })}
    </BetsAllScreenShell>
  );
}
