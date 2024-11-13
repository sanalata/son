import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coffee, User, Lock } from 'lucide-react';
import { useStore } from '../store/useStore';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (success) {
        // Get the updated user state after login
        const user = useStore.getState().user;
        if (user?.isAdmin) {
          navigate('/admin');
        } else {
          navigate('/menu');
        }
      } else {
        setError('Kullanıcı adı veya şifre hatalı');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Giriş yapılırken bir hata oluştu');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <div className="text-center mb-8">
          <Coffee className="w-12 h-12 mx-auto text-[#D4A574] mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Hoş Geldiniz</h2>
          <p className="text-gray-600 mt-2">Lütfen giriş yapın</p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-500 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kullanıcı Adı
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#D4A574] focus:border-[#D4A574]"
                placeholder="Kullanıcı adınızı girin"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Şifre
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-[#D4A574] focus:border-[#D4A574]"
                placeholder="Şifrenizi girin"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#D4A574] text-white py-2 px-4 rounded-lg hover:bg-[#2C1810] transition-colors disabled:opacity-50"
            disabled={isLoading}
          >
            {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Örnek kullanıcılar:</p>
          <p className="mt-1">Admin: admin / 123123</p>
          <p>Müşteri: ata / 123123</p>
        </div>
      </div>
    </div>
  );
}