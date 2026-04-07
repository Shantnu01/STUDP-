import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { auth, db, doc, getDoc } from '../lib/firebase';
import { onAuthStateChanged, signOut, signInWithEmailAndPassword } from 'firebase/auth';
import type { User } from 'firebase/auth';

interface UserProfile {
  displayName?: string;
  role?: string;
  schoolId?: string;
  [key: string]: unknown;
}

interface AuthContextType {
  user:     User | null;
  profile:  UserProfile | null;
  loading:  boolean;
  logout:   () => Promise<void>;
  login:    (e: string, p: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user,    setUser]    = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        if (u.email === 'admin@edusync.in') {
          window.location.href = 'http://localhost:3000';
          return;
        }

        // Fetch extended user info (role, schoolId)
        try {
          const userDoc = await getDoc(doc(db, 'users', u.uid));
          if (userDoc.exists()) {
            setProfile(userDoc.data() as UserProfile);
          } else {
            const adminDoc = await getDoc(doc(db, 'admins', u.uid));
            if (adminDoc.exists()) {
              setProfile(adminDoc.data() as UserProfile);
            } else {
              setProfile(null);
            }
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (e: string, p: string) => {
     await signInWithEmailAndPassword(auth, e, p);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
