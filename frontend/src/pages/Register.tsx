import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/Card';
import { useApi } from '../hooks/useApi';

interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
}

const Register: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { post } = useApi();
  const navigate = useNavigate();

  const onSubmit = async (data: RegisterFormData) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await post('/register', data);
      setSuccess(response.data.message || 'Registration successful.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      if (err.response?.status === 422 && err.response?.data?.errors) {
        // Handle validation errors
        const validationErrors = err.response.data.errors;
        if (validationErrors.email) {
          setError(validationErrors.email[0]);
        } else {
          setError('Validation failed');
        }
      } else {
        setError(err.response?.data?.message || err.response?.data?.error || 'Registration failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-8 py-12">
      <Card className="w-full max-w-md lg:max-w-lg xl:max-w-xl 2xl:max-w-2xl">
        <CardHeader className="pb-8">
          <CardTitle className="text-3xl lg:text-4xl">Register</CardTitle>
          <CardDescription className="text-base lg:text-lg">Create a new account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 lg:text-base">Name</label>
              <Input
                type="text"
                placeholder="Enter your full name"
                className="h-12 text-base lg:text-lg"
                {...register('name', { required: 'Name is required' })}
              />
              {errors.name && <p className="text-red-500 text-sm lg:text-base">{errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 lg:text-base">Email</label>
              <Input
                type="email"
                placeholder="Enter your email"
                className="h-12 text-base lg:text-lg"
                {...register('email', {
                  required: 'Email is required',
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: 'Invalid email address'
                  }
                })}
              />
              {errors.email && <p className="text-red-500 text-sm lg:text-base">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 lg:text-base">Password</label>
              <Input
                type="password"
                placeholder="Create a password"
                className="h-12 text-base lg:text-lg"
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 8,
                    message: 'Password must be at least 8 characters'
                  }
                })}
              />
              {errors.password && <p className="text-red-500 text-sm lg:text-base">{errors.password.message}</p>}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 lg:text-base">Confirm Password</label>
              <Input
                type="password"
                placeholder="Confirm your password"
                className="h-12 text-base lg:text-lg"
                {...register('password_confirmation', {
                  required: 'Please confirm your password',
                  validate: (value, formValues) => value === formValues.password || 'Passwords do not match'
                })}
              />
              {errors.password_confirmation && <p className="text-red-500 text-sm lg:text-base">{errors.password_confirmation.message}</p>}
            </div>
            {error && <p className="text-red-500 text-sm lg:text-base text-center">{error}</p>}
            {success && <p className="text-green-500 text-sm lg:text-base text-center">{success}</p>}
            <Button type="submit" disabled={loading} className="w-full h-12 text-base lg:text-lg font-semibold">
              {loading ? 'Registering...' : 'Register'}
            </Button>
          </form>
          <div className="pt-4 text-center">
            <Link to="/login" className="text-blue-500 hover:underline text-sm lg:text-base">Already have an account? Login</Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;