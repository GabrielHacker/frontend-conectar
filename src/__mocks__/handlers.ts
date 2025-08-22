// src/__mocks__/handlers.ts
import { rest } from 'msw';
import { User, Client, LoginResponse } from '../services/api';

const API_BASE_URL = 'https://conectarback.discloud.app';

// Mock data
const mockUsers: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@conectar.com',
    role: 'admin',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    lastLogin: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    name: 'Regular User',
    email: 'user@conectar.com',
    role: 'user',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    lastLogin: '2024-01-10T14:20:00Z'
  }
];

const mockClients: Client[] = [
  {
    id: '1',
    nomeNaFachada: 'Empresa A',
    cnpj: '12.345.678/0001-90',
    razaoSocial: 'Empresa A Ltda',
    cep: '12345-678',
    rua: 'Rua das Flores',
    numero: '123',
    bairro: 'Centro',
    cidade: 'São Paulo',
    estado: 'SP',
    status: 'ativo',
    userId: '2',
    user: mockUsers[1],
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z'
  },
  {
    id: '2',
    nomeNaFachada: 'Empresa B',
    cnpj: '98.765.432/0001-10',
    razaoSocial: 'Empresa B S/A',
    cep: '54321-876',
    rua: 'Av. Principal',
    numero: '456',
    bairro: 'Jardins',
    cidade: 'Rio de Janeiro',
    estado: 'RJ',
    status: 'ativo',
    userId: '2',
    user: mockUsers[1],
    createdAt: '2024-01-04T00:00:00Z',
    updatedAt: '2024-01-04T00:00:00Z'
  }
];

export const handlers = [
  // Auth endpoints
  rest.post(`${API_BASE_URL}/auth/login`, (req, res, ctx) => {
    const { email, password } = req.body as any;
    
    if (email === 'admin@conectar.com' && password === '123456') {
      const response: LoginResponse = {
        access_token: 'mock-admin-token',
        user: mockUsers[0]
      };
      return res(ctx.json(response));
    }
    
    if (email === 'user@conectar.com' && password === '123456') {
      const response: LoginResponse = {
        access_token: 'mock-user-token',
        user: mockUsers[1]
      };
      return res(ctx.json(response));
    }
    
    return res(
      ctx.status(401),
      ctx.json({ message: 'Credenciais inválidas' })
    );
  }),

  rest.post(`${API_BASE_URL}/auth/register`, (req, res, ctx) => {
    const { name, email, password } = req.body as any;
    
    // Simular email já em uso
    if (email === 'admin@conectar.com') {
      return res(
        ctx.status(400),
        ctx.json({ message: 'Email já está em uso' })
      );
    }
    
    const newUser: User = {
      id: String(mockUsers.length + 1),
      name,
      email,
      role: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockUsers.push(newUser);
    
    return res(
      ctx.json({
        message: 'User created successfully',
        user: newUser
      })
    );
  }),

  // Users endpoints
  rest.get(`${API_BASE_URL}/users`, (req, res, ctx) => {
    const url = new URL(req.url);
    const name = url.searchParams.get('name');
    const email = url.searchParams.get('email');
    const role = url.searchParams.get('role');
    
    let filteredUsers = [...mockUsers];
    
    if (name) {
      filteredUsers = filteredUsers.filter(user => 
        user.name.toLowerCase().includes(name.toLowerCase())
      );
    }
    
    if (email) {
      filteredUsers = filteredUsers.filter(user => 
        user.email.toLowerCase().includes(email.toLowerCase())
      );
    }
    
    if (role) {
      filteredUsers = filteredUsers.filter(user => user.role === role);
    }
    
    return res(ctx.json(filteredUsers));
  }),

  rest.get(`${API_BASE_URL}/users/notifications`, (req, res, ctx) => {
    const inactiveUsers = mockUsers.filter(user => {
      if (!user.lastLogin) return true;
      const lastLogin = new Date(user.lastLogin);
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      return lastLogin < thirtyDaysAgo;
    });
    
    return res(ctx.json({
      inactiveUsers: {
        count: inactiveUsers.length,
        users: inactiveUsers
      },
      totalUsers: mockUsers.length,
      lastUpdate: new Date().toISOString()
    }));
  }),

  rest.put(`${API_BASE_URL}/users/:id`, (req, res, ctx) => {
    const { id } = req.params;
    const userData = req.body as any;
    
    const userIndex = mockUsers.findIndex(user => user.id === id);
    if (userIndex === -1) {
      return res(
        ctx.status(404),
        ctx.json({ message: 'Usuário não encontrado' })
      );
    }
    
    mockUsers[userIndex] = {
      ...mockUsers[userIndex],
      ...userData,
      updatedAt: new Date().toISOString()
    };
    
    return res(ctx.json(mockUsers[userIndex]));
  }),

  rest.delete(`${API_BASE_URL}/users/:id`, (req, res, ctx) => {
    const { id } = req.params;
    
    const userIndex = mockUsers.findIndex(user => user.id === id);
    if (userIndex === -1) {
      return res(
        ctx.status(404),
        ctx.json({ message: 'Usuário não encontrado' })
      );
    }
    
    mockUsers.splice(userIndex, 1);
    return res(ctx.json({ message: 'Usuário excluído com sucesso' }));
  }),

  // Clients endpoints
  rest.get(`${API_BASE_URL}/clients`, (req, res, ctx) => {
    const url = new URL(req.url);
    const nomeNaFachada = url.searchParams.get('nomeNaFachada');
    const cnpj = url.searchParams.get('cnpj');
    const status = url.searchParams.get('status');
    const cidade = url.searchParams.get('cidade');
    
    let filteredClients = [...mockClients];
    
    if (nomeNaFachada) {
      filteredClients = filteredClients.filter(client => 
        client.nomeNaFachada.toLowerCase().includes(nomeNaFachada.toLowerCase())
      );
    }
    
    if (cnpj) {
      filteredClients = filteredClients.filter(client => 
        client.cnpj.includes(cnpj)
      );
    }
    
    if (status) {
      filteredClients = filteredClients.filter(client => client.status === status);
    }
    
    if (cidade) {
      filteredClients = filteredClients.filter(client => 
        client.cidade.toLowerCase().includes(cidade.toLowerCase())
      );
    }
    
    return res(ctx.json(filteredClients));
  }),

  rest.get(`${API_BASE_URL}/clients/:id`, (req, res, ctx) => {
    const { id } = req.params;
    const client = mockClients.find(c => c.id === id);
    
    if (!client) {
      return res(
        ctx.status(404),
        ctx.json({ message: 'Cliente não encontrado' })
      );
    }
    
    return res(ctx.json(client));
  }),

  rest.post(`${API_BASE_URL}/clients`, (req, res, ctx) => {
    const clientData = req.body as any;
    
    const newClient: Client = {
      id: String(mockClients.length + 1),
      ...clientData,
      userId: '2', // Assumindo usuário logado
      user: mockUsers[1],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockClients.push(newClient);
    return res(ctx.json(newClient));
  }),

  rest.patch(`${API_BASE_URL}/clients/:id`, (req, res, ctx) => {
    const { id } = req.params;
    const clientData = req.body as any;
    
    const clientIndex = mockClients.findIndex(client => client.id === id);
    if (clientIndex === -1) {
      return res(
        ctx.status(404),
        ctx.json({ message: 'Cliente não encontrado' })
      );
    }
    
    mockClients[clientIndex] = {
      ...mockClients[clientIndex],
      ...clientData,
      updatedAt: new Date().toISOString()
    };
    
    return res(ctx.json(mockClients[clientIndex]));
  }),

  rest.delete(`${API_BASE_URL}/clients/:id`, (req, res, ctx) => {
    const { id } = req.params;
    
    const clientIndex = mockClients.findIndex(client => client.id === id);
    if (clientIndex === -1) {
      return res(
        ctx.status(404),
        ctx.json({ message: 'Cliente não encontrado' })
      );
    }
    
    mockClients.splice(clientIndex, 1);
    return res(ctx.json({ message: 'Cliente excluído com sucesso' }));
  }),

  // Fallback para endpoints não mockados
  rest.get('*', (req, res, ctx) => {
    console.warn(`Endpoint não mockado: ${req.method} ${req.url.toString()}`);
    return res(
      ctx.status(404),
      ctx.json({ message: 'Endpoint não encontrado' })
    );
  }),
];

export { mockUsers, mockClients };