import { createContext, useContext, useEffect, useState } from 'react';
import * as api from '../services/api';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null); const [loading, setLoading] = useState(true);
  useEffect(() => { api.getCurrentUser().then(({ user: currentUser }) => setUser(currentUser)).catch(() => setUser(null)).finally(() => setLoading(false)); }, []);
  const value = { user, loading, setCurrentUser: setUser, signIn: async (email, password) => { const data = await api.login(email, password); setUser(data.user); }, signOut: async () => { await api.logout(); setUser(null); } };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export const useAuth = () => useContext(AuthContext);
