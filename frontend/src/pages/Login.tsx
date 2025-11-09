import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';

interface LoginFormData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>();
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
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
        // Redirect based on role
        switch (user.role) {
          case 'ADMIN':
            navigate('/admin');
            break;
          case 'STAFF':
            navigate('/staff');
            break;
          case 'GRADUANDO':
            navigate('/graduate');
            break;
          default:
            navigate('/');
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-8 py-12">
      <Card className="w-full max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl">
        <CardHeader className="pb-8">
          <CardTitle className="text-3xl lg:text-4xl">Login</CardTitle>
          <CardDescription className="text-base lg:text-lg">Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 lg:text-base">Email</label>
              <Input
                type="email"
                placeholder="Enter your email"
                className="h-12 text-base lg:text-lg"
                {...register('email', { required: 'Email is required' })}
              />
              {errors.email && <p className="text-red-500 text-sm lg:text-base">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 lg:text-base">Password</label>
              <Input
                type="password"
                placeholder="Enter your password"
                className="h-12 text-base lg:text-lg"
                {...register('password', { required: 'Password is required' })}
              />
              {errors.password && <p className="text-red-500 text-sm lg:text-base">{errors.password.message}</p>}
            </div>
            {error && <p className="text-red-500 text-sm lg:text-base text-center">{error}</p>}
            <Button type="submit" disabled={loading} className="w-full h-12 text-base lg:text-lg font-semibold">
              {loading ? 'Logging in...' : 'Login'}
            </Button>
          </form>
          <div className="pt-4 text-center">
            <Link to="/register" className="text-blue-500 hover:underline text-sm lg:text-base">Don't have an account? Register</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;