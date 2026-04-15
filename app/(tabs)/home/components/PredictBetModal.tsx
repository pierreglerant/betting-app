import { colors } from '@/constants/theme';
import { fonts } from '@/constants/typography';
import type { Option } from '@/domain/entities/Option';
import { useBetOptionsLoad } from '@/presentation/hooks/useBetOptionsLoad';
import { usePlaceBet } from '@/presentation/hooks/usePlaceBet';
import React from 'react';
import {
  ActivityIndicator,
  Button,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Bet } from '../types';
import BaseModal from './BaseModal';
import ModalTitle from './ModalTitle';

type PredictBetModalProps = {
  visible: boolean;
  bet: Bet | null;
  userId: string;
  onClose: () => void;
  onPredicted: () => void;
};

export default function PredictBetModal({
  visible,
  bet,
  userId,
  onClose,
  onPredicted,
}: PredictBetModalProps) {
  const {
    options,
    loading: optionsLoading,
    error: optionsError,
    load,
    reset,
  } = useBetOptionsLoad();
  const { place, loading: placeLoading, error: placeError } = usePlaceBet();
  const [selectedOption, setSelectedOption] = React.useState<Option | null>(null);
  const [amount, setAmount] = React.useState('');

  React.useEffect(() => {
    if (!visible || !bet?.id) {
      reset();
      setSelectedOption(null);
      setAmount('');
      return;
    }

    void load(bet.id);
  }, [visible, bet?.id, load, reset]);

  const handlePredict = async () => {
    if (!bet || !selectedOption || !amount.trim()) return;

    const parsedAmount = parseInt(amount, 10);
    if (Number.isNaN(parsedAmount) || parsedAmount <= 0) return;

    const optionId = Number(selectedOption.id);
    if (!Number.isFinite(optionId)) return;

    try {
      await place(userId, bet.id, optionId, parsedAmount);
    } catch {
      return;
    }

    onClose();
    onPredicted();
  };

  const selectedLabel = selectedOption?.value ?? '—';
  const busy = optionsLoading || placeLoading;

  return (
    <BaseModal visible={visible} onClose={onClose} width="80%">
      <ModalTitle title="Faire un pari" />

      {bet ? (
        <Text style={{ marginBottom: 10, color: colors.textMuted, fontFamily: fonts.medium }}>
          {bet.title}
        </Text>
      ) : null}

      {optionsLoading ? (
        <ActivityIndicator color={colors.primary} style={{ marginVertical: 12 }} />
      ) : optionsError ? (
        <Text style={{ color: colors.danger, fontFamily: fonts.medium, marginBottom: 8 }}>
          {optionsError}
        </Text>
      ) : (
        <ScrollView style={{ maxHeight: 220 }} keyboardShouldPersistTaps="handled">
          {options.map((opt, index) => {
            const selected = selectedOption != null && selectedOption.id === opt.id;
            return (
              <Pressable
                key={`${opt.id}-${index}`}
                onPress={() => setSelectedOption(opt)}
                style={{
                  paddingVertical: 10,
                  paddingHorizontal: 12,
                  borderRadius: 8,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: selected ? colors.primary : colors.border,
                  backgroundColor: selected ? colors.cardSoft : colors.card,
                }}
              >
                <Text style={{ color: colors.text, fontFamily: fonts.medium }}>{opt.value}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      <Text style={{ marginTop: 10, color: colors.textMuted, fontFamily: fonts.medium }}>
        Choix : {selectedLabel}
      </Text>

      {placeError ? (
        <Text style={{ color: colors.danger, fontFamily: fonts.medium, marginTop: 8 }}>
          {placeError}
        </Text>
      ) : null}

      <TextInput
        placeholder="Points"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
        style={{
          borderWidth: 1,
          borderColor: colors.border,
          marginTop: 10,
          padding: 10,
          borderRadius: 8,
          color: colors.text,
          backgroundColor: colors.cardSoft,
          fontFamily: fonts.regular,
        }}
        placeholderTextColor={colors.textMuted}
      />

      <View style={{ marginTop: 15 }}>
        <Button title="Valider" onPress={handlePredict} color={colors.primary} disabled={busy} />
      </View>
    </BaseModal>
  );
}
