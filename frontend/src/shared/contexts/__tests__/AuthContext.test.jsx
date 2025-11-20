import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';
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

describe('AuthContext', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    // Clear localStorage
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should throw error when useAuth is used outside AuthProvider', () => {
    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAuth());
    }).toThrow('useAuth must be used within an AuthProvider');

    consoleError.mockRestore();
  });

  it('should initialize with user from localStorage', async () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      role: 'client',
    };

    authService.getCurrentUser.mockReturnValue(mockUser);
    authService.isAuthenticated.mockReturnValue(true);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    // Wait for initialization
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('should initialize with no user when not authenticated', async () => {
    authService.getCurrentUser.mockReturnValue(null);
    authService.isAuthenticated.mockReturnValue(false);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toBe(null);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should login user successfully', async () => {
    authService.getCurrentUser.mockReturnValue(null);
    authService.isAuthenticated.mockReturnValue(false);

    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      role: 'client',
    };

    authService.login.mockResolvedValue({
      token: 'fake-token',
      user: mockUser,
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let loggedUser;
    await act(async () => {
      loggedUser = await result.current.login('testuser', 'password123');
    });

    expect(authService.login).toHaveBeenCalledWith('testuser', 'password123');
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(loggedUser).toEqual(mockUser);
  });

  it('should handle login error', async () => {
    authService.getCurrentUser.mockReturnValue(null);
    authService.isAuthenticated.mockReturnValue(false);

    const errorMessage = 'Invalid credentials';
    authService.login.mockRejectedValue({
      response: { data: { detail: errorMessage } },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await expect(
      act(async () => {
        await result.current.login('testuser', 'wrongpassword');
      })
    ).rejects.toThrow(errorMessage);

    expect(result.current.user).toBe(null);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should logout user successfully', async () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      role: 'client',
    };

    authService.getCurrentUser.mockReturnValue(mockUser);
    authService.isAuthenticated.mockReturnValue(true);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.user).toEqual(mockUser);

    act(() => {
      result.current.logout();
    });

    expect(authService.logout).toHaveBeenCalled();
    expect(result.current.user).toBe(null);
    expect(result.current.isAuthenticated).toBe(false);
  });

  it('should register user successfully', async () => {
    authService.getCurrentUser.mockReturnValue(null);
    authService.isAuthenticated.mockReturnValue(false);

    const newUserData = {
      username: 'newuser',
      email: 'new@example.com',
      password: 'password123',
    };

    const mockRegisteredUser = {
      id: 2,
      ...newUserData,
    };

    authService.register.mockResolvedValue(mockRegisteredUser);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    let registeredUser;
    await act(async () => {
      registeredUser = await result.current.register(newUserData);
    });

    expect(authService.register).toHaveBeenCalledWith(newUserData);
    expect(registeredUser).toEqual(mockRegisteredUser);
  });

  it('should handle registration error', async () => {
    authService.getCurrentUser.mockReturnValue(null);
    authService.isAuthenticated.mockReturnValue(false);

    const errorMessage = 'Username already exists';
    authService.register.mockRejectedValue({
      response: { data: { message: errorMessage } },
    });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    await expect(
      act(async () => {
        await result.current.register({
          username: 'existinguser',
          email: 'test@example.com',
          password: 'password123',
        });
      })
    ).rejects.toThrow(errorMessage);
  });

  it('should update user data', async () => {
    const mockUser = {
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      role: 'client',
    };

    authService.getCurrentUser.mockReturnValue(mockUser);
    authService.isAuthenticated.mockReturnValue(true);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const updatedUser = {
      ...mockUser,
      email: 'updated@example.com',
    };

    act(() => {
      result.current.updateUser(updatedUser);
    });

    expect(result.current.user).toEqual(updatedUser);
    expect(localStorage.getItem('user')).toBe(JSON.stringify(updatedUser));
  });

  it('should check user roles correctly', async () => {
    const mockBoss = {
      id: 1,
      username: 'boss',
      role: 'boss',
    };

    authService.getCurrentUser.mockReturnValue(mockBoss);
    authService.isAuthenticated.mockReturnValue(true);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.hasRole('boss')).toBe(true);
    expect(result.current.hasRole('client')).toBe(false);
    expect(result.current.isStaff()).toBe(true);
    expect(result.current.isClient()).toBe(false);
  });

  it('should identify employee as staff', async () => {
    const mockEmployee = {
      id: 2,
      username: 'employee',
      role: 'employee',
    };

    authService.getCurrentUser.mockReturnValue(mockEmployee);
    authService.isAuthenticated.mockReturnValue(true);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.hasRole('employee')).toBe(true);
    expect(result.current.isStaff()).toBe(true);
    expect(result.current.isClient()).toBe(false);
  });

  it('should identify client correctly', async () => {
    const mockClient = {
      id: 3,
      username: 'client',
      role: 'client',
    };

    authService.getCurrentUser.mockReturnValue(mockClient);
    authService.isAuthenticated.mockReturnValue(true);

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.hasRole('client')).toBe(true);
    expect(result.current.isStaff()).toBe(false);
    expect(result.current.isClient()).toBe(true);
  });
});
