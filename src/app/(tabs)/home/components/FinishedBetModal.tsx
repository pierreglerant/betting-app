import { colors } from '@/constants/theme';
import { fonts } from '@/constants/typography';
import { useBetOptionsLoad } from '@/presentation/hooks/useBetOptionsLoad';
import { useBetParticipants } from '@/presentation/hooks/useBetParticipants';
import React from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { Bet } from '@/presentation/home/types';
import ModalTitle from './ModalTitle';

type FinishedBetModalProps = {
  visible: boolean;
  bet: Bet | null;
  onClose: () => void;
};

function roundToInt(value: number) {
  return Math.round(value);
}

function formatParticipantLine(optionValue: string | null, points: number, isCreator: boolean) {
  if (isCreator) {
    return 'Créateur du pari';
  }

  const choice = optionValue ?? 'option inconnue';
  return `${choice} · ${points} pts`;
}

export default function FinishedBetModal({ visible, bet, onClose }: FinishedBetModalProps) {
  const {
    options,
    loading: optionsLoading,
    error: optionsError,
    load: loadOptions,
    reset: resetOptions,
  } = useBetOptionsLoad();
  const { participants, loading, error } = useBetParticipants(visible ? bet?.id : undefined);
  const bettors = participants.filter((participant) => !participant.isCreator);
  const normalizedResult = (bet?.result ?? '').trim().toLowerCase();

  const winners = bettors.filter(
    (participant) =>
      normalizedResult.length > 0 &&
      (participant.optionValue ?? '').trim().toLowerCase() === normalizedResult,
  );

  const losers = bettors.filter(
    (participant) => !winners.some((winner) => winner.id === participant.id),
  );

  const totalWinnersStake = winners.reduce((sum, participant) => sum + participant.points, 0);
  const totalLosersStake = losers.reduce((sum, participant) => sum + participant.points, 0);

  const computeWinnerNetGain = (stake: number) => {
    if (totalWinnersStake <= 0 || totalLosersStake <= 0) {
      return 0;
    }

    return roundToInt((totalLosersStake * stake) / totalWinnersStake);
  };

  React.useEffect(() => {
    if (!visible || !bet?.id) {
      resetOptions();
      return;
    }

    void loadOptions(bet.id);
  }, [visible, bet?.id, loadOptions, resetOptions]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <Pressable style={StyleSheet.absoluteFillObject} onPress={onClose} />
        <View style={styles.sidePanel}>
          <ModalTitle title="Détail du pari" />

          {bet ? (
            <>
              <Text style={{ color: colors.text, fontFamily: fonts.semiBold, marginBottom: 6 }}>
                {bet.title}
              </Text>

              {bet.context ? (
                <Text
                  style={{ color: colors.textMuted, fontFamily: fonts.regular, marginBottom: 12 }}
                >
                  {bet.context}
                </Text>
              ) : null}

              <View
                style={{
                  borderWidth: 1,
                  borderColor: colors.border,
                  backgroundColor: colors.cardSoft,
                  borderRadius: 10,
                  padding: 12,
                  marginBottom: 12,
                }}
              >
                <Text style={{ color: colors.text, fontFamily: fonts.medium }}>
                  Résultat: {bet.result ?? 'Résultat indisponible'}
                </Text>
                {bet.deadline ? (
                  <Text
                    style={{ color: colors.textMuted, fontFamily: fonts.regular, marginTop: 6 }}
                  >
                    Date de fin: {new Date(bet.deadline).toLocaleDateString()}
                  </Text>
                ) : null}
              </View>

              <Text style={{ color: colors.text, fontFamily: fonts.semiBold, marginBottom: 8 }}>
                Options du pari
              </Text>

              {optionsLoading ? (
                <ActivityIndicator color={colors.primary} style={{ marginVertical: 12 }} />
              ) : optionsError ? (
                <Text
                  style={{
                    color: colors.danger,
                    fontFamily: fonts.medium,
                    marginBottom: 12,
                  }}
                >
                  {optionsError}
                </Text>
              ) : (
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: colors.border,
                    backgroundColor: colors.cardSoft,
                    borderRadius: 10,
                    padding: 12,
                    marginBottom: 12,
                  }}
                >
                  {options.map((option, index) => (
                    <View
                      key={option.id}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingVertical: 8,
                        borderBottomWidth: index === options.length - 1 ? 0 : 1,
                        borderBottomColor: colors.border,
                      }}
                    >
                      <Text style={{ color: colors.text, fontFamily: fonts.medium }}>
                        {option.value}
                      </Text>
                    </View>
                  ))}
                  {options.length === 0 ? (
                    <Text style={{ color: colors.textMuted, fontFamily: fonts.regular }}>
                      Aucune option disponible
                    </Text>
                  ) : null}
                </View>
              )}

              <Text style={{ color: colors.text, fontFamily: fonts.semiBold, marginBottom: 8 }}>
                Historique des mises
              </Text>

              {loading ? (
                <ActivityIndicator color={colors.primary} style={{ marginVertical: 12 }} />
              ) : error ? (
                <Text
                  style={{
                    color: colors.danger,
                    fontFamily: fonts.medium,
                    marginBottom: 12,
                  }}
                >
                  {error}
                </Text>
              ) : null}

              {!loading && !error ? (
                <ScrollView style={{ maxHeight: 300 }} keyboardShouldPersistTaps="handled">
                  {winners.length > 0 ? (
                    <Text
                      style={{
                        color: colors.success,
                        fontFamily: fonts.semiBold,
                        marginBottom: 8,
                      }}
                    >
                      Gagnants ({winners.length})
                    </Text>
                  ) : null}

                  {winners.map((participant) =>
                    (() => {
                      const netGain = computeWinnerNetGain(participant.points);
                      const grossReceived = participant.points + netGain;

                      return (
                        <View
                          key={participant.id}
                          style={{
                            borderWidth: 1,
                            borderColor: colors.success,
                            backgroundColor: colors.cardSoft,
                            borderRadius: 10,
                            paddingVertical: 10,
                            paddingHorizontal: 12,
                            marginBottom: 8,
                          }}
                        >
                          <Text style={{ color: colors.text, fontFamily: fonts.medium }}>
                            {participant.username}
                          </Text>
                          <Text
                            style={{
                              color: colors.success,
                              fontFamily: fonts.regular,
                              marginTop: 4,
                            }}
                          >
                            {formatParticipantLine(
                              participant.optionValue,
                              participant.points,
                              participant.isCreator,
                            )}
                          </Text>
                          <Text
                            style={{
                              color: colors.success,
                              fontFamily: fonts.semiBold,
                              marginTop: 4,
                            }}
                          >
                            Gain: +{netGain} pts · Total reçu: {grossReceived} pts
                          </Text>
                        </View>
                      );
                    })(),
                  )}

                  {losers.length > 0 ? (
                    <Text
                      style={{
                        color: colors.danger,
                        fontFamily: fonts.semiBold,
                        marginTop: winners.length > 0 ? 8 : 0,
                        marginBottom: 8,
                      }}
                    >
                      Perdants ({losers.length})
                    </Text>
                  ) : null}

                  {losers.map((participant) => (
                    <View
                      key={participant.id}
                      style={{
                        borderWidth: 1,
                        borderColor: colors.danger,
                        backgroundColor: colors.cardSoft,
                        borderRadius: 10,
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        marginBottom: 8,
                      }}
                    >
                      <Text style={{ color: colors.text, fontFamily: fonts.medium }}>
                        {participant.username}
                      </Text>
                      <Text
                        style={{ color: colors.textMuted, fontFamily: fonts.regular, marginTop: 4 }}
                      >
                        {formatParticipantLine(
                          participant.optionValue,
                          participant.points,
                          participant.isCreator,
                        )}
                      </Text>
                    </View>
                  ))}

                  {bettors.length === 0 ? (
                    <Text
                      style={{
                        color: colors.textMuted,
                        fontFamily: fonts.regular,
                        marginBottom: 12,
                      }}
                    >
                      Aucun pari effectué
                    </Text>
                  ) : null}

                  {bettors.length > 0 && normalizedResult.length === 0 ? (
                    <Text
                      style={{
                        color: colors.textMuted,
                        fontFamily: fonts.regular,
                        marginBottom: 12,
                      }}
                    >
                      Résultat non défini, impossible de distinguer gagnants et perdants.
                    </Text>
                  ) : null}
                </ScrollView>
              ) : null}

              <View style={{ marginTop: 16 }}>
                <Pressable
                  onPress={onClose}
                  style={({ pressed }) => ({
                    backgroundColor: colors.primary,
                    paddingVertical: 12,
                    borderRadius: 10,
                    alignItems: 'center',
                    opacity: pressed ? 0.88 : 1,
                  })}
                >
                  <Text style={{ color: colors.text, fontSize: 14, fontFamily: fonts.semiBold }}>
                    FERMER
                  </Text>
                </Pressable>
              </View>
            </>
          ) : null}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  sidePanel: {
    width: '86%',
    maxWidth: 460,
    height: '100%',
    backgroundColor: colors.card,
    borderLeftWidth: 1,
    borderLeftColor: colors.border,
    padding: 20,
    paddingTop: 28,
  },
});
