import { colors } from '@/constants/theme';
import { supabase } from '@/libs/supabase';
import React from 'react';
import { Button, Text, TextInput, View } from 'react-native';
import { Bet, PredictionChoice } from '../types';
import BaseModal from './BaseModal';

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
  const [choice, setChoice] = React.useState<PredictionChoice | null>(null);
  const [amount, setAmount] = React.useState('');

  React.useEffect(() => {
    if (!visible) {
      setChoice(null);
      setAmount('');
    }
  }, [visible]);

  const handlePredict = async () => {
    if (!bet || !choice || !amount.trim()) return;

    const parsedAmount = parseInt(amount, 10);
    if (Number.isNaN(parsedAmount)) return;

    const { error } = await supabase.from('predictions').insert({
      bet_id: bet.id,
      user_id: userId,
      choice,
      amount: parsedAmount,
    });

    if (error) {
      console.error('Error creating prediction:', error);
      return;
    }

    onClose();
    onPredicted();
  };

  return (
    <BaseModal visible={visible} onClose={onClose} width="80%">
      <Text style={{ marginBottom: 10, fontWeight: 'bold', color: colors.text }}>
        Faire un pari
      </Text>

      {bet ? <Text style={{ marginBottom: 10, color: colors.textMuted }}>{bet.title}</Text> : null}

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Button title="Oui" onPress={() => setChoice('yes')} color={colors.success} />
        <Button title="Non" onPress={() => setChoice('no')} color={colors.danger} />
      </View>

      <Text style={{ marginTop: 10, color: colors.textMuted }}>
        Choix : {choice === 'yes' ? 'Oui' : choice === 'no' ? 'Non' : '-'}
      </Text>

      <TextInput
        placeholder="Montant"
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
        }}
        placeholderTextColor={colors.textMuted}
      />

      <View style={{ marginTop: 15 }}>
        <Button title="Valider" onPress={handlePredict} color={colors.primary} />
      </View>
    </BaseModal>
  );
}
