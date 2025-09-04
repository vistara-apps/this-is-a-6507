const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('authToken');
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  // Get authentication headers
  getAuthHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };
    
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    
    return headers;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const config = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request failed:', error);
      throw error;
    }
  }

  // Authentication methods
  async register(userData) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async login(credentials) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    if (response.token) {
      this.setToken(response.token);
    }
    
    return response;
  }

  async logout() {
    this.setToken(null);
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  async updateProfile(updates) {
    return this.request('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async getSubscriptionLimits() {
    return this.request('/auth/limits');
  }

  // Project methods
  async getProjects(page = 1, limit = 20) {
    return this.request(`/projects?page=${page}&limit=${limit}`);
  }

  async getProject(projectId) {
    return this.request(`/projects/${projectId}`);
  }

  async createProject(formData) {
    // For file uploads, don't set Content-Type header (let browser set it)
    const headers = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers,
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }

  async updateProject(projectId, updates) {
    return this.request(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteProject(projectId) {
    return this.request(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  }

  async getProjectAnalysis(projectId) {
    return this.request(`/projects/${projectId}/analysis`);
  }

  async reanalyzeProject(projectId) {
    return this.request(`/projects/${projectId}/reanalyze`, {
      method: 'POST',
    });
  }

  // Sample methods
  async getSamples(projectId) {
    return this.request(`/samples?projectId=${projectId}`);
  }

  async getSample(sampleId) {
    return this.request(`/samples/${sampleId}`);
  }

  async updateSample(sampleId, updates) {
    return this.request(`/samples/${sampleId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteSample(sampleId) {
    return this.request(`/samples/${sampleId}`, {
      method: 'DELETE',
    });
  }

  // Negotiation methods
  async getNegotiations() {
    return this.request('/negotiations');
  }

  async createNegotiation(negotiationData) {
    return this.request('/negotiations', {
      method: 'POST',
      body: JSON.stringify(negotiationData),
    });
  }

  async updateNegotiation(negotiationId, updates) {
    return this.request(`/negotiations/${negotiationId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async sendMessage(negotiationId, messageData) {
    return this.request(`/negotiations/${negotiationId}/messages`, {
      method: 'POST',
      body: JSON.stringify(messageData),
    });
  }

  async getMessages(negotiationId) {
    return this.request(`/negotiations/${negotiationId}/messages`);
  }

  // License Agreement methods
  async getLicenseAgreements() {
    return this.request('/license-agreements');
  }

  async createLicenseAgreement(agreementData) {
    return this.request('/license-agreements', {
      method: 'POST',
      body: JSON.stringify(agreementData),
    });
  }

  async updateLicenseAgreement(agreementId, updates) {
    return this.request(`/license-agreements/${agreementId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async signLicenseAgreement(agreementId) {
    return this.request(`/license-agreements/${agreementId}/sign`, {
      method: 'POST',
    });
  }

  // DMCA methods
  async getDMCATemplates() {
    return this.request('/dmca/templates');
  }

  async generateDMCAResponse(templateId, responseData) {
    return this.request('/dmca/generate-response', {
      method: 'POST',
      body: JSON.stringify({ templateId, ...responseData }),
    });
  }

  // Risk Assessment methods
  async getRiskAssessment(projectId) {
    return this.request(`/risk-assessment/${projectId}`);
  }

  async getBatchRiskAssessment(projectIds) {
    return this.request('/risk-assessment/batch', {
      method: 'POST',
      body: JSON.stringify({ projectIds }),
    });
  }

  // Utility methods
  isAuthenticated() {
    return !!this.token;
  }

  getToken() {
    return this.token;
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;
