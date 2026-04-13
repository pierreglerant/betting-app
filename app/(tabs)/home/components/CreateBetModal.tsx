import { colors } from '@/constants/theme';
import { fonts } from '@/constants/typography';
import { supabase } from '@/libs/supabase';
import DateTimePicker from '@react-native-community/datetimepicker';
import React from 'react';
import { Button, Platform, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { UserLite } from '../types';
import BaseModal from './BaseModal';
import ModalTitle from './ModalTitle';

type CreateBetModalProps = {
  visible: boolean;
  onClose: () => void;
  creatorId: string;
  users: UserLite[];
  onCreated: () => void;
};

export default function CreateBetModal({
  visible,
  onClose,
  creatorId,
  users,
  onCreated,
}: CreateBetModalProps) {
  const [newTitle, setNewTitle] = React.useState('');
  const [newContext, setNewContext] = React.useState('');
  const [deadline, setDeadline] = React.useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = React.useState(false);
  const [selectedUsers, setSelectedUsers] = React.useState<string[]>([]);
  const [errors, setErrors] = React.useState({
    title: false,
    context: false,
  });

  const resetForm = () => {
    setNewTitle('');
    setNewContext('');
    setDeadline(null);
    setSelectedUsers([]);
    setErrors({ title: false, context: false });
    setShowDatePicker(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const toggleUser = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId],
    );
  };

  const handleCreateBet = async () => {
    const titleError = !newTitle.trim();
    const contextError = !newContext.trim();

    setErrors({
      title: titleError,
      context: contextError,
    });

    if (titleError || contextError) return;

    const { data: bet, error } = await supabase
      .from('bets')
      .insert({
        title: newTitle.trim(),
        context: newContext.trim(),
        deadline: deadline ? deadline.toISOString() : null,
        creator_id: creatorId,
        status: 'open',
      })
      .select()
      .single();

    if (error || !bet) {
      console.error('Error creating bet:', error);
      return;
    }

    if (selectedUsers.length > 0) {
      const tags = selectedUsers.map((userId) => ({
        bet_id: bet.id,
        user_id: userId,
      }));

      const { error: tagsError } = await supabase.from('bet_tags').insert(tags);

      if (tagsError) {
        console.error('Error creating bet tags:', tagsError);
      }
    }

    resetForm();
    onClose();
    onCreated();
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

      <Text
        style={{
          marginTop: 15,
          marginBottom: 5,
          color: colors.textMuted,
          fontFamily: fonts.medium,
        }}
      >
        Participants à exclure
      </Text>

      <ScrollView style={{ maxHeight: 150 }}>
        {users.map((u) => {
          const selected = selectedUsers.includes(u.id);

          return (
            <Pressable
              key={u.id}
              onPress={() => toggleUser(u.id)}
              style={{
                padding: 10,
                marginBottom: 5,
                backgroundColor: selected ? colors.primary : colors.cardSoft,
                borderRadius: 8,
              }}
            >
              <Text
                style={{
                  color: selected ? colors.text : colors.textMuted,
                  fontFamily: selected ? fonts.semiBold : fonts.regular,
                }}
              >
                {u.username}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={{ marginTop: 15 }}>
        <Button title="Créer" onPress={handleCreateBet} color={colors.primary} />
      </View>
    </BaseModal>
  );
}
