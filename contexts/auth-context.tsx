import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

interface User {
  username: string;
  id: string;
  email?: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  isSignedIn: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  login: (user: User) => Promise<void>;
  setUser: (user: User | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const setUser = async (userData: User | null) => {
    console.log('[auth] setUser:start', userData);

    try {
      if (userData) {
        await AsyncStorage.setItem('user', JSON.stringify(userData));
        console.log('[auth] setUser:stored');
      } else {
        await AsyncStorage.removeItem('user');
        console.log('[auth] setUser:removed');
      }

      setUserState(userData);
      console.log('[auth] setUser:state updated');
    } catch (e) {
      console.error('[auth] setUser:error', e);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      console.log('[auth] initAuth:start');

      try {
        const userData = await AsyncStorage.getItem('user');
        console.log('[auth] raw storage:', userData);

        if (!userData || userData === 'undefined') {
          console.log('[auth] no valid user in storage');
          return;
        }

        let parsed: User;

        try {
          parsed = JSON.parse(userData);
        } catch (e) {
          console.error('[auth] JSON parse error → clearing storage');
          await AsyncStorage.removeItem('user');
          return;
        }

        const safeUser: User = {
          id: parsed.id,
          username: parsed.username,
          email: parsed.email,
          avatar_url: parsed.avatar_url ?? undefined,
        };

        setUserState(safeUser);
        console.log('[auth] initAuth:setUser from storage', safeUser);

      } catch (e) {
        console.error('[auth] initAuth:error', e);
      } finally {
        setIsLoading(false);
        console.log('[auth] initAuth:done');
      }
    };

    initAuth();
  }, []);

  const login = async (userData: User) => {
    console.log('[auth] login:start', userData?.username);
    await setUser(userData);
    console.log('[auth] login:done');
  };

  const logout = async () => {
    console.log('[auth] logout:start');
    await setUser(null);
    console.log('[auth] logout:done');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isSignedIn: !!user,
        isLoading,
        logout,
        login,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}