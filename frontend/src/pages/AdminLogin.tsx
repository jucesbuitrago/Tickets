import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { Eye, EyeOff } from 'lucide-react';

interface LoginFormData {
  email: string;
  password: string;
}

const AdminLogin: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const { login } = useAuth();
  const { post } = useApi();
  const navigate = useNavigate();

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    setError('');
    try {
      const response = await post('/login', data);
      const { token, user, requires_password_change } = (response.data as unknown) as { token: string; user: any; requires_password_change: boolean };

      login(user, token);

      if (requires_password_change) {
        navigate('/change-password');
      } else {
        navigate('/admin');
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-black to-red-600 flex-col justify-center items-center px-12">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-8">
          <span className="text-2xl font-bold text-red-600">UT</span>
        </div>
        <h1 className="text-4xl font-bold text-white text-center mb-4">
          TICKETS / GRADUADOS
        </h1>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center px-8 py-12 bg-white">
        {/* Mobile logo */}
        <div className="lg:hidden w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-8">
          <span className="text-xl font-bold text-white">UT</span>
        </div>

        {/* Back button */}
        <div className="w-full max-w-md mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center text-slate-600 hover:text-slate-900"
          >
            ← Salir
          </button>
        </div>

        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-slate-900 mb-2">BIENVENIDO</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                className="h-12 text-lg"
                {...register('email', { required: 'Email es requerido' })}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Contraseña"
                  className="h-12 text-lg pr-12"
                  {...register('password', { required: 'Contraseña es requerida' })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 text-lg font-semibold bg-black hover:bg-gray-800 text-white"
            >
              {loading ? 'Procesando...' : 'Proceder a mi cuenta'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;