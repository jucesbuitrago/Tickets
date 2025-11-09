import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { useAuth } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';

interface ChangePasswordFormData {
  current_password: string;
  password: string;
  password_confirmation: string;
}

const ChangePassword: React.FC = () => {
  const { register, handleSubmit, formState: { errors }, watch } = useForm<ChangePasswordFormData>();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { user, logout } = useAuth();
  const { post } = useApi();
  const navigate = useNavigate();

  const password = watch('password');

  const onSubmit = async (data: ChangePasswordFormData) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await post('/change-password', data);
      setSuccess('Password changed successfully. You will be redirected to login.');
      setTimeout(() => {
        logout();
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Password change failed');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your password to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                type="password"
                placeholder="Current Password"
                {...register('current_password', { required: 'Current password is required' })}
              />
              {errors.current_password && <p className="text-red-500 text-sm">{errors.current_password.message}</p>}
            </div>
            <div>
              <Input
                type="password"
                placeholder="New Password"
                {...register('password', {
                  required: 'New password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' }
                })}
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
            </div>
            <div>
              <Input
                type="password"
                placeholder="Confirm New Password"
                {...register('password_confirmation', {
                  required: 'Password confirmation is required',
                  validate: value => value === password || 'Passwords do not match'
                })}
              />
              {errors.password_confirmation && <p className="text-red-500 text-sm">{errors.password_confirmation.message}</p>}
            </div>
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-500 text-sm">{success}</p>}
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Changing Password...' : 'Change Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChangePassword;