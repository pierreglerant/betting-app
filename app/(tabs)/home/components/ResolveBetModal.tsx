import { colors } from '@/constants/theme';
import { fonts } from '@/constants/typography';
import type { Option } from '@/domain/entities/Option';
import { useBetOptionsLoad } from '@/presentation/hooks/useBetOptionsLoad';
import { useManageBet } from '@/presentation/hooks/useManageBet';
import React from 'react';
import { ActivityIndicator, Button, Pressable, ScrollView, Text, View } from 'react-native';
import { Bet } from '../types';
import BaseModal from './BaseModal';
import ModalTitle from './ModalTitle';

type ResolveBetModalProps = {
  visible: boolean;
  bet: Bet | null;
  onClose: () => void;
  onChanged: () => void;
};

export default function ResolveBetModal({
  visible,
  bet,
  onClose,
  onChanged,
}: ResolveBetModalProps) {
  const {
    options,
    loading: optionsLoading,
    error: optionsError,
    load,
    reset,
  } = useBetOptionsLoad();
  const { resolve, remove, loading: actionLoading, error: actionError } = useManageBet();

  React.useEffect(() => {
    if (!visible || !bet?.id) {
      reset();
      return;
    }

    void load(bet.id);
  }, [visible, bet?.id, load, reset]);

  const resolveBet = async (winning: Option) => {
    if (!bet) return;

    try {
      await resolve(bet.id, winning.value);
      onClose();
      onChanged();
    } catch (error) {
      console.error('Error resolving bet:', error);
    }
  };

  const deleteBet = async () => {
    if (!bet) return;

    try {
      await remove(bet.id);
      onClose();
      onChanged();
    } catch (error) {
      console.error('Error deleting bet:', error);
    }
  };

  const disabledActions = optionsLoading || actionLoading;

  return (
    <BaseModal visible={visible} onClose={onClose} width="80%">
      <ModalTitle title="Gérer le pari" />

      {bet ? (
        <Text style={{ marginBottom: 15, color: colors.textMuted, fontFamily: fonts.medium }}>
          {bet.title}
        </Text>
      ) : null}

      <Text style={{ marginBottom: 8, color: colors.text, fontFamily: fonts.semiBold }}>
        Résultat gagnant
      </Text>

      {optionsLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: 12 }} />
      ) : optionsError ? (
        <Text style={{ color: colors.danger, fontFamily: fonts.medium, marginBottom: 8 }}>
          {optionsError}
        </Text>
      ) : (
        <ScrollView style={{ maxHeight: 260 }} keyboardShouldPersistTaps="handled">
          {options.map((opt) => (
            <Pressable
              key={opt.id}
              onPress={() => resolveBet(opt)}
              disabled={disabledActions}
              style={{
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 8,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.cardSoft,
                opacity: disabledActions ? 0.6 : 1,
              }}
            >
              <Text style={{ color: colors.text, fontFamily: fonts.medium }}>{opt.value}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      {actionError ? (
        <Text style={{ color: colors.danger, fontFamily: fonts.medium, marginTop: 10 }}>
          {actionError}
        </Text>
      ) : null}

      <View style={{ marginTop: 16 }}>
        <Button
          title={actionLoading ? 'Suppression...' : 'Supprimer le pari'}
          onPress={deleteBet}
          color={colors.danger}
          disabled={disabledActions}
        />
      </View>
    </BaseModal>
  );
}
