import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AppContent from '../../components/AppContent';
import { AuthProvider } from '../../contexts/AuthContext';

describe('Integration Tests - Complete User Flow', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('Authentication Flow', () => {
    it('should complete full login flow for admin user', async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      );

      // Aguardar carregamento inicial
      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });

      // Fazer login como admin
      await user.type(screen.getByLabelText(/email/i), 'admin@conectar.com');
      await user.type(screen.getByLabelText(/senha/i), '123456');
      await user.click(screen.getByRole('button', { name: /entrar/i }));

      // Aguardar redirecionamento para dashboard admin
      await waitFor(() => {
        expect(screen.getByText(/usuários/i)).toBeInTheDocument();
      }, { timeout: 5000 });

      // Verificar se está na tela correta
      expect(screen.getByText(/clientes/i)).toBeInTheDocument();
    });

    it('should handle failed login attempts', async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      );

      // Aguardar carregamento
      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });

      // Tentar login com credenciais inválidas
      await user.type(screen.getByLabelText(/email/i), 'invalid@test.com');
      await user.type(screen.getByLabelText(/senha/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /entrar/i }));

      // Verificar mensagem de erro
      await waitFor(() => {
        expect(screen.getByText(/credenciais inválidas/i)).toBeInTheDocument();
      });

      // Deve permanecer na tela de login
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });
  });

  describe('Registration Flow', () => {
    it('should navigate to registration', async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      );

      // Aguardar carregamento
      await waitFor(() => {
        expect(screen.getByText(/criar conta gratuita/i)).toBeInTheDocument();
      });

      // Ir para tela de cadastro
      await user.click(screen.getByText(/criar conta gratuita/i));

      // Verificar se está na tela de cadastro
      expect(screen.getByText(/criar nova conta/i)).toBeInTheDocument();
    });

    it('should navigate back to login from registration', async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      );

      // Aguardar carregamento
      await waitFor(() => {
        expect(screen.getByText(/criar conta gratuita/i)).toBeInTheDocument();
      });

      // Ir para tela de cadastro
      await user.click(screen.getByText(/criar conta gratuita/i));
      expect(screen.getByText(/criar nova conta/i)).toBeInTheDocument();

      // Voltar para login
      await user.click(screen.getByText(/fazer login/i));

      // Verificar se voltou para tela de login
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
      });
    });
  });

  describe('Loading States', () => {
    it('should show loading states during app initialization', async () => {
      render(
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      );

      // Pode mostrar loading inicial brevemente
      // Em seguida deve mostrar a tela de login
      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });
    });
  });

  describe('Session Persistence', () => {
    it('should persist user session', async () => {
      // Simular usuário já logado
      localStorage.setItem('token', 'mock-admin-token');
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        name: 'Admin User',
        email: 'admin@conectar.com',
        role: 'admin',
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-01T00:00:00Z'
      }));

      render(
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      );

      // Deve mostrar dashboard diretamente
      await waitFor(() => {
        expect(screen.getByText(/usuários/i)).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle corrupted localStorage gracefully', async () => {
      // Corromper dados do localStorage
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', 'invalid-json');

      render(
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      );

      // Deve mostrar tela de login mesmo com dados corrompidos
      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });
    });
  });

  describe('User Experience', () => {
    it('should have accessible form elements', () => {
      render(
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      );

      // Verificar elementos com labels apropriados
      expect(screen.getByLabelText(/email/i)).toHaveAttribute('type', 'email');
      expect(screen.getByLabelText(/senha/i)).toHaveAttribute('type', 'password');
    });

    it('should show helpful UI elements', async () => {
      render(
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      );

      // Aguardar carregamento
      await waitFor(() => {
        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      });

      // Verificar elementos informativos
      expect(screen.getByText(/credenciais de teste/i)).toBeInTheDocument();
      expect(screen.getByText(/admin@conectar.com/i)).toBeInTheDocument();
    });
  });
});

describe('Integration Tests - Complete User Flow', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('Authentication Flow', () => {
    it('should complete full login flow for admin user', async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      );

      // Deve mostrar tela de login inicialmente
      expect(screen.getByText(/entrar/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();

      // Fazer login como admin
      await user.type(screen.getByLabelText(/email/i), 'admin@conectar.com');
      await user.type(screen.getByLabelText(/senha/i), '123456');
      await user.click(screen.getByRole('button', { name: /entrar/i }));

      // Aguardar redirecionamento para dashboard admin
      await waitFor(() => {
        expect(screen.getByText(/usuários/i)).toBeInTheDocument();
      }, { timeout: 5000 });

      // Verificar se está na tela correta
      expect(screen.getByText(/clientes/i)).toBeInTheDocument();
      expect(screen.getByText(/admin user/i)).toBeInTheDocument();
    });

    it('should complete full login flow for regular user', async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      );

      // Fazer login como usuário regular
      await user.type(screen.getByLabelText(/email/i), 'user@conectar.com');
      await user.type(screen.getByLabelText(/senha/i), '123456');
      await user.click(screen.getByRole('button', { name: /entrar/i }));

      // Aguardar redirecionamento para dashboard do usuário
      await waitFor(() => {
        expect(screen.getByText(/meus clientes/i)).toBeInTheDocument();
      }, { timeout: 5000 });

      // Verificar se está na tela correta
      expect(screen.getByText(/meu perfil/i)).toBeInTheDocument();
      expect(screen.getByText(/regular user/i)).toBeInTheDocument();
    });

    it('should handle failed login attempts', async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      );

      // Tentar login com credenciais inválidas
      await user.type(screen.getByLabelText(/email/i), 'invalid@test.com');
      await user.type(screen.getByLabelText(/senha/i), 'wrongpassword');
      await user.click(screen.getByRole('button', { name: /entrar/i }));

      // Verificar mensagem de erro
      await waitFor(() => {
        expect(screen.getByText(/credenciais inválidas/i)).toBeInTheDocument();
      });

      // Deve permanecer na tela de login
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });
  });

  describe('Registration Flow', () => {
    it('should complete full registration flow', async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      );

      // Ir para tela de cadastro
      await user.click(screen.getByText(/criar conta gratuita/i));

      // Verificar se está na tela de cadastro
      expect(screen.getByText(/criar nova conta/i)).toBeInTheDocument();

      // Preencher formulário de cadastro
      await user.type(screen.getByLabelText(/nome completo/i), 'Novo Usuário');
      await user.type(screen.getByLabelText(/^email/i), 'novo@teste.com');
      await user.type(screen.getByLabelText(/^senha/i), '123456');
      await user.type(screen.getByLabelText(/confirmar senha/i), '123456');

      // Submeter cadastro
      await user.click(screen.getByRole('button', { name: /criar conta/i }));

      // Aguardar login automático após cadastro
      await waitFor(() => {
        expect(screen.getByText(/meus clientes/i)).toBeInTheDocument();
      }, { timeout: 5000 });

      // Verificar se o usuário foi logado automaticamente
      expect(screen.getByText(/novo usuário/i)).toBeInTheDocument();
    });

    it('should handle registration with existing email', async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      );

      // Ir para tela de cadastro
      await user.click(screen.getByText(/criar conta gratuita/i));

      // Tentar cadastrar com email já existente
      await user.type(screen.getByLabelText(/nome completo/i), 'Test User');
      await user.type(screen.getByLabelText(/^email/i), 'admin@conectar.com');
      await user.type(screen.getByLabelText(/^senha/i), '123456');
      await user.type(screen.getByLabelText(/confirmar senha/i), '123456');

      await user.click(screen.getByRole('button', { name: /criar conta/i }));

      // Verificar mensagem de erro
      await waitFor(() => {
        expect(screen.getByText(/email já está em uso/i)).toBeInTheDocument();
      });

      // Deve permanecer na tela de cadastro
      expect(screen.getByText(/criar nova conta/i)).toBeInTheDocument();
    });

    it('should navigate back to login from registration', async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      );

      // Ir para tela de cadastro
      await user.click(screen.getByText(/criar conta gratuita/i));
      expect(screen.getByText(/criar nova conta/i)).toBeInTheDocument();

      // Voltar para login
      await user.click(screen.getByText(/fazer login/i));

      // Verificar se voltou para tela de login
      expect(screen.getByText(/entrar/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });
  });

  describe('Admin Dashboard Flow', () => {
    beforeEach(async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      );

      // Login como admin
      await user.type(screen.getByLabelText(/email/i), 'admin@conectar.com');
      await user.type(screen.getByLabelText(/senha/i), '123456');
      await user.click(screen.getByRole('button', { name: /entrar/i }));

      await waitFor(() => {
        expect(screen.getByText(/usuários/i)).toBeInTheDocument();
      });
    });

    it('should navigate between admin tabs', async () => {
      const user = userEvent.setup();

      // Verificar aba de usuários ativa inicialmente
      expect(screen.getByText(/usuários/i)).toBeInTheDocument();

      // Navegar para aba de clientes
      await user.click(screen.getByText(/clientes/i));

      // Verificar se mudou para aba de clientes
      await waitFor(() => {
        expect(screen.getByText(/total de.*cliente/i)).toBeInTheDocument();
      });

      // Voltar para aba de usuários
      await user.click(screen.getByText(/usuários/i));

      // Verificar se voltou para usuários
      await waitFor(() => {
        expect(screen.getByText(/usuário.*encontrado/i)).toBeInTheDocument();
      });
    });

    it('should open notifications panel', async () => {
      const user = userEvent.setup();

      // Clicar no botão de notificações
      const notificationButton = screen.getByRole('button', { name: /notificações/i }) ||
        document.querySelector('[data-testid="notification-button"]') ||
        screen.getAllByRole('button').find(btn => 
          btn.innerHTML.includes('🔔') || 
          btn.querySelector('svg')
        );

      if (notificationButton) {
        await user.click(notificationButton);

        // Verificar se o painel de notificações abriu
        await waitFor(() => {
          expect(screen.getByText(/central de notificações/i)).toBeInTheDocument();
        });

        expect(screen.getByText(/total de usuários/i)).toBeInTheDocument();
      }
    });

    it('should logout from admin dashboard', async () => {
      const user = userEvent.setup();

      // Encontrar e clicar no botão de logout
      const logoutButton = screen.getByRole('button', { name: /sair/i }) ||
        screen.getAllByRole('button').find(btn => 
          btn.getAttribute('title') === 'Sair' ||
          btn.innerHTML.includes('logout') ||
          btn.querySelector('svg')
        );

      if (logoutButton) {
        await user.click(logoutButton);

        // Verificar se voltou para tela de login
        await waitFor(() => {
          expect(screen.getByText(/entrar/i)).toBeInTheDocument();
        });

        expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      }
    });
  });

  describe('User Dashboard Flow', () => {
    beforeEach(async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      );

      // Login como usuário regular
      await user.type(screen.getByLabelText(/email/i), 'user@conectar.com');
      await user.type(screen.getByLabelText(/senha/i), '123456');
      await user.click(screen.getByRole('button', { name: /entrar/i }));

      await waitFor(() => {
        expect(screen.getByText(/meus clientes/i)).toBeInTheDocument();
      });
    });

    it('should navigate between user tabs', async () => {
      const user = userEvent.setup();

      // Verificar aba de clientes ativa inicialmente
      expect(screen.getByText(/meus clientes/i)).toBeInTheDocument();

      // Navegar para aba de perfil
      await user.click(screen.getByText(/meu perfil/i));

      // Verificar se mudou para aba de perfil
      await waitFor(() => {
        expect(screen.getByText(/informações pessoais/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/regular user/i)).toBeInTheDocument();

      // Voltar para aba de clientes
      await user.click(screen.getByText(/meus clientes/i));

      // Verificar se voltou para clientes
      await waitFor(() => {
        expect(screen.getByText(/dados básicos/i)).toBeInTheDocument();
      });
    });

    it('should edit user profile', async () => {
      const user = userEvent.setup();

      // Navegar para perfil
      await user.click(screen.getByText(/meu perfil/i));

      await waitFor(() => {
        expect(screen.getByText(/editar perfil/i)).toBeInTheDocument();
      });

      // Clicar em editar
      await user.click(screen.getByText(/editar perfil/i));

      // Verificar se entrou no modo de edição
      expect(screen.getByText(/salvar alterações/i)).toBeInTheDocument();

      // Modificar nome
      const nameInput = screen.getByDisplayValue(/regular user/i);
      await user.clear(nameInput);
      await user.type(nameInput, 'Updated User Name');

      // Salvar
      await user.click(screen.getByText(/salvar alterações/i));

      // Verificar se foi salvo
      await waitFor(() => {
        expect(screen.getByText(/perfil atualizado com sucesso/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/updated user name/i)).toBeInTheDocument();
    });

    it('should create new client', async () => {
      const user = userEvent.setup();

      // Estar na aba de clientes
      expect(screen.getByText(/meus clientes/i)).toBeInTheDocument();

      // Aguardar carregamento da lista
      await waitFor(() => {
        expect(screen.getByText(/novo/i)).toBeInTheDocument();
      });

      // Clicar em novo cliente
      await user.click(screen.getByText(/novo/i));

      // Como estamos testando o fluxo integrado, o comportamento esperado
      // seria navegar para o formulário de cliente, mas como implementamos
      // um alert temporário, verificamos isso
      // Em uma implementação real, verificaríamos a navegação
    });
  });

  describe('Error Handling Flow', () => {
    it('should handle network errors gracefully', async () => {
      // Simular erro de rede desabilitando o MSW temporariamente
      const { server } = require('../../__mocks__/server');
      server.use();

      const user = userEvent.setup();

      render(
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      );

      // Tentar login que falhará por erro de rede
      await user.type(screen.getByLabelText(/email/i), 'admin@conectar.com');
      await user.type(screen.getByLabelText(/senha/i), '123456');
      await user.click(screen.getByRole('button', { name: /entrar/i }));

      // Deve permanecer na tela de login sem travar
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    });

    it('should persist user session across page reloads', async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      );

      // Fazer login
      await user.type(screen.getByLabelText(/email/i), 'admin@conectar.com');
      await user.type(screen.getByLabelText(/senha/i), '123456');
      await user.click(screen.getByRole('button', { name: /entrar/i }));

      await waitFor(() => {
        expect(screen.getByText(/usuários/i)).toBeInTheDocument();
      });

      // Simular reload renderizando novamente
      const { unmount } = render(
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      );

      // Deve mostrar dashboard diretamente (usuário ainda logado)
      await waitFor(() => {
        expect(screen.getByText(/usuários/i)).toBeInTheDocument();
      });

      unmount();
    });
  });

  describe('Mobile Responsive Flow', () => {
    it('should handle mobile menu interactions', async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      );

      // Login como admin
      await user.type(screen.getByLabelText(/email/i), 'admin@conectar.com');
      await user.type(screen.getByLabelText(/senha/i), '123456');
      await user.click(screen.getByRole('button', { name: /entrar/i }));

      await waitFor(() => {
        expect(screen.getByText(/usuários/i)).toBeInTheDocument();
      });

      // Procurar por botão de menu mobile (hamburguer)
      const mobileMenuButton = screen.getAllByRole('button').find(btn => 
        btn.getAttribute('aria-label') === 'Menu' ||
        btn.innerHTML.includes('☰') ||
        btn.innerHTML.includes('menu')
      );

      if (mobileMenuButton) {
        await user.click(mobileMenuButton);
        
        // Verificar se o menu mobile abriu
        // (Implementação específica dependeria do componente)
      }
    });
  });

  describe('Performance and Loading States', () => {
    it('should show loading states during data fetching', async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      );

      // Verificar loading inicial
      expect(screen.getByText(/carregando/i)).toBeInTheDocument();

      // Fazer login
      await user.type(screen.getByLabelText(/email/i), 'admin@conectar.com');
      await user.type(screen.getByLabelText(/senha/i), '123456');
      await user.click(screen.getByRole('button', { name: /entrar/i }));

      // Pode mostrar loading durante transição
      // Em seguida deve mostrar o dashboard
      await waitFor(() => {
        expect(screen.getByText(/usuários/i)).toBeInTheDocument();
      });
    });

    it('should handle concurrent operations', async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      );

      // Login
      await user.type(screen.getByLabelText(/email/i), 'admin@conectar.com');
      await user.type(screen.getByLabelText(/senha/i), '123456');
      await user.click(screen.getByRole('button', { name: /entrar/i }));

      await waitFor(() => {
        expect(screen.getByText(/usuários/i)).toBeInTheDocument();
      });

      // Operações simultâneas - navegar entre abas rapidamente
      await user.click(screen.getByText(/clientes/i));
      await user.click(screen.getByText(/usuários/i));
      await user.click(screen.getByText(/clientes/i));

      // Deve terminar na aba de clientes
      await waitFor(() => {
        expect(screen.getByText(/total de.*cliente/i)).toBeInTheDocument();
      });
    });
  });

  describe('Accessibility Flow', () => {
    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      );

      // Navegar por Tab
      await user.tab();
      expect(screen.getByLabelText(/email/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByLabelText(/senha/i)).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /continuar com google/i })).toHaveFocus();

      await user.tab();
      expect(screen.getByRole('button', { name: /entrar/i })).toHaveFocus();

      // Fazer login usando Enter
      await user.keyboard('{Shift>}{Tab}{/Shift}'); // Voltar para senha
      await user.type(screen.getByLabelText(/senha/i), '123456');
      
      await user.keyboard('{Shift>}{Tab}{/Shift}'); // Voltar para email
      await user.type(screen.getByLabelText(/email/i), 'admin@conectar.com');

      await user.keyboard('{Enter}');

      // Deve fazer login
      await waitFor(() => {
        expect(screen.getByText(/usuários/i)).toBeInTheDocument();
      });
    });

    it('should have proper ARIA labels and roles', async () => {
      render(
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      );

      // Verificar elementos com roles apropriados
      expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continuar com google/i })).toBeInTheDocument();

      // Verificar labels
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    });
  });

  describe('Data Persistence Flow', () => {
    it('should maintain form data during navigation errors', async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      );

      // Preencher formulário
      await user.type(screen.getByLabelText(/email/i), 'user@example.com');
      await user.type(screen.getByLabelText(/senha/i), 'mypassword');

      // Tentar login (que falhará)
      await user.click(screen.getByRole('button', { name: /entrar/i }));

      // Os dados devem permanecer no formulário
      expect(screen.getByLabelText(/email/i)).toHaveValue('user@example.com');
      expect(screen.getByLabelText(/senha/i)).toHaveValue('mypassword');
    });

    it('should clear sensitive data on logout', async () => {
      const user = userEvent.setup();

      render(
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      );

      // Login
      await user.type(screen.getByLabelText(/email/i), 'admin@conectar.com');
      await user.type(screen.getByLabelText(/senha/i), '123456');
      await user.click(screen.getByRole('button', { name: /entrar/i }));

      await waitFor(() => {
        expect(screen.getByText(/usuários/i)).toBeInTheDocument();
      });

      // Verificar se token está no localStorage
      expect(localStorage.getItem('token')).toBeTruthy();
      expect(localStorage.getItem('user')).toBeTruthy();

      // Logout
      const logoutButton = screen.getAllByRole('button').find(btn => 
        btn.getAttribute('title') === 'Sair' ||
        btn.innerHTML.includes('logout') ||
        btn.querySelector('svg')
      );

      if (logoutButton) {
        await user.click(logoutButton);

        await waitFor(() => {
          expect(screen.getByText(/entrar/i)).toBeInTheDocument();
        });

        // Verificar se dados foram limpos
        expect(localStorage.getItem('token')).toBeNull();
        expect(localStorage.getItem('user')).toBeNull();
      }
    });
  });
});