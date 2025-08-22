import React, { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { AuthProvider } from '../../contexts/AuthContext';
import { AdminProvider } from '../../contexts/AdminContext';
import { UserProvider } from '../../contexts/UserContext';
import { User } from '../../services/api';

// Mock user data para testes
export const mockAdminUser: User = {
  id: '1',
  name: 'Admin User',
  email: 'admin@conectar.com',
  role: 'admin',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
  lastLogin: '2024-01-15T10:30:00Z'
};

export const mockRegularUser: User = {
  id: '2',
  name: 'Regular User',
  email: 'user@conectar.com',
  role: 'user',
  createdAt: '2024-01-02T00:00:00Z',
  updatedAt: '2024-01-02T00:00:00Z',
  lastLogin: '2024-01-10T14:20:00Z'
};

// Provider personalizado para testes
interface AllTheProvidersProps {
  children: React.ReactNode;
  initialUser?: User | null;
}

const AllTheProviders = ({ children, initialUser = null }: AllTheProvidersProps) => {
  // Mock do estado inicial do AuthContext
  React.useEffect(() => {
    if (initialUser) {
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify(initialUser));
    }
  }, [initialUser]);

  return (
    <AuthProvider>
      <AdminProvider>
        <UserProvider>
          {children}
        </UserProvider>
      </AdminProvider>
    </AuthProvider>
  );
};

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  initialUser?: User | null;
}

const customRender = (
  ui: ReactElement,
  { initialUser, ...renderOptions }: CustomRenderOptions = {}
) => {
  return render(ui, {
    wrapper: ({ children }) => (
      <AllTheProviders initialUser={initialUser}>
        {children}
      </AllTheProviders>
    ),
    ...renderOptions,
  });
};

// Função para simular login
export const mockLogin = (user: User) => {
  localStorage.setItem('token', 'mock-token');
  localStorage.setItem('user', JSON.stringify(user));
};

// Função para simular logout
export const mockLogout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

// Função para aguardar loading states
export const waitForLoadingToFinish = () => {
  return new Promise(resolve => setTimeout(resolve, 0));
};

// Mock de dados para formulários
export const mockClientFormData = {
  razaoSocial: 'Empresa Teste Ltda',
  cnpj: '12.345.678/0001-90',
  nomeNaFachada: 'Empresa Teste',
  rua: 'Rua das Flores',
  numero: '123',
  bairro: 'Centro',
  cidade: 'São Paulo',
  estado: 'SP',
  cep: '12345-678',
  telefone: '(11) 99999-9999',
  email: 'contato@empresateste.com',
  status: 'ativo' as const,
  observacoes: 'Observações de teste'
};

export const mockUserFormData = {
  name: 'Usuário Teste',
  email: 'teste@exemplo.com',
  password: '123456'
};

// Função para simular eventos de formulário
export const fillFormField = async (
  getByLabelText: any,
  userEvent: any,
  labelText: string,
  value: string
) => {
  const field = getByLabelText(labelText);
  await userEvent.clear(field);
  await userEvent.type(field, value);
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };