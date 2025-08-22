// src/__mocks__/api.ts
export const authAPI = {
  login: jest.fn().mockImplementation((email: string, password: string) => {
    if (email === 'admin@conectar.com' && password === '123456') {
      return Promise.resolve({
        access_token: 'mock-admin-token',
        user: {
          id: '1',
          name: 'Admin User',
          email: 'admin@conectar.com',
          role: 'admin',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-01T00:00:00Z'
        }
      });
    }
    
    if (email === 'user@conectar.com' && password === '123456') {
      return Promise.resolve({
        access_token: 'mock-user-token',
        user: {
          id: '2',
          name: 'Regular User',
          email: 'user@conectar.com',
          role: 'user',
          createdAt: '2024-01-02T00:00:00Z',
          updatedAt: '2024-01-02T00:00:00Z'
        }
      });
    }
    
    return Promise.reject(new Error('Credenciais inválidas'));
  }),

  register: jest.fn().mockImplementation((userData: any) => {
    if (userData.email === 'admin@conectar.com') {
      return Promise.reject(new Error('Email já está em uso'));
    }
    
    return Promise.resolve({
      message: 'User created successfully',
      user: {
        id: '3',
        name: userData.name,
        email: userData.email,
        role: 'user',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    });
  }),
};

export const usersAPI = {
  getAll: jest.fn().mockResolvedValue([]),
  getById: jest.fn().mockResolvedValue({}),
  update: jest.fn().mockResolvedValue({}),
  delete: jest.fn().mockResolvedValue({ message: 'User deleted' }),
  getNotifications: jest.fn().mockResolvedValue({
    inactiveUsers: { count: 0, users: [] },
    totalUsers: 2,
    lastUpdate: new Date().toISOString()
  }),
};

export const clientsAPI = {
  getAll: jest.fn().mockResolvedValue([]),
  getById: jest.fn().mockResolvedValue({}),
  create: jest.fn().mockResolvedValue({}),
  update: jest.fn().mockResolvedValue({}),
  delete: jest.fn().mockResolvedValue({ message: 'Client deleted' }),
};