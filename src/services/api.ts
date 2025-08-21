import axios from 'axios';

// Detectar ambiente automaticamente
const isDevelopment = false
const API_BASE_URL = isDevelopment 
  ? 'http://localhost:3000' 
  : 'https://conectarback.discloud.app';

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Importante para CORS
});

// Interceptor para adicionar token nas requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para debug
api.interceptors.request.use((config) => {
  console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, error);
    return Promise.reject(error);
  }
);

// Interfaces

export interface CreateClientDto {
  razaoSocial: string;
  cnpj: string;
  nomeNaFachada: string;
  rua?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  cidade: string;
  estado: string;
  cep?: string;
  telefone?: string;
  email?: string;
  website?: string;
  status: 'ativo' | 'inativo';
  observacoes?: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
}

export interface Client {
  id: string;
  nomeNaFachada: string;
  cnpj: string;
  razaoSocial: string;
  inscricaoEstadual?: string;
  inscricaoMunicipal?: string;
  cep: string;
  rua: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  telefone?: string;
  email?: string;
  website?: string;
  status: 'ativo' | 'inativo';
  observacoes?: string;
  userId: string;
  user?: User;
  createdAt: string;
  updatedAt: string;
}

export interface LoginResponse {
  access_token: string;
  user: User;
}

export interface NotificationData {
  inactiveUsers: {
    count: number;
    users: User[];
  };
  totalUsers: number;
  lastUpdate: string;
}

// Auth API
export const authAPI = {
  login: async (email: string, password: string): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    role?: 'admin' | 'user';
  }) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  seedUsers: async () => {
    const response = await api.post('/auth/seed');
    return response.data;
  },
};

// Users API
export const usersAPI = {
  getAll: async (filters?: {
    name?: string;
    email?: string;
    role?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }): Promise<User[]> => {
    const params = new URLSearchParams();
    
    if (filters?.name) params.append('name', filters.name);
    if (filters?.email) params.append('email', filters.email);
    if (filters?.role) params.append('role', filters.role);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.order) params.append('order', filters.order);

    const response = await api.get(`/users?${params.toString()}`);
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  getInactive: async (): Promise<User[]> => {
    const response = await api.get('/users/inactive');
    return response.data;
  },

  getNotifications: async (): Promise<NotificationData> => {
    const response = await api.get('/users/notifications');
    return response.data;
  },

  update: async (id: string, userData: {
    name?: string;
    email?: string;
    role?: 'admin' | 'user';
  }): Promise<User> => {
    const response = await api.put(`/users/${id}`, userData);
    return response.data;
  },

  updatePassword: async (id: string, passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<{ message: string }> => {
    const response = await api.put(`/users/${id}/password`, passwordData);
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/users/${id}`);
    return response.data;
  },
};

// Clients API
export const clientsAPI = {
  getAll: async (filters?: {
    nomeNaFachada?: string;
    cnpj?: string;
    status?: string;
    cidade?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }): Promise<Client[]> => {
    const params = new URLSearchParams();
    
    if (filters?.nomeNaFachada) params.append('nomeNaFachada', filters.nomeNaFachada);
    if (filters?.cnpj) params.append('cnpj', filters.cnpj);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.cidade) params.append('cidade', filters.cidade);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.order) params.append('order', filters.order);

    const response = await api.get(`/clients?${params.toString()}`);
    return response.data;
  },

  getById: async (id: string): Promise<Client> => {
    const response = await api.get(`/clients/${id}`);
    return response.data;
  },

  create: async (clientData: Omit<Client, 'id' | 'userId' | 'user' | 'createdAt' | 'updatedAt'>): Promise<Client> => {
    const response = await api.post('/clients', clientData);
    return response.data;
  },

  update: async (id: string, clientData: Partial<Client>): Promise<Client> => {
    const response = await api.patch(`/clients/${id}`, clientData);
    return response.data;
  },

  delete: async (id: string): Promise<{ message: string }> => {
    const response = await api.delete(`/clients/${id}`);
    return response.data;
  },

  getMyStats: async () => {
    const response = await api.get('/clients/my-stats');
    return response.data;
  },

  // Métodos para usuários regulares (seus clientes)
  getMyClients: async (filters?: {
    nomeNaFachada?: string;
    cnpj?: string;
    status?: string;
    cidade?: string;
    sortBy?: string;
    order?: 'asc' | 'desc';
  }): Promise<Client[]> => {
    const params = new URLSearchParams();
    
    if (filters?.nomeNaFachada) params.append('nomeNaFachada', filters.nomeNaFachada);
    if (filters?.cnpj) params.append('cnpj', filters.cnpj);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.cidade) params.append('cidade', filters.cidade);
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.order) params.append('order', filters.order);

    const response = await api.get(`/clients/my?${params.toString()}`);
    return response.data;
  },

  getAllForUser: async (userId: string, filters?: {
    nomeNaFachada?: string;
    cnpj?: string;
    status?: string;
    cidade?: string;
  }): Promise<Client[]> => {
    const params = new URLSearchParams();
    params.append('userId', userId);
    
    if (filters?.nomeNaFachada) params.append('nomeNaFachada', filters.nomeNaFachada);
    if (filters?.cnpj) params.append('cnpj', filters.cnpj);
    if (filters?.status) params.append('status', filters.status);
    if (filters?.cidade) params.append('cidade', filters.cidade);

    const response = await api.get(`/clients?${params.toString()}`);
    return response.data;
  },
};