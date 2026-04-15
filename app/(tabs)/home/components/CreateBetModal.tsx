import { colors } from '@/constants/theme';
import { fonts } from '@/constants/typography';
import { useAuth } from '@/contexts/auth-context';
import { Bet as DomainBet } from '@/domain/entities/Bet';
import { useAllUsers } from '@/presentation/hooks/useAllUsers';
import { useCreateBet } from '@/presentation/hooks/useCreateBet';
import React from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import BaseModal from './BaseModal';
import ModalTitle from './ModalTitle';

/** Jour AAAA-MM-JJ + heure HH:mm optionnelle (si jour seul : fin de journée locale). */
function buildOptionalEndDate(dayStr: string, timeStr: string): Date | null {
  const day = dayStr.trim();
  if (!day) return null;

  const dm = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  if (!dm) return null;
  const y = Number(dm[1]);
  const mo = Number(dm[2]);
  const d = Number(dm[3]);

  const time = timeStr.trim();
  let hh = 23;
  let mm = 59;
  if (time) {
    const tm = /^(\d{1,2}):(\d{2})$/.exec(time);
    if (!tm) return null;
    hh = Number(tm[1]);
    mm = Number(tm[2]);
    if (hh < 0 || hh > 23 || mm < 0 || mm > 59) return null;
  }

  const date = new Date(y, mo - 1, d, hh, mm, 0, 0);
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return null;
  return date;
}

type CreateBetModalProps = {
  visible: boolean;
  onClose: () => void;
  onCreated: () => void;
};

export default function CreateBetModal({ visible, onClose, onCreated }: CreateBetModalProps) {
  const { user } = useAuth();
  const { users, loading: usersLoading, reload: reloadUsers } = useAllUsers();
  const { create, loading, error: createError } = useCreateBet();
  const [newTitle, setNewTitle] = React.useState('');
  const [newContext, setNewContext] = React.useState('');
  const [yesNoOptions, setYesNoOptions] = React.useState(true);
  const [selectedOptionUserIds, setSelectedOptionUserIds] = React.useState<string[]>([]);
  const [closingDay, setClosingDay] = React.useState('');
  const [closingTime, setClosingTime] = React.useState('');
  const [errors, setErrors] = React.useState({
    title: false,
    context: false,
    customOptions: false,
    closingDate: false,
  });
  const [sessionError, setSessionError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (visible && !yesNoOptions) {
      void reloadUsers();
    }
  }, [visible, yesNoOptions, reloadUsers]);

  const resetForm = () => {
    setNewTitle('');
    setNewContext('');
    setYesNoOptions(true);
    setSelectedOptionUserIds([]);
    setClosingDay('');
    setClosingTime('');
    setErrors({ title: false, context: false, customOptions: false, closingDate: false });
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

    setErrors({
      title: titleError,
      context: contextError,
      customOptions: false,
      closingDate: false,
    });

    if (titleError || contextError) return;

    let customOptionsError = false;
    let optionValues: string[] = [];

    if (yesNoOptions) {
      optionValues = ['Oui', 'Non'];
    } else {
      if (selectedOptionUserIds.length < 2) {
        customOptionsError = true;
      } else {
        optionValues = selectedOptionUserIds
          .map((id) => users.find((u) => u.id === id)?.username)
          .filter((s): s is string => !!s?.trim());
        if (optionValues.length < 2) customOptionsError = true;
      }
    }

    if (customOptionsError) {
      setErrors((e) => ({ ...e, customOptions: true }));
      setSessionError('Sélectionne au moins deux participants comme options.');
      return;
    }

    if (!user?.id) {
      setSessionError('Session invalide. Reconnecte-toi.');
      return;
    }

    const hasDay = !!closingDay.trim();
    const hasTime = !!closingTime.trim();
    if (hasTime && !hasDay) {
      setSessionError('Indique le jour de fermeture pour utiliser une heure.');
      return;
    }

    const endDate = buildOptionalEndDate(closingDay, closingTime);
    if (hasDay && !endDate) {
      setErrors((e) => ({ ...e, closingDate: true }));
      setSessionError('Date ou heure invalide (AAAA-MM-JJ, heure HH:mm).');
      return;
    }
    setErrors((e) => ({ ...e, closingDate: false }));

    const draftBet: DomainBet = {
      id: '',
      title: newTitle.trim(),
      context: newContext.trim(),
      endDate,
      isOpen: true,
      result: null,
      resultImageUrl: null,
      createdAt: new Date(),
    };

    try {
      await create(draftBet, optionValues, user.id);
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

      <Pressable
        onPress={() => {
          setYesNoOptions((v) => {
            const next = !v;
            if (next) setSelectedOptionUserIds([]);
            return next;
          });
          setSessionError(null);
          setErrors((e) => ({ ...e, customOptions: false }));
        }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 12,
        }}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: yesNoOptions }}
      >
        <View
          style={{
            width: 22,
            height: 22,
            marginRight: 10,
            borderWidth: 2,
            borderColor: errors.customOptions ? colors.danger : colors.border,
            borderRadius: 4,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: yesNoOptions ? colors.primary : 'transparent',
          }}
        >
          {yesNoOptions ? (
            <Text style={{ color: colors.text, fontSize: 13, fontFamily: fonts.semiBold }}>
              {'\u2713'}
            </Text>
          ) : null}
        </View>
        <Text style={{ fontFamily: fonts.medium, color: colors.text, flex: 1 }}>
          Choix Oui / Non
        </Text>
      </Pressable>

      {!yesNoOptions ? (
        <>
          <Text
            style={{
              marginBottom: 6,
              color: colors.textMuted,
              fontFamily: fonts.medium,
              fontSize: 13,
            }}
          >
            Options du pari (pseudos) — au moins 2
          </Text>
          <ScrollView
            style={{
              maxHeight: 160,
              marginBottom: 10,
              borderWidth: 1,
              borderColor: errors.customOptions ? colors.danger : colors.border,
              borderRadius: 8,
              backgroundColor: colors.cardSoft,
            }}
            nestedScrollEnabled
          >
            {usersLoading ? (
              <Text
                style={{
                  padding: 12,
                  color: colors.textMuted,
                  fontFamily: fonts.regular,
                }}
              >
                Chargement des utilisateurs…
              </Text>
            ) : users.length === 0 ? (
              <Text
                style={{
                  padding: 12,
                  color: colors.textMuted,
                  fontFamily: fonts.regular,
                }}
              >
                Aucun utilisateur chargé.
              </Text>
            ) : (
              users.map((u) => {
                const selected = selectedOptionUserIds.includes(u.id);
                return (
                  <Pressable
                    key={u.id}
                    onPress={() => {
                      setSelectedOptionUserIds((prev) =>
                        prev.includes(u.id) ? prev.filter((x) => x !== u.id) : [...prev, u.id],
                      );
                      setErrors((e) => ({ ...e, customOptions: false }));
                      setSessionError(null);
                    }}
                    style={{
                      padding: 12,
                      borderBottomWidth: 1,
                      borderBottomColor: colors.border,
                      backgroundColor: selected ? colors.primary : 'transparent',
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
              })
            )}
          </ScrollView>
        </>
      ) : null}

      <Text
        style={{
          marginBottom: 4,
          color: colors.textMuted,
          fontFamily: fonts.medium,
          fontSize: 13,
        }}
      >
        Jour de fermeture (optionnel)
      </Text>
      <TextInput
        placeholder="AAAA-MM-JJ"
        value={closingDay}
        onChangeText={setClosingDay}
        autoCapitalize="none"
        style={{
          borderWidth: 1,
          borderColor: errors.closingDate ? colors.danger : colors.border,
          padding: 10,
          marginBottom: 10,
          borderRadius: 8,
          backgroundColor: colors.cardSoft,
          color: colors.text,
          fontFamily: fonts.regular,
        }}
        placeholderTextColor={colors.textMuted}
      />

      <Text
        style={{
          marginBottom: 4,
          color: colors.textMuted,
          fontFamily: fonts.medium,
          fontSize: 13,
        }}
      >
        Heure de fermeture (optionnel)
      </Text>
      <TextInput
        placeholder="HH:mm"
        value={closingTime}
        onChangeText={setClosingTime}
        autoCapitalize="none"
        style={{
          borderWidth: 1,
          borderColor: errors.closingDate ? colors.danger : colors.border,
          padding: 10,
          marginBottom: 10,
          borderRadius: 8,
          backgroundColor: colors.cardSoft,
          color: colors.text,
          fontFamily: fonts.regular,
        }}
        placeholderTextColor={colors.textMuted}
      />

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
