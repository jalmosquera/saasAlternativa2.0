import api from './api';
import axios from 'axios';
import { env } from '@/config/env';

/**
 * Authentication service for handling user registration, login, and token management
 */
const authService = {
  /**
   * Register a new user
   */
  async register(userData) {
    const response = await axios.post(`${env.apiBaseUrl}/clients/`, userData);
    return response.data;
  },

  /**
   * Login user with username and password
   */
  async login(username, password) {
    // Get JWT tokens
    const tokenResponse = await axios.post(`${env.apiBaseUrl}/token/`, {
      username,
      password,
    });

    const { access, refresh } = tokenResponse.data;

    // Store tokens
    localStorage.setItem('access_token', access);
    localStorage.setItem('refresh_token', refresh);

    // Get user data
    const userResponse = await api.get('/me/');
    const user = userResponse.data;

    // Store user data
    localStorage.setItem('user', JSON.stringify(user));

    // ✅ IMPORTANTE: devolver la estructura que el AuthProvider espera
    return {
      token: access, // el nombre `token` debe existir
      user,
    };
  },

  /**
   * Logout user and clear tokens
   */
  logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  },

  /**
   * Get current user from localStorage
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        console.error('Error parsing user data:', error);
        return null;
      }
    }
    return null;
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    const token = localStorage.getItem('access_token');
    const user = this.getCurrentUser();
    return !!(token && user);
  },

  /**
   * Get access token
   */
  getAccessToken() {
    return localStorage.getItem('access_token');
  },

  /**
   * Get refresh token
   */
  getRefreshToken() {
    return localStorage.getItem('refresh_token');
  },

  /**
   * Refresh access token
   */
  async refreshToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await axios.post(`${env.apiBaseUrl}/token/refresh/`, {
      refresh: refreshToken,
    });

    const { access } = response.data;
    localStorage.setItem('access_token', access);

    return access;
  },
};

export default authService;
