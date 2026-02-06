import axios from 'axios';

// Get base URL from environment variable
const API_BASE_URL = import.meta.env.VITE_API_URL;

if (!API_BASE_URL) {
  console.warn('⚠️ VITE_API_URL is not set. Using localhost. Set env vars on Vercel!');
}

console.log('✅ Axios baseURL:', API_BASE_URL || 'http://localhost:8000');

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: API_BASE_URL || 'http://localhost:8000',
  withCredentials: true, // Always send cookies
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Ensure credentials are sent for all requests
    config.withCredentials = true;
    // Log the full URL for debugging
    console.log(`📤 ${config.method.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
axiosInstance.interceptors.response.use(
  (response) => {
    console.log(`✅ ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = error.response?.data?.message || 'An error occurred';
      const url = error.config?.url;

      console.error(`❌ ${status} ${url} - ${message}`);

      if (status === 404) {
        console.error('🔴 404 Not Found! Check your API endpoint URL.');
        console.error('Expected URL:', error.config?.baseURL + error.config?.url);
      }

      switch (status) {
        case 401:
          console.error('Unauthorized:', message);
          break;
        case 400:
          console.error('Bad request:', message);
          break;
        case 500:
          console.error('Server error:', message);
          break;
        default:
          console.error(`Error ${status}:`, message);
      }
    } else if (error.request) {
      // Request made but no response
      console.error('🔴 Network error - no response from server:', error.message);
    } else {
      // Error in request setup
      console.error('🔴 Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
