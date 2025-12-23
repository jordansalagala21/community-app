import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "firebase/auth";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";
import { auth } from "../lib/firebase";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);

      // Check if user is admin
      if (user) {
        console.log("Logged in user email:", user.email);

        // Define admin emails - ADD YOUR EMAIL HERE
        const adminEmails = [
          "admin@yourcommunity.com",
          "office@yourcommunity.com",
          // Add your email below:
          // "youremail@example.com",
        ];

        // Check if user is admin:
        // 1. Email is in the adminEmails list, OR
        // 2. Email contains "admin", OR
        // 3. TEMPORARY: Set to true to make ALL users admin (remove this in production!)
        const userIsAdmin =
          adminEmails.includes(user.email || "") ||
          user.email?.toLowerCase().includes("admin") ||
          true; // <- REMOVE THIS LINE in production to restrict access

        console.log("Is admin?", userIsAdmin);
        setIsAdmin(userIsAdmin);
      } else {
        setIsAdmin(false);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
