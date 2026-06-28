/**
 * API service for the single Next.js server.
 * Talks to same-origin /api route handlers using the NextAuth session cookie.
 * (Django CSRF/session handling removed; auth is handled by NextAuth.)
 */
const API_BASE_URL = '/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /** Normalize endpoint: ensure leading slash, drop trailing slash (keep query). */
  _normalize(endpoint) {
    if (endpoint.startsWith('http')) return endpoint;
    let path = endpoint;
    let query = '';
    const q = path.indexOf('?');
    if (q !== -1) {
      query = path.slice(q);
      path = path.slice(0, q);
    }
    if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
    return `${this.baseURL}${path}${query}`;
  }

  async request(endpoint, options = {}) {
    const url = this._normalize(endpoint);
    const isFormData = options.body instanceof FormData;
    const headers = { ...(options.headers || {}) };
    if (
      options.body &&
      typeof options.body === 'string' &&
      !isFormData &&
      !headers['Content-Type']
    ) {
      headers['Content-Type'] = 'application/json';
    }

    const config = { ...options, headers, credentials: 'include' };

    try {
      const response = await fetch(url, config);

      if (response.status === 401) {
        localStorage.removeItem('authUser');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
        throw new Error('Unauthorized - Please login');
      }

      if (response.status === 204) return null;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Request failed' }));
        const errorMessage =
          errorData.message ||
          errorData.error ||
          errorData.detail ||
          `Request failed with status ${response.status}`;
        const error = new Error(errorMessage);
        error.response = errorData;
        error.status = response.status;
        throw error;
      }

      return await response.json();
    } catch (error) {
      console.error('API request error:', error);
      throw error;
    }
  }

  // Workflow methods
  async getWorkflows() {
    return this.request('/workflows/');
  }
  async getWorkflow(id) {
    return this.request(`/workflows/${id}/`);
  }
  async createWorkflow(workflowData) {
    return this.request('/workflows/', { method: 'POST', body: JSON.stringify(workflowData) });
  }
  async updateWorkflow(id, workflowData) {
    return this.request(`/workflows/${id}/`, { method: 'PUT', body: JSON.stringify(workflowData) });
  }
  async deleteWorkflow(id) {
    return this.request(`/workflows/${id}/`, { method: 'DELETE' });
  }
  async executeWorkflow(id, executionData) {
    return this.request(`/workflows/${id}/execute/`, {
      method: 'POST',
      body: JSON.stringify(executionData),
    });
  }

  // UI Builder Project methods
  async getUIProjects() {
    return this.request('/ui-projects/');
  }
  async getUIProject(id) {
    return this.request(`/ui-projects/${id}/`);
  }
  async createUIProject(projectData) {
    return this.request('/ui-projects/', { method: 'POST', body: JSON.stringify(projectData) });
  }
  async updateUIProject(id, projectData) {
    return this.request(`/ui-projects/${id}/`, { method: 'PUT', body: JSON.stringify(projectData) });
  }
  async deleteUIProject(id) {
    return this.request(`/ui-projects/${id}/`, { method: 'DELETE' });
  }

  // Credential methods
  async getCredentials() {
    return this.request('/credentials/');
  }
  async createCredential(credentialData) {
    return this.request('/credentials/', { method: 'POST', body: JSON.stringify(credentialData) });
  }

  // AI Chat (public endpoint)
  async aiChat(message, conversationHistory, settings) {
    return this.request('/ai-chat/', {
      method: 'POST',
      body: JSON.stringify({ message, conversation_history: conversationHistory, settings }),
    });
  }
}

export const apiService = new ApiService();
export default apiService;
