import { colors } from '@/constants/theme';
import { fonts } from '@/constants/typography';
import { useBetParticipants } from '@/presentation/hooks/useBetParticipants';
import React from 'react';
import { ActivityIndicator, Button, ScrollView, Text, View } from 'react-native';

import { Bet } from '../types';
import BaseModal from './BaseModal';
import ModalTitle from './ModalTitle';

type FinishedBetModalProps = {
  visible: boolean;
  bet: Bet | null;
  onClose: () => void;
};

function formatParticipantLine(optionValue: string | null, points: number, isCreator: boolean) {
  if (isCreator) {
    return 'Créateur du pari';
  }

  const choice = optionValue ?? 'option inconnue';
  return `${choice} · ${points} pts`;
}

export default function FinishedBetModal({ visible, bet, onClose }: FinishedBetModalProps) {
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

  return (
    <BaseModal visible={visible} onClose={onClose} width="84%">
      <ModalTitle title="Détail du pari" />

      {bet ? (
        <>
          <Text style={{ color: colors.text, fontFamily: fonts.semiBold, marginBottom: 6 }}>
            {bet.title}
          </Text>

          {bet.context ? (
            <Text style={{ color: colors.textMuted, fontFamily: fonts.regular, marginBottom: 12 }}>
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
              <Text style={{ color: colors.textMuted, fontFamily: fonts.regular, marginTop: 6 }}>
                Date de fin: {new Date(bet.deadline).toLocaleDateString()}
              </Text>
            ) : null}
          </View>

          <Text style={{ color: colors.text, fontFamily: fonts.semiBold, marginBottom: 8 }}>
            Historique des mises
          </Text>

          {loading ? (
            <ActivityIndicator color={colors.primary} style={{ marginVertical: 12 }} />
          ) : error ? (
            <Text style={{ color: colors.danger, fontFamily: fonts.medium, marginBottom: 12 }}>
              {error}
            </Text>
          ) : (
            <ScrollView style={{ maxHeight: 240 }} keyboardShouldPersistTaps="handled">
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

              {winners.map((participant) => (
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
                  <Text style={{ color: colors.success, fontFamily: fonts.regular, marginTop: 4 }}>
                    {formatParticipantLine(
                      participant.optionValue,
                      participant.points,
                      participant.isCreator,
                    )}
                  </Text>
                </View>
              ))}

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
                  style={{ color: colors.textMuted, fontFamily: fonts.regular, marginBottom: 12 }}
                >
                  Aucun pari enregistré pour l’instant.
                </Text>
              ) : null}

              {bettors.length > 0 && normalizedResult.length === 0 ? (
                <Text
                  style={{ color: colors.textMuted, fontFamily: fonts.regular, marginBottom: 12 }}
                >
                  Résultat non défini, impossible de distinguer gagnants et perdants.
                </Text>
              ) : null}
            </ScrollView>
          )}

          <View style={{ marginTop: 16 }}>
            <Button title="Fermer" onPress={onClose} color={colors.primary} />
          </View>
        </>
      ) : null}
    </BaseModal>
  );
}
