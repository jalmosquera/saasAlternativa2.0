/**
 * Utility functions for authentication and JWT token management
 */

/**
 * Verifica si un token JWT está expirado
 * @param {string} token - Token JWT
 * @returns {boolean} - true si está expirado o inválido, false si es válido
 */
export const isTokenExpired = (token) => {
  if (!token) return true;

  try {
    // Decodificar el payload del JWT (segunda parte del token)
    const payload = JSON.parse(atob(token.split('.')[1]));

    // El campo 'exp' es un timestamp en segundos
    if (!payload.exp) return true;

    // Comparar con el tiempo actual (en segundos)
    const currentTime = Math.floor(Date.now() / 1000);
    return payload.exp < currentTime;
  } catch (error) {
    // Si hay error al decodificar, consideramos el token como inválido
    console.error('Error decodificando token:', error);
    return true;
  }
};

/**
 * Obtiene el token de localStorage
 * @returns {string|null} - Token o null
 */
export const getToken = () => {
  return localStorage.getItem('access_token');
};

/**
 * Obtiene los headers de autenticación con token JWT
 * @param {object} additionalHeaders - Headers adicionales a incluir
 * @returns {object} - Headers con Authorization si hay token
 */
export const getAuthHeaders = (additionalHeaders = {}) => {
  const token = localStorage.getItem('access_token');

  if (token) {
    return {
      'Authorization': `Bearer ${token}`,
      ...additionalHeaders,
    };
  }

  return {
    ...additionalHeaders,
  };
};

/**
 * Guarda el token en localStorage
 * @param {string} token - Token de acceso
 */
export const setAuthToken = (token) => {
  if (token) {
    localStorage.setItem('access_token', token);
  }
};

/**
 * Guarda el refresh token en localStorage
 * @param {string} token - Refresh token
 */
export const setRefreshToken = (token) => {
  if (token) {
    localStorage.setItem('refresh_token', token);
  }
};

/**
 * Obtiene el refresh token de localStorage
 * @returns {string|null} - Refresh token o null
 */
export const getRefreshToken = () => {
  return localStorage.getItem('refresh_token');
};

/**
 * Elimina el token de localStorage
 */
export const removeAuthToken = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

/**
 * Verifica si hay un token guardado y es válido
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('access_token');
  return token && !isTokenExpired(token);
};

/**
 * Decodifica un JWT sin verificar su firma (solo para leer el payload)
 * @param {string} token - Token JWT
 * @returns {object|null} - Payload del token o null si es inválido
 */
export const decodeToken = (token) => {
  try {
    if (!token) return null;
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload;
  } catch (error) {
    console.error('Error decodificando token:', error);
    return null;
  }
};

/**
 * Obtiene el ID del usuario del token
 * @returns {number|null} - ID del usuario o null
 */
export const getUserIdFromToken = () => {
  const token = localStorage.getItem('access_token');
  const payload = decodeToken(token);
  return payload?.user_id || null;
};
