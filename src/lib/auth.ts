export const auth = {
  setToken: (token: string) => {
    localStorage.setItem('token', token);
  },

  getToken: () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  removeToken: () => {
    localStorage.removeItem('token');
  },

  isAuthenticated: () => {
    return !!auth.getToken();
  },

  getCurrentUser: () => {
    try {
      const token = auth.getToken();
      if (!token) return null;

      // Parse JWT token to get user info
      const payload = JSON.parse(atob(token.split('.')[1]));

      return {
        id: payload.userId || payload.id || payload.sub,
        name: payload.name || payload.username || 'User',
        email: payload.email,
        // Add any other user fields you have in your token
      };
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }
};