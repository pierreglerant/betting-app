import { useState } from 'react';
import { getUserByUsernameUseCase } from '@/domain/usecases/getUserByUsername';
import { userRepository } from '@/infrastructure/db/repositories/user';
import { User } from '@/domain/entities/User';

export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loginByUsername = async (username: string): Promise<User> => {
    try {
      setLoading(true);
      setError(null);
      return await getUserByUsernameUseCase(userRepository, username);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Login failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    loginByUsername,
    loading,
    error,
  };
}
