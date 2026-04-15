import { useCallback, useEffect, useState } from 'react';
import { User } from '@/domain/entities/User';
import { getAllUsersUseCase } from '@/domain/usecases/getAllUsers';
import { userRepository } from '@/infrastructure/db/repositories/user';

export function useAllUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAllUsersUseCase(userRepository);
      setUsers(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    reload: fetchUsers,
  };
}
