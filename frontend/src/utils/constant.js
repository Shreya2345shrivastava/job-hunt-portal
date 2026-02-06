const BASE_URL = import.meta.env.VITE_API_URL;
console.log("API Base URL:", BASE_URL);

// Use relative paths only - axiosInstance handles the base URL
export const USER_API_END_POINT = "/api/v1/user";
export const JOB_API_END_POINT = "/api/v1/job";
export const APPLICATION_API_END_POINT = "/api/v1/application";
export const COMPANY_API_END_POINT = "/api/v1/company";
