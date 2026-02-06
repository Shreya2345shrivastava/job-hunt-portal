import axios from 'axios';

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  withCredentials: true, // Always send cookies
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Ensure credentials are sent for all requests
    config.withCredentials = true;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for global error handling
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle different error scenarios
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      const message = error.response?.data?.message || 'An error occurred';

      switch (status) {
        case 401:
          // Unauthorized - likely JWT expired or invalid
          console.error('Unauthorized:', message);
          // Could add redirect to login here if needed
          break;
        case 400:
          // Bad request
          console.error('Bad request:', message);
          break;
        case 500:
          // Server error
          console.error('Server error:', message);
          break;
        default:
          console.error(`Error ${status}:`, message);
      }
    } else if (error.request) {
      // Request made but no response
      console.error('Network error - no response:', error.request);
    } else {
      // Error in request setup
      console.error('Error:', error.message);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
