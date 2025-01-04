import React from "react";

import { useContext, createContext, type PropsWithChildren } from 'react';
import { useStorageState } from "@/hooks/useStorageState";
import { supabase } from "@/utils/supabase";
import { Alert } from "react-native";
import { useRouter } from "expo-router";

interface AuthContextType {
  signIn: (credentials: { email: string; password: string }) => Promise<void>;
  signOut: () => Promise<void>;
  session?: string | null;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  signIn: () => null,
  signOut: () => null,
  session: null,
  isLoading: false,
});

// This hook can be used to access the user info.
export function useSession() {
  const value = useContext(AuthContext);
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useSession must be wrapped in a <SessionProvider />');
    }
  }

  return value;
}



export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState("session");

  const router = useRouter()


  return (
    <AuthContext.Provider
      value={{
        signIn: async (credentials: { email: string; password: string }) => {
          try {
            const { error } = await supabase.auth.signInWithPassword(credentials);

            if (error) throw error;

            const { data } = await supabase.auth.getSession();
            setSession(JSON.stringify(data));

            setTimeout(() => {
              router.push("/(main)");
            }, 2000);
          } catch (error) {
            
            Alert.alert('Login Failed', 'Invalid email or password. Please try again.');
          }
        },
        signOut: async () => {
          try {
            let { error } = await supabase.auth.signOut()

            if(error) throw error
            
            setSession(null);

            
            
          } catch (error) {
            Alert.alert('Logout Failed', 'An error occurred while logging out. Please try again.');
          }
        },
        session,
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
