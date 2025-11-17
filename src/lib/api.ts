const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api'

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `${API_BASE_URL}/auth/login`,
    LOGOUT: `${API_BASE_URL}/auth/logout`,
    REGISTER: `${API_BASE_URL}/auth/register`,
  },
  PROJECTS: {
    BASE: `${API_BASE_URL}/projects`,
    BY_ID: (id: string) => `${API_BASE_URL}/projects/${id}`,
    REORDER: `${API_BASE_URL}/projects/reorder`,
    TOGGLE_VISIBILITY: (id: string) => `${API_BASE_URL}/projects/${id}/toggle-visibility`,
  }
}

export default API_BASE_URL