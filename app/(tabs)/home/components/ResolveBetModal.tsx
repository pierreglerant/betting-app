import { colors } from '@/constants/theme';
import { fonts } from '@/constants/typography';
import { supabase } from '@/libs/supabase';
import React from 'react';
import { Button, Text, View } from 'react-native';
import { Bet } from '../types';
import BaseModal from './BaseModal';

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
  const resolveBet = async (result: 'yes' | 'no') => {
    if (!bet) return;

    const { error } = await supabase
      .from('bets')
      .update({
        status: 'resolved',
        result,
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

    const { error: betError } = await supabase.from('bets').delete().eq('id', bet.id);

    if (betError) {
      console.error('Error deleting bet:', betError);
      return;
    }

    onClose();
    onChanged();
  };

  return (
    <BaseModal visible={visible} onClose={onClose} width="80%">
      <Text style={{ marginBottom: 10, color: colors.text, fontFamily: fonts.bold }}>
        Gérer le pari
      </Text>

      {bet ? (
        <Text style={{ marginBottom: 15, color: colors.textMuted, fontFamily: fonts.medium }}>
          {bet.title}
        </Text>
      ) : null}

      <View style={{ marginBottom: 10 }}>
        <Button title="Résultat : Oui" onPress={() => resolveBet('yes')} color={colors.success} />
      </View>

      <View style={{ marginBottom: 10 }}>
        <Button title="Résultat : Non" onPress={() => resolveBet('no')} color={colors.primary} />
      </View>

      <Button title="Supprimer le pari" onPress={deleteBet} color={colors.danger} />
    </BaseModal>
  );
}
