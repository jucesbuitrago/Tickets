import { useAuthStore } from '../stores/authStore';
import { useApi } from './useApi';

export const useAuth = () => {
  const { user, token, login, logout, isAuthenticated } = useAuthStore();
  const { post } = useApi();

  const logoutUser = async () => {
    try {
      await post('/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      logout();
    }
  };

  return {
    user,
    token,
    login,
    logout: logoutUser,
    isAuthenticated,
  };
};