const API_BASE_URL = 'http://localhost:3001/api';

class ApiClient {
  private getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const config: RequestInit = {
      headers: this.getAuthHeaders(),
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async getProfile() {
    return this.request('/auth/profile');
  }

  // User endpoints
  async createUser(userData: any) {
    return this.request('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getUsers() {
    return this.request('/users');
  }

  async getUser(id: string) {
    return this.request(`/users/${id}`);
  }

  async updateUser(id: string, userData: any) {
    return this.request(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(userData),
    });
  }

  // StableCoin endpoints
  async getStableCoins() {
    return this.request('/stable-coins');
  }

  async createStableCoin(stableCoinData: any) {
    return this.request('/stable-coins', {
      method: 'POST',
      body: JSON.stringify(stableCoinData),
    });
  }

  async getMyStableCoins() {
    return this.request('/stable-coins/my');
  }

  async getStableCoin(id: string) {
    return this.request(`/stable-coins/${id}`);
  }

  async mintToken(id: string, to: string, amount: string) {
    return this.request(`/stable-coins/${id}/mint`, {
      method: 'POST',
      body: JSON.stringify({ to, amount }),
    });
  }

  async burnToken(id: string, amount: string) {
    return this.request(`/stable-coins/${id}/burn`, {
      method: 'POST',
      body: JSON.stringify({ amount }),
    });
  }

  async toggleMinting(id: string) {
    return this.request(`/stable-coins/${id}/toggle-minting`, {
      method: 'PATCH',
    });
  }

  async toggleBurning(id: string) {
    return this.request(`/stable-coins/${id}/toggle-burning`, {
      method: 'PATCH',
    });
  }
}

export const apiClient = new ApiClient();
export default apiClient;