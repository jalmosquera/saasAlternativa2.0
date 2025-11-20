import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import { AuthProvider } from '@shared/contexts/AuthContext';
import authService from '@shared/services/authService';

// Mock authService
vi.mock('@shared/services/authService', () => ({
  default: {
    getCurrentUser: vi.fn(),
    isAuthenticated: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    register: vi.fn(),
  },
}));

describe('ProtectedRoute', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const renderProtectedRoute = (allowedRoles = []) => {
    return render(
      <MemoryRouter initialEntries={['/protected']}>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<div>Login Page</div>} />
            <Route path="/" element={<div>Home Page</div>} />
            <Route
              path="/protected"
              element={
                <ProtectedRoute allowedRoles={allowedRoles}>
                  <div>Protected Content</div>
                </ProtectedRoute>
              }
            />
          </Routes>
        </AuthProvider>
      </MemoryRouter>
    );
  };

  it('should redirect to login when user is not authenticated', async () => {
    authService.getCurrentUser.mockReturnValue(null);
    authService.isAuthenticated.mockReturnValue(false);

    renderProtectedRoute();

    expect(await screen.findByText('Login Page')).toBeInTheDocument();
  });

  it('should render protected content when user is authenticated', async () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      role: 'client',
    };

    authService.getCurrentUser.mockReturnValue(mockUser);
    authService.isAuthenticated.mockReturnValue(true);
    localStorage.setItem('token', 'fake-token');

    renderProtectedRoute();

    expect(await screen.findByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect to home when user role is not allowed', async () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      role: 'client',
    };

    authService.getCurrentUser.mockReturnValue(mockUser);
    authService.isAuthenticated.mockReturnValue(true);
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', 'fake-token');

    renderProtectedRoute(['boss', 'employee']);

    expect(await screen.findByText('Home Page')).toBeInTheDocument();
  });

  it('should render protected content when user has allowed role', async () => {
    const mockUser = {
      id: 1,
      username: 'bossuser',
      role: 'boss',
    };

    authService.getCurrentUser.mockReturnValue(mockUser);
    authService.isAuthenticated.mockReturnValue(true);
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', 'fake-token');

    renderProtectedRoute(['boss', 'employee']);

    expect(await screen.findByText('Protected Content')).toBeInTheDocument();
  });

  it('should allow access when no roles are specified', async () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      role: 'client',
    };

    authService.getCurrentUser.mockReturnValue(mockUser);
    authService.isAuthenticated.mockReturnValue(true);
    localStorage.setItem('token', 'fake-token');

    renderProtectedRoute([]);

    expect(await screen.findByText('Protected Content')).toBeInTheDocument();
  });

  it('should use localStorage user when context user is not available', async () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      role: 'boss',
    };

    // Context returns null but localStorage has user
    authService.getCurrentUser.mockReturnValue(null);
    authService.isAuthenticated.mockReturnValue(false);
    localStorage.setItem('user', JSON.stringify(mockUser));
    localStorage.setItem('token', 'fake-token');

    renderProtectedRoute(['boss']);

    expect(await screen.findByText('Protected Content')).toBeInTheDocument();
  });
});
