import { colors } from '@/constants/theme';
import { fonts } from '@/constants/typography';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, Text } from 'react-native';
import { SECTION_PREVIEW_LIMIT } from '@/constants/bets';
import { useOpenBetsData } from '../hooks/useBetQueries';
import BetRow from '../components/BetRow';
import BetsSection from '../components/BetsSection';
import BetStatusBadge from '../components/BetStatusBadge';
import CreateBetModal from '../components/CreateBetModal';
import PredictBetModal from '../components/PredictBetModal';
import { Bet, BetUserStatus } from '../types';

type OpenBetsSectionProps = {
  userId: string;
  refreshKey: number;
  onDataChanged: () => void;
};

export default function OpenBetsSection({
  userId,
  refreshKey,
  onDataChanged,
}: OpenBetsSectionProps) {
  const router = useRouter();
  const { openBets, excludedSet, predictedSet, reload } = useOpenBetsData(userId);

  React.useEffect(() => {
    reload();
  }, [reload, refreshKey]);

  const [createModalVisible, setCreateModalVisible] = React.useState(false);
  const [predictionModalVisible, setPredictionModalVisible] = React.useState(false);
  const [currentBet, setCurrentBet] = React.useState<Bet | null>(null);

  const getStatus = (bet: Bet): BetUserStatus => {
    if (excludedSet.has(bet.id)) return 'excluded';
    if (predictedSet.has(bet.id)) return 'done';
    if (bet.deadline && new Date(bet.deadline) < new Date()) return 'late';
    return 'pending';
  };

  const handleCreated = () => {
    setCreateModalVisible(false);
    onDataChanged();
  };

  const handlePredicted = () => {
    setPredictionModalVisible(false);
    setCurrentBet(null);
    onDataChanged();
  };

  const preview = openBets.slice(0, SECTION_PREVIEW_LIMIT);
  const showSeeAll = openBets.length > SECTION_PREVIEW_LIMIT;

  return (
    <>
      <BetsSection
        title="Paris en cours"
        belowHeader={
          <Pressable
            onPress={() => setCreateModalVisible(true)}
            hitSlop={10}
            style={{ alignSelf: 'flex-start', marginLeft: 18 }}
          >
            <Text style={{ color: colors.primary, fontFamily: fonts.semiBold, fontSize: 14 }}>
              Créer un pari
            </Text>
          </Pressable>
        }
        showSeeAll={showSeeAll}
        onSeeAll={() => router.push('/home/open-bets-all')}
        isEmpty={openBets.length === 0}
        emptyMessage="Aucun pari en cours"
      >
        {preview.map((bet) => {
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
      </BetsSection>

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
  );
}
