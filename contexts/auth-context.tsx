import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

interface User {
  username: string;
  id: string;
  email?: string;
}

interface AuthContextType {
  user: User | null;
  isSignedIn: boolean;
  isLoading: boolean;
  logout: () => Promise<void>;
  login: (user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      console.log('[auth] initAuth:start');
      try {
        const userData = await AsyncStorage.getItem('user');
        console.log('[auth] initAuth:storage user =', userData);
        if (userData) {
          setUser(JSON.parse(userData));
          console.log('[auth] initAuth:setUser from storage');
        } else {
          console.log('[auth] initAuth:no user in storage');
        }
      } catch (e) {
        console.error('[auth] initAuth:error', e);
      } finally {
        setIsLoading(false);
        console.log('[auth] initAuth:done isLoading=false');
      }
    };

    initAuth();
  }, []);

  const login = async (userData: User) => {
    console.log('[auth] login:start user =', userData?.username);
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    const persistedUser = await AsyncStorage.getItem('user');
    console.log('[auth] login:storage user after set =', persistedUser);
    setUser(userData);
    console.log('[auth] login:setUser done');
  };

  const logout = async () => {
    console.log('[auth] logout:start');
    const before = await AsyncStorage.getItem('user');
    console.log('[auth] logout:storage user before remove =', before);
    await AsyncStorage.removeItem('user');
    const after = await AsyncStorage.getItem('user');
    console.log('[auth] logout:storage user after remove =', after);
    setUser(null);
    console.log('[auth] logout:setUser null done');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isSignedIn: !!user,
        isLoading,
        logout,
        login,
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
