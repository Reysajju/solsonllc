import { useState, useEffect } from 'react';
export const useAuth = () => {
  const [user, setUser] = useState<{ email: string; fullName: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check localStorage for user session
    const session = localStorage.getItem('userSession');
    if (session) {
      setUser(JSON.parse(session));
    }
    setLoading(false);
  }, []);

  // Simple encryption (not secure for production)
  function encrypt(text: string) {
    return btoa(text.split('').reverse().join(''));
  }
  function decrypt(text: string) {
    return atob(text).split('').reverse().join('');
  }

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[email] && users[email].password === encrypt(password)) {
      const session = { email, fullName: users[email].fullName };
      localStorage.setItem('userSession', JSON.stringify(session));
      setUser(session);
      setLoading(false);
      return { data: session, error: null };
    } else {
      setLoading(false);
      return { data: null, error: { message: 'Invalid email or password' } };
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    const users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[email]) {
      setLoading(false);
      return { data: null, error: { message: 'User already exists' } };
    }
    users[email] = { password: encrypt(password), fullName };
    localStorage.setItem('users', JSON.stringify(users));
    const session = { email, fullName };
    localStorage.setItem('userSession', JSON.stringify(session));
    setUser(session);
    setLoading(false);
    return { data: session, error: null };
  };

  const signOut = async () => {
    localStorage.removeItem('userSession');
    setUser(null);
    return { error: null };
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
};