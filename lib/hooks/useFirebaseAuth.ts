import { useCallback, useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User,
} from "firebase/auth";

interface UseFirebaseAuthResult {
  user: User | null;
  isAuthenticating: boolean;
  isProcessingAuthAction: boolean;
  authError: Error | null;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
}

function toError(error: unknown, fallbackMessage: string) {
  return error instanceof Error ? error : new Error(fallbackMessage);
}

export function useFirebaseAuth(): UseFirebaseAuthResult {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(true);
  const [isProcessingAuthAction, setIsProcessingAuthAction] = useState(false);
  const [authError, setAuthError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      (currentUser) => {
        setUser(currentUser);
        setIsAuthenticating(false);
      },
      (error) => {
        setAuthError(toError(error, "Failed to check authentication state."));
        setIsAuthenticating(false);
      },
    );

    return unsubscribe;
  }, []);

  const signInWithGoogle = useCallback(async () => {
    setAuthError(null);
    setIsProcessingAuthAction(true);
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (error) {
      setAuthError(toError(error, "Unable to sign in with Google."));
    } finally {
      setIsProcessingAuthAction(false);
    }
  }, []);

  const signOutUser = useCallback(async () => {
    setAuthError(null);
    setIsProcessingAuthAction(true);
    try {
      await signOut(auth);
    } catch (error) {
      setAuthError(toError(error, "Unable to sign out right now."));
    } finally {
      setIsProcessingAuthAction(false);
    }
  }, []);

  return {
    user,
    isAuthenticating,
    isProcessingAuthAction,
    authError,
    signInWithGoogle,
    signOutUser,
  };
}
