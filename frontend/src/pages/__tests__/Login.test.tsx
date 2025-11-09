import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import Login from '../Login';
import { useAuth } from '../../hooks/useAuth';
import { useApi } from '../../hooks/useApi';

// Mock the hooks
jest.mock('../../hooks/useAuth');
jest.mock('../../hooks/useApi');

const mockLogin = jest.fn();
const mockPost = jest.fn();

(useAuth as jest.Mock).mockReturnValue({
  login: mockLogin,
});

(useApi as jest.Mock).mockReturnValue({
  post: mockPost,
});

// Mock react-router-dom's useNavigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const renderLogin = () => {
  return render(
    <BrowserRouter>
      <Login />
    </BrowserRouter>
  );
};

describe('Login Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders login form correctly', () => {
    renderLogin();

    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Enter your credentials to access your account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Login' })).toBeInTheDocument();
    expect(screen.getByText("Don't have an account? Register")).toBeInTheDocument();
  });

  it('shows validation errors for empty fields', async () => {
    renderLogin();

    const submitButton = screen.getByRole('button', { name: 'Login' });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Password is required')).toBeInTheDocument();
    });
  });

  it('submits form with valid data', async () => {
    const mockResponse = {
      data: {
        data: {
          token: 'test-token',
          user: { id: 1, email: 'test@example.com', role: 'GRADUANDO' },
          requires_password_change: false,
        },
      },
    };

    mockPost.mockResolvedValueOnce(mockResponse);

    renderLogin();

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: 'Login' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/login', {
        email: 'test@example.com',
        password: 'password123',
      });
      expect(mockLogin).toHaveBeenCalledWith(
        { id: 1, email: 'test@example.com', role: 'GRADUANDO' },
        'test-token'
      );
      expect(mockNavigate).toHaveBeenCalledWith('/graduate');
    });
  });

  it('navigates to change password for first login', async () => {
    const mockResponse = {
      data: {
        data: {
          token: 'test-token',
          user: { id: 1, email: 'test@example.com', role: 'GRADUANDO' },
          requires_password_change: true,
        },
      },
    };

    mockPost.mockResolvedValueOnce(mockResponse);

    renderLogin();

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: 'Login' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/change-password');
    });
  });

  it('navigates to correct route based on user role', async () => {
    const rolesAndRoutes = [
      { role: 'ADMIN', route: '/admin' },
      { role: 'STAFF', route: '/staff' },
      { role: 'GRADUANDO', route: '/graduate' },
      { role: 'UNKNOWN', route: '/' },
    ];

    for (const { role, route } of rolesAndRoutes) {
      const mockResponse = {
        data: {
          data: {
            token: 'test-token',
            user: { id: 1, email: 'test@example.com', role },
            requires_password_change: false,
          },
        },
      };

      mockPost.mockResolvedValueOnce(mockResponse);
      mockNavigate.mockClear();

      renderLogin();

      const emailInput = screen.getByPlaceholderText('Email');
      const passwordInput = screen.getByPlaceholderText('Password');
      const submitButton = screen.getByRole('button', { name: 'Login' });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith(route);
      });
    }
  });

  it('shows error message on login failure', async () => {
    const errorMessage = 'Invalid credentials';
    mockPost.mockRejectedValueOnce({
      response: {
        data: {
          error: errorMessage,
        },
      },
    });

    renderLogin();

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: 'Login' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('shows loading state during submission', async () => {
    mockPost.mockImplementation(() => new Promise(() => {})); // Never resolves

    renderLogin();

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: 'Login' });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Logging in...')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });
  });

  it('clears error on new submission', async () => {
    mockPost.mockRejectedValueOnce({
      response: {
        data: {
          error: 'First error',
        },
      },
    });

    renderLogin();

    const emailInput = screen.getByPlaceholderText('Email');
    const passwordInput = screen.getByPlaceholderText('Password');
    const submitButton = screen.getByRole('button', { name: 'Login' });

    // First failed attempt
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('First error')).toBeInTheDocument();
    });

    // Second attempt should clear the error
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByText('First error')).not.toBeInTheDocument();
    });
  });
});