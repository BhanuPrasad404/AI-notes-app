// hooks/useCurrentUser.ts
import { useState, useEffect } from 'react';
import { auth } from '@/lib/auth';
import { api } from '@/lib/api';

export function useCurrentUser() {
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    avatarUrl?: string
  } | null>(null);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = auth.getToken();
      if (!token) return;

      try {
        // Fetch full user data including avatarUrl
        const response = await api.getCurrentUser(token);
        setUser(response.user); // This should include avatarUrl
      } catch (error) {
        console.error('Failed to fetch current user:', error);
        // Fallback to basic user data
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          setUser({
            id: payload.userId,
            name: payload.name || 'User',
            email: payload.email || ''
          });
        } catch (jwtError) {
          setUser({ id: '', name: 'User', email: '' });
        }
      }
    };

    fetchCurrentUser();
  }, []);

  return user;
}