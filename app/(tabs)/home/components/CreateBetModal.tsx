import { colors } from '@/constants/theme';
import { fonts } from '@/constants/typography';
import { useAuth } from '@/contexts/auth-context';
import { Bet as DomainBet } from '@/domain/entities/Bet';
import { useCreateBet } from '@/presentation/hooks/useCreateBet';
import DateTimePicker from '@react-native-community/datetimepicker';
import React from 'react';
import { Button, Platform, Pressable, Text, TextInput, View } from 'react-native';
import BaseModal from './BaseModal';
import ModalTitle from './ModalTitle';

type CreateBetModalProps = {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export default function CreateBetModal({ visible, onClose, onCreated }: CreateBetModalProps) {
  const { user } = useAuth();
  const { create, loading, error: createError } = useCreateBet();
  const [newTitle, setNewTitle] = React.useState('');
  const [newContext, setNewContext] = React.useState('');
  const [optionA, setOptionA] = React.useState('');
  const [optionB, setOptionB] = React.useState('');
  const [deadline, setDeadline] = React.useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [errors, setErrors] = React.useState({
    title: false,
    context: false,
    optionA: false,
    optionB: false,
  });
  const [sessionError, setSessionError] = React.useState<string | null>(null);

  const resetForm = () => {
    setNewTitle('');
    setNewContext('');
    setOptionA('');
    setOptionB('');
    setDeadline(null);
    setErrors({ title: false, context: false, optionA: false, optionB: false });
    setShowDatePicker(false);
    setSessionError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleCreateBet = async () => {
    setSessionError(null);

    const titleError = !newTitle.trim();
    const contextError = !newContext.trim();
    const optionAError = !optionA.trim();
    const optionBError = !optionB.trim();

    setErrors({
      title: titleError,
      context: contextError,
      optionA: optionAError,
      optionB: optionBError,
    });

    if (titleError || contextError || optionAError || optionBError) return;

    if (!user?.id) {
      setSessionError('Session invalide. Reconnecte-toi.');
      return;
    }

    const draftBet: DomainBet = {
      id: '',
      title: newTitle.trim(),
      context: newContext.trim(),
      endDate: deadline,
      isOpen: true,
      result: null,
      resultImageUrl: null,
      createdAt: new Date(),
    };

    try {
      await create(draftBet, [optionA.trim(), optionB.trim()], user.id);
      resetForm();
      onClose();
      onCreated();
    } catch {
      /* useCreateBet remplit `createError` */
    }
  };

  return (
    <BaseModal visible={visible} onClose={handleClose}>
      <ModalTitle title="Créer un pari" />

      <TextInput
        placeholder="Titre"
        value={newTitle}
        onChangeText={setNewTitle}
        style={{
          borderWidth: 1,
          borderColor: errors.title ? colors.danger : colors.border,
          padding: 10,
          marginBottom: 10,
          borderRadius: 8,
          backgroundColor: colors.cardSoft,
          color: colors.text,
          fontFamily: fonts.regular,
        }}
        placeholderTextColor={colors.textMuted}
      />

      <TextInput
        placeholder="Contexte"
        value={newContext}
        onChangeText={setNewContext}
        multiline
        style={{
          borderWidth: 1,
          borderColor: errors.context ? colors.danger : colors.border,
          padding: 10,
          height: 80,
          marginBottom: 10,
          borderRadius: 8,
          textAlignVertical: 'top',
          backgroundColor: colors.cardSoft,
          color: colors.text,
          fontFamily: fonts.regular,
        }}
        placeholderTextColor={colors.textMuted}
      />

      <TextInput
        placeholder="Option 1 (ex. Oui)"
        value={optionA}
        onChangeText={setOptionA}
        style={{
          borderWidth: 1,
          borderColor: errors.optionA ? colors.danger : colors.border,
          padding: 10,
          marginBottom: 10,
          borderRadius: 8,
          backgroundColor: colors.cardSoft,
          color: colors.text,
          fontFamily: fonts.regular,
        }}
        placeholderTextColor={colors.textMuted}
      />

      <TextInput
        placeholder="Option 2 (ex. Non)"
        value={optionB}
        onChangeText={setOptionB}
        style={{
          borderWidth: 1,
          borderColor: errors.optionB ? colors.danger : colors.border,
          padding: 10,
          marginBottom: 10,
          borderRadius: 8,
          backgroundColor: colors.cardSoft,
          color: colors.text,
          fontFamily: fonts.regular,
        }}
        placeholderTextColor={colors.textMuted}
      />

      <Button
        title={deadline ? deadline.toLocaleDateString() : 'Choisir une date'}
        onPress={() => setShowDatePicker(true)}
        color={colors.primary}
      />

      {showDatePicker ? (
        <DateTimePicker
          value={deadline || new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, date) => {
            setShowDatePicker(false);
            if (date) setDeadline(date);
          }}
        />
      ) : null}

      {sessionError || createError ? (
        <Text
          style={{
            color: colors.danger,
            marginTop: 10,
            fontFamily: fonts.medium,
          }}
        >
          {sessionError ?? createError}
        </Text>
      ) : null}

      <View style={{ marginTop: 15 }}>
        <Pressable
          onPress={() => {
            void handleCreateBet();
          }}
          disabled={loading}
          style={({ pressed }) => ({
            backgroundColor: colors.primary,
            paddingVertical: 14,
            borderRadius: 10,
            alignItems: 'center',
            opacity: loading ? 0.5 : pressed ? 0.88 : 1,
          })}
        >
          <Text style={{ color: colors.text, fontSize: 16, fontFamily: fonts.semiBold }}>
            {loading ? 'Création…' : 'Créer'}
          </Text>
        </Pressable>
      </View>
    </BaseModal>
  );
}
