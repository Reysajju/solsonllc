import { useState, useEffect } from 'react';

export const useAuth = () => {
  const [user, setUser] = useState<{ email: string; fullName: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage for user session
    const loadUserSession = () => {
      try {
        const session = localStorage.getItem('userSession');
        if (session) {
          const userData = JSON.parse(session);
          setUser(userData);
        }
      } catch (error) {
        console.error('Error loading user session:', error);
        localStorage.removeItem('userSession');
      } finally {
        setLoading(false);
      }
    };

    loadUserSession();
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
    try {
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      
      if (users[email] && users[email].password === encrypt(password)) {
        const session = { 
          email, 
          fullName: users[email].fullName,
          id: users[email].id || email // Use email as fallback ID
        };
        
        // Save session
        localStorage.setItem('userSession', JSON.stringify(session));
        
        // Save/update user profile
        const userProfile = {
          full_name: users[email].fullName,
          email: email,
          role: 'admin',
          company_name: 'Magnates Empire'
        };
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
        
        setUser(session);
        return { data: session, error: null };
      } else {
        return { data: null, error: { message: 'Invalid email or password' } };
      }
    } catch (error) {
      console.error('Sign in error:', error);
      return { data: null, error: { message: 'An error occurred during sign in' } };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    setLoading(true);
    try {
      const users = JSON.parse(localStorage.getItem('users') || '{}');
      
      if (users[email]) {
        return { data: null, error: { message: 'User already exists' } };
      }
      
      // Create user
      const userId = `user_${Date.now()}`;
      users[email] = { 
        password: encrypt(password), 
        fullName,
        id: userId,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('users', JSON.stringify(users));
      
      // Create session
      const session = { email, fullName, id: userId };
      localStorage.setItem('userSession', JSON.stringify(session));
      
      // Create user profile
      const userProfile = {
        full_name: fullName,
        email: email,
        role: 'admin',
        company_name: 'Magnates Empire'
      };
      localStorage.setItem('userProfile', JSON.stringify(userProfile));
      
      // Initialize empty data stores
      localStorage.setItem('clients', JSON.stringify([]));
      localStorage.setItem('invoices', JSON.stringify([]));
      
      setUser(session);
      return { data: session, error: null };
    } catch (error) {
      console.error('Sign up error:', error);
      return { data: null, error: { message: 'An error occurred during sign up' } };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      // Clear all user-related data
      localStorage.removeItem('userSession');
      localStorage.removeItem('userProfile');
      localStorage.removeItem('companySettings');
      localStorage.removeItem('sidebarCollapsed');
      
      setUser(null);
      return { error: null };
    } catch (error) {
      console.error('Sign out error:', error);
      return { error: { message: 'An error occurred during sign out' } };
    }
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
};