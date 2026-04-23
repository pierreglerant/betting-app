import { useState } from 'react';

import type { UpdateProfileInput, UpdateProfileResult } from '@/domain/usecases/updateProfile';
import { updateProfileUseCase } from '@/domain/usecases/updateProfile';
import { profileRepository } from '@/infrastructure/db/repositories/profile';
import { avatarStorage } from '@/infrastructure/storage/avatar';

export function useUpdateProfile() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateProfile = async (input: UpdateProfileInput): Promise<UpdateProfileResult> => {
    try {
      setLoading(true);
      setError(null);

      return await updateProfileUseCase(profileRepository, avatarStorage, input);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    updateProfile,
    loading,
    error,
  };
}
