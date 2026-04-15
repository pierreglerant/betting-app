import { colors } from '@/constants/theme';
import { fonts } from '@/constants/typography';
import { supabase } from '@/libs/supabase';
import React from 'react';
import { ActivityIndicator, Button, Pressable, ScrollView, Text, View } from 'react-native';
import { Bet } from '../types';
import { fetchBetOptions, type BetOptionRow } from '../utils/fetchBetOptions';
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
  const [options, setOptions] = React.useState<BetOptionRow[]>([]);
  const [optionsLoading, setOptionsLoading] = React.useState(false);
  const [optionsError, setOptionsError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!visible || !bet?.id) {
      setOptions([]);
      setOptionsError(null);
      return;
    }

    let cancelled = false;
    setOptionsLoading(true);
    setOptionsError(null);

    void (async () => {
      const { options: next, error } = await fetchBetOptions(supabase, bet.id);
      if (cancelled) return;
      setOptionsLoading(false);
      if (error) {
        setOptionsError(error);
        setOptions([]);
        return;
      }
      setOptions(next);
    })();

    return () => {
      cancelled = true;
    };
  }, [visible, bet?.id]);

  const resolveBet = async (winning: BetOptionRow) => {
    if (!bet) return;

    const { error } = await supabase
      .from('bet')
      .update({
        result: winning.value,
        is_open: false,
      })
      .eq('id', bet.id);

    if (error) {
      console.error('Error resolving bet:', error);
      return;
    }

    onClose();
    onChanged();
  };

  const deleteBet = async () => {
    if (!bet) return;

    const { error: commentsError } = await supabase.from('comments').delete().eq('bet_id', bet.id);

    if (commentsError) {
      console.error('Error deleting comments:', commentsError);
      return;
    }

    const { error: predictionsError } = await supabase
      .from('predictions')
      .delete()
      .eq('bet_id', bet.id);

    if (predictionsError) {
      console.error('Error deleting predictions:', predictionsError);
      return;
    }

    const { error: tagsError } = await supabase.from('bet_tags').delete().eq('bet_id', bet.id);

    if (tagsError) {
      console.error('Error deleting bet tags:', tagsError);
      return;
    }

    const { error: betError } = await supabase.from('bet').delete().eq('id', bet.id);

    if (betError) {
      console.error('Error deleting bet:', betError);
      return;
    }

    onClose();
    onChanged();
  };

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
              style={{
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 8,
                marginBottom: 8,
                borderWidth: 1,
                borderColor: colors.border,
                backgroundColor: colors.cardSoft,
              }}
            >
              <Text style={{ color: colors.text, fontFamily: fonts.medium }}>{opt.value}</Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <View style={{ marginTop: 16 }}>
        <Button title="Supprimer le pari" onPress={deleteBet} color={colors.danger} />
      </View>
    </BaseModal>
  );
}
