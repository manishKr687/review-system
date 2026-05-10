import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { fetchMe } from '../api/auth';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { setAuth, logout } = useAuthStore();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const error = params.get('error');

    if (error || !token) {
      navigate('/login');
      return;
    }

    localStorage.setItem('rl_token', token);
    fetchMe()
      .then(user => {
        setAuth(user, token);
        navigate('/');
      })
      .catch(() => {
        logout();
        navigate('/login');
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-gray-500">Signing you in…</p>
      </div>
    </div>
  );
}
