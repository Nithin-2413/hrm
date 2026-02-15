// API utility with automatic session management
import axios from 'axios';
import { getSessionId } from './session';

// In production (Kubernetes/Emergent), use relative path /api
// Ingress automatically routes /api/* to backend:8001
// In local dev, use full URL with port
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
export const API_BASE = BACKEND_URL ? `${BACKEND_URL}/api` : '/api';

/**
 * Create an axios instance with session ID automatically included
 */
const apiClient = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add session ID to every request
apiClient.interceptors.request.use((config) => {
  config.headers['X-Session-ID'] = getSessionId();
  return config;
});

export default apiClient;
