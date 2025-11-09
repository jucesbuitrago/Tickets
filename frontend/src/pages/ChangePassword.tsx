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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-8 py-12">
      <Card className="w-full max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl">
        <CardHeader className="pb-8">
          <CardTitle className="text-3xl lg:text-4xl">Change Password</CardTitle>
          <CardDescription className="text-base lg:text-lg">Update your password to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 lg:text-base">Current Password</label>
              <Input
                type="password"
                placeholder="Enter your current password"
                className="h-12 text-base lg:text-lg"
                {...register('current_password', { required: 'Current password is required' })}
              />
              {errors.current_password && <p className="text-red-500 text-sm lg:text-base">{errors.current_password.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 lg:text-base">New Password</label>
              <Input
                type="password"
                placeholder="Enter your new password"
                className="h-12 text-base lg:text-lg"
                {...register('password', {
                  required: 'New password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' }
                })}
              />
              {errors.password && <p className="text-red-500 text-sm lg:text-base">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 lg:text-base">Confirm New Password</label>
              <Input
                type="password"
                placeholder="Confirm your new password"
                className="h-12 text-base lg:text-lg"
                {...register('password_confirmation', {
                  required: 'Password confirmation is required',
                  validate: value => value === password || 'Passwords do not match'
                })}
              />
              {errors.password_confirmation && <p className="text-red-500 text-sm lg:text-base">{errors.password_confirmation.message}</p>}
            </div>
            {error && <p className="text-red-500 text-sm lg:text-base text-center">{error}</p>}
            {success && <p className="text-green-500 text-sm lg:text-base text-center">{success}</p>}
            <Button type="submit" disabled={loading} className="w-full h-12 text-base lg:text-lg font-semibold">
              {loading ? 'Changing Password...' : 'Change Password'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChangePassword;