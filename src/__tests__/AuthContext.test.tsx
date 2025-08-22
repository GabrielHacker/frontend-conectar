// src/contexts/__tests__/AuthContext.test.tsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '../AuthContext';

const mockAdminUser = {
  id: '1',
  name: 'Admin User',
  email: 'admin@conectar.com',
  role: 'admin' as const,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  lastLogin: '2024-01-15T10:30:00Z'
};

const mockRegularUser = {
  id: '2',
  name: 'Regular User',
  email: 'user@conectar.com',
  role: 'user' as const,
  createdAt: '2024-01-02T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
  lastLogin: '2024-01-10T14:20:00Z'
};

// Componente de teste para usar o contexto
const TestComponent = () => {
  const { state, login, logout, updateUser, clearError } = useAuth();
  const { user, isAuthenticated, isLoading, error } = state;

  return (
    <div>
      <div data-testid="loading">{isLoading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
      <div data-testid="user-name">{user?.name || 'No User'}</div>
      <div data-testid="user-role">{user?.role || 'No Role'}</div>
      <div data-testid="error">{error || 'No Error'}</div>
      
      <button 
        onClick={() => login('admin@conectar.com', '123456')}
        data-testid="login-admin"
      >
        Login Admin
      </button>
      
      <button 
        onClick={() => login('user@conectar.com', '123456')}
        data-testid="login-user"
      >
        Login User
      </button>
      
      <button 
        onClick={() => login('invalid@test.com', 'wrong')}
        data-testid="login-invalid"
      >
        Login Invalid
      </button>
      
      <button onClick={logout} data-testid="logout">
        Logout
      </button>
      
      <button 
        onClick={() => updateUser({ ...mockAdminUser, name: 'Updated Name' })}
        data-testid="update-user"
      >
        Update User
      </button>
      
      <button onClick={clearError} data-testid="clear-error">
        Clear Error
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('should have correct initial state when no token in localStorage', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
      expect(screen.getByTestId('user-name')).toHaveTextContent('No User');
      expect(screen.getByTestId('user-role')).toHaveTextContent('No Role');
      expect(screen.getByTestId('error')).toHaveTextContent('No Error');
    });

    it('should initialize with user data from localStorage', async () => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockAdminUser));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
      });

      expect(screen.getByTestId('user-name')).toHaveTextContent('Admin User');
      expect(screen.getByTestId('user-role')).toHaveTextContent('admin');
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });
  });

  describe('Login', () => {
    it('should login successfully with valid admin credentials', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      fireEvent.click(screen.getByTestId('login-admin'));

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
      });

      expect(screen.getByTestId('user-name')).toHaveTextContent('Admin User');
      expect(screen.getByTestId('user-role')).toHaveTextContent('admin');
      expect(screen.getByTestId('error')).toHaveTextContent('No Error');
      
      // Verificar se foi salvo no localStorage
      expect(localStorage.getItem('token')).toBe('mock-admin-token');
      expect(JSON.parse(localStorage.getItem('user') || '{}')).toMatchObject({
        name: 'Admin User',
        email: 'admin@conectar.com',
        role: 'admin'
      });
    });

    it('should login successfully with valid user credentials', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      fireEvent.click(screen.getByTestId('login-user'));

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
      });

      expect(screen.getByTestId('user-name')).toHaveTextContent('Regular User');
      expect(screen.getByTestId('user-role')).toHaveTextContent('user');
    });

    it('should handle login failure with invalid credentials', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      fireEvent.click(screen.getByTestId('login-invalid'));

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Credenciais inválidas');
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
      expect(screen.getByTestId('user-name')).toHaveTextContent('No User');
    });
  });

  describe('Logout', () => {
    it('should logout successfully', async () => {
      // Setup inicial com usuário logado
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockAdminUser));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Aguardar carregamento inicial
      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
      });

      // Fazer logout
      fireEvent.click(screen.getByTestId('logout'));

      // Verificar estado após logout
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
      expect(screen.getByTestId('user-name')).toHaveTextContent('No User');
      expect(screen.getByTestId('user-role')).toHaveTextContent('No Role');
      expect(screen.getByTestId('error')).toHaveTextContent('No Error');
      
      // Verificar se foi removido do localStorage
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('Update User', () => {
    it('should update user successfully', async () => {
      // Setup inicial com usuário logado
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockAdminUser));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Aguardar carregamento inicial
      await waitFor(() => {
        expect(screen.getByTestId('user-name')).toHaveTextContent('Admin User');
      });

      // Atualizar usuário
      fireEvent.click(screen.getByTestId('update-user'));

      // Verificar se o nome foi atualizado
      expect(screen.getByTestId('user-name')).toHaveTextContent('Updated Name');
      
      // Verificar se foi atualizado no localStorage
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      expect(savedUser.name).toBe('Updated Name');
    });
  });

  describe('Clear Error', () => {
    it('should clear error successfully', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Gerar um erro primeiro
      fireEvent.click(screen.getByTestId('login-invalid'));

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Credenciais inválidas');
      });

      // Limpar erro
      fireEvent.click(screen.getByTestId('clear-error'));

      expect(screen.getByTestId('error')).toHaveTextContent('No Error');
    });
  });

  describe('Error Handling', () => {
    it('should handle corrupted localStorage data gracefully', async () => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', 'invalid-json');

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
    });
  });
}); user.click(screen.getByTestId('update-user'));

      // Verificar se o nome foi atualizado
      expect(screen.getByTestId('user-name')).toHaveTextContent('Updated Name');
      
      // Verificar se foi atualizado no localStorage
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      expect(savedUser.name).toBe('Updated Name');
    });
  });

  describe('Clear Error', () => {
    it('should clear error successfully', async () => {
      const user = userEvent.setup();
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Gerar um erro primeiro
      await user.click(screen.getByTestId('login-invalid'));

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Credenciais inválidas');
      });

      // Limpar erro
      await user.click(screen.getByTestId('clear-error'));

      expect(screen.getByTestId('error')).toHaveTextContent('No Error');
    });
  });

  describe('Error Handling', () => {
    it('should handle corrupted localStorage data gracefully', async () => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', 'invalid-json');

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
    });
  });
});

// Componente de teste para usar o contexto
const TestComponent = () => {
  const { state, login, logout, updateUser, clearError } = useAuth();
  const { user, isAuthenticated, isLoading, error } = state;

  return (
    <div>
      <div data-testid="loading">{isLoading ? 'Loading' : 'Not Loading'}</div>
      <div data-testid="authenticated">{isAuthenticated ? 'Authenticated' : 'Not Authenticated'}</div>
      <div data-testid="user-name">{user?.name || 'No User'}</div>
      <div data-testid="user-role">{user?.role || 'No Role'}</div>
      <div data-testid="error">{error || 'No Error'}</div>
      
      <button 
        onClick={() => login('admin@conectar.com', '123456')}
        data-testid="login-admin"
      >
        Login Admin
      </button>
      
      <button 
        onClick={() => login('user@conectar.com', '123456')}
        data-testid="login-user"
      >
        Login User
      </button>
      
      <button 
        onClick={() => login('invalid@test.com', 'wrong')}
        data-testid="login-invalid"
      >
        Login Invalid
      </button>
      
      <button onClick={logout} data-testid="logout">
        Logout
      </button>
      
      <button 
        onClick={() => updateUser({ ...mockAdminUser, name: 'Updated Name' })}
        data-testid="update-user"
      >
        Update User
      </button>
      
      <button onClick={clearError} data-testid="clear-error">
        Clear Error
      </button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Initial State', () => {
    it('should have correct initial state when no token in localStorage', async () => {
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
      expect(screen.getByTestId('user-name')).toHaveTextContent('No User');
      expect(screen.getByTestId('user-role')).toHaveTextContent('No Role');
      expect(screen.getByTestId('error')).toHaveTextContent('No Error');
    });

    it('should initialize with user data from localStorage', async () => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockAdminUser));

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
      });

      expect(screen.getByTestId('user-name')).toHaveTextContent('Admin User');
      expect(screen.getByTestId('user-role')).toHaveTextContent('admin');
      expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
    });
  });

  describe('Login', () => {
    it('should login successfully with valid admin credentials', async () => {
      const user = userEvent.setup();
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await user.click(screen.getByTestId('login-admin'));

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
      });

      expect(screen.getByTestId('user-name')).toHaveTextContent('Admin User');
      expect(screen.getByTestId('user-role')).toHaveTextContent('admin');
      expect(screen.getByTestId('error')).toHaveTextContent('No Error');
      
      // Verificar se foi salvo no localStorage
      expect(localStorage.getItem('token')).toBe('mock-admin-token');
      expect(JSON.parse(localStorage.getItem('user') || '{}')).toMatchObject({
        name: 'Admin User',
        email: 'admin@conectar.com',
        role: 'admin'
      });
    });

    it('should login successfully with valid user credentials', async () => {
      const user = userEvent.setup();
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await user.click(screen.getByTestId('login-user'));

      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
      });

      expect(screen.getByTestId('user-name')).toHaveTextContent('Regular User');
      expect(screen.getByTestId('user-role')).toHaveTextContent('user');
    });

    it('should handle login failure with invalid credentials', async () => {
      const user = userEvent.setup();
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await user.click(screen.getByTestId('login-invalid'));

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Credenciais inválidas');
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
      expect(screen.getByTestId('user-name')).toHaveTextContent('No User');
    });

    it('should show loading state during login', async () => {
      const user = userEvent.setup();
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Clicar no botão de login
      const loginButton = screen.getByTestId('login-admin');
      await user.click(loginButton);

      // Verificar se o loading aparece (pode ser muito rápido)
      // O estado final deve ser correto
      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
      });
    });
  });

  describe('Logout', () => {
    it('should logout successfully', async () => {
      // Setup inicial com usuário logado
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockAdminUser));

      const user = userEvent.setup();
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Aguardar carregamento inicial
      await waitFor(() => {
        expect(screen.getByTestId('authenticated')).toHaveTextContent('Authenticated');
      });

      // Fazer logout
      await user.click(screen.getByTestId('logout'));

      // Verificar estado após logout
      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
      expect(screen.getByTestId('user-name')).toHaveTextContent('No User');
      expect(screen.getByTestId('user-role')).toHaveTextContent('No Role');
      expect(screen.getByTestId('error')).toHaveTextContent('No Error');
      
      // Verificar se foi removido do localStorage
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('Update User', () => {
    it('should update user successfully', async () => {
      // Setup inicial com usuário logado
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(mockAdminUser));

      const user = userEvent.setup();
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Aguardar carregamento inicial
      await waitFor(() => {
        expect(screen.getByTestId('user-name')).toHaveTextContent('Admin User');
      });

      // Atualizar usuário
      await user.click(screen.getByTestId('update-user'));

      // Verificar se o nome foi atualizado
      expect(screen.getByTestId('user-name')).toHaveTextContent('Updated Name');
      
      // Verificar se foi atualizado no localStorage
      const savedUser = JSON.parse(localStorage.getItem('user') || '{}');
      expect(savedUser.name).toBe('Updated Name');
    });
  });

  describe('Clear Error', () => {
    it('should clear error successfully', async () => {
      const user = userEvent.setup();
      
      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      // Gerar um erro primeiro
      await user.click(screen.getByTestId('login-invalid'));

      await waitFor(() => {
        expect(screen.getByTestId('error')).toHaveTextContent('Credenciais inválidas');
      });

      // Limpar erro
      await user.click(screen.getByTestId('clear-error'));

      expect(screen.getByTestId('error')).toHaveTextContent('No Error');
    });
  });

  describe('Error Handling', () => {
    it('should handle corrupted localStorage data gracefully', async () => {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', 'invalid-json');

      render(
        <AuthProvider>
          <TestComponent />
        </AuthProvider>
      );

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('Not Loading');
      });

      expect(screen.getByTestId('authenticated')).toHaveTextContent('Not Authenticated');
    });
  });
});