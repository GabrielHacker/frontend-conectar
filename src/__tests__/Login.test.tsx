// src/pages/__tests__/Login.test.tsx
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from '../pages/Login';

describe('Login Component', () => {
  const mockOnLogin = jest.fn();
  const mockOnRegisterClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render login form correctly', () => {
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      // Verificar elementos principais
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
      expect(screen.getByText(/entrar/i)).toBeInTheDocument();
      expect(screen.getByText(/continuar com google/i)).toBeInTheDocument();
      expect(screen.getByText(/criar conta gratuita/i)).toBeInTheDocument();
      
      // Verificar credenciais de teste
      expect(screen.getByText(/credenciais de teste/i)).toBeInTheDocument();
      expect(screen.getByText(/admin@conectar.com/i)).toBeInTheDocument();
    });

    it('should display error message when provided', () => {
      const errorMessage = 'Erro de teste';
      
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick}
          error={errorMessage}
        />
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should show logo image', () => {
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      const logo = screen.getByAltText(/conectar logo/i);
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('src');
    });
  });

  describe('Form Interaction', () => {
    it('should allow typing in email field', async () => {
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      const emailInput = screen.getByLabelText(/email/i);
      await userEvent.type(emailInput, 'test@example.com');

      expect(emailInput).toHaveValue('test@example.com');
    });

    it('should allow typing in password field', async () => {
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      const passwordInput = screen.getByLabelText(/senha/i);
      await userEvent.type(passwordInput, 'password123');

      expect(passwordInput).toHaveValue('password123');
    });

    it('should toggle password visibility', async () => {
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      const passwordInput = screen.getByLabelText(/senha/i);
      const toggleButton = passwordInput.nextElementSibling;

      // Password deve estar oculta inicialmente
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Clicar no botão de toggle
      if (toggleButton) {
        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'text');

        // Clicar novamente para ocultar
        fireEvent.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'password');
      }
    });
  });

  describe('Form Submission', () => {
    it('should call onLogin with correct credentials on form submission', async () => {
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      // Preencher formulário
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByText(/entrar/i);

      await userEvent.type(emailInput, 'admin@conectar.com');
      await userEvent.type(passwordInput, '123456');
      fireEvent.click(submitButton);

      // Verificar se onLogin foi chamado com os dados corretos
      expect(mockOnLogin).toHaveBeenCalledWith('admin@conectar.com', '123456');
    });

    it('should call onLogin when Enter is pressed in password field', async () => {
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      // Preencher formulário
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);

      await userEvent.type(emailInput, 'admin@conectar.com');
      await userEvent.type(passwordInput, '123456');
      fireEvent.keyDown(passwordInput, { key: 'Enter', code: 'Enter' });

      expect(mockOnLogin).toHaveBeenCalledWith('admin@conectar.com', '123456');
    });

    it('should not submit form with empty fields', async () => {
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      const submitButton = screen.getByText(/entrar/i);
      fireEvent.click(submitButton);

      // onLogin não deve ser chamado com campos vazios
      expect(mockOnLogin).not.toHaveBeenCalled();
    });

    it('should show loading state during submission', async () => {
      // Mock onLogin que demora um pouco
      const slowLogin = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
      
      render(
        <Login 
          onLogin={slowLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      // Preencher e submeter formulário
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByText(/entrar/i);

      await userEvent.type(emailInput, 'admin@conectar.com');
      await userEvent.type(passwordInput, '123456');
      fireEvent.click(submitButton);

      // Verificar estado de loading
      expect(screen.getByText(/entrando/i)).toBeInTheDocument();
      
      // Aguardar finalização
      await waitFor(() => {
        expect(screen.getByText(/entrar/i)).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should call onRegisterClick when register link is clicked', async () => {
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      const registerLink = screen.getByText(/criar conta gratuita/i);
      fireEvent.click(registerLink);

      expect(mockOnRegisterClick).toHaveBeenCalled();
    });
  });

  describe('Google OAuth', () => {
    beforeEach(() => {
      // Mock Google OAuth
      global.google = {
        accounts: {
          id: {
            initialize: jest.fn(),
            prompt: jest.fn(),
          }
        }
      };
    });

    it('should initialize Google OAuth on mount', () => {
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      expect(global.google.accounts.id.initialize).toHaveBeenCalled();
    });

    it('should trigger Google prompt when Google login button is clicked', async () => {
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      const googleButton = screen.getByText(/continuar com google/i);
      fireEvent.click(googleButton);

      expect(global.google.accounts.id.prompt).toHaveBeenCalled();
    });

    it('should handle Google OAuth not available', async () => {
      // Remover Google do global
      delete (global as any).google;
      
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      const googleButton = screen.getByText(/continuar com google/i);
      fireEvent.click(googleButton);

      // Verificar se mostra erro (se implementado)
      // Este teste pode precisar ser ajustado baseado na implementação
    });
  });

  describe('Error Handling', () => {
    it('should handle login errors gracefully', async () => {
      const errorLogin = jest.fn().mockRejectedValue(new Error('Login failed'));
      
      render(
        <Login 
          onLogin={errorLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      // Preencher e submeter formulário
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByText(/entrar/i);

      await userEvent.type(emailInput, 'admin@conectar.com');
      await userEvent.type(passwordInput, '123456');
      fireEvent.click(submitButton);

      // Aguardar o erro ser processado
      await waitFor(() => {
        expect(screen.getByText(/entrar/i)).toBeInTheDocument();
      });

      // Verificar se o botão voltou ao estado normal
      expect(screen.getByText(/entrar/i)).toBeInTheDocument();
    });

    it('should clear local error when global error changes', () => {
      const { rerender } = render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick}
          error="Initial error"
        />
      );

      expect(screen.getByText('Initial error')).toBeInTheDocument();

      // Re-render sem erro
      rerender(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick}
          error=""
        />
      );

      expect(screen.queryByText('Initial error')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      expect(screen.getByLabelText(/email/i)).toHaveAttribute('type', 'email');
      expect(screen.getByLabelText(/senha/i)).toHaveAttribute('type', 'password');
    });

    it('should have proper interactive elements', () => {
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      expect(screen.getByText(/entrar/i)).toBeInTheDocument();
      expect(screen.getByText(/continuar com google/i)).toBeInTheDocument();
    });
  });
});

describe('Login Component', () => {
  const mockOnLogin = jest.fn();
  const mockOnRegisterClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render login form correctly', () => {
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      // Verificar elementos principais
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
      expect(screen.getByText(/continuar com google/i)).toBeInTheDocument();
      expect(screen.getByText(/criar conta gratuita/i)).toBeInTheDocument();
      
      // Verificar credenciais de teste
      expect(screen.getByText(/credenciais de teste/i)).toBeInTheDocument();
      expect(screen.getByText(/admin@conectar.com/i)).toBeInTheDocument();
    });

    it('should display error message when provided', () => {
      const errorMessage = 'Erro de teste';
      
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick}
          error={errorMessage}
        />
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should show logo image', () => {
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      const logo = screen.getByAltText(/conectar logo/i);
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('src');
    });
  });

  describe('Form Interaction', () => {
    it('should allow typing in email field', async () => {
      const user = userEvent.setup();
      
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@example.com');

      expect(emailInput).toHaveValue('test@example.com');
    });

    it('should allow typing in password field', async () => {
      const user = userEvent.setup();
      
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      const passwordInput = screen.getByLabelText(/senha/i);
      await user.type(passwordInput, 'password123');

      expect(passwordInput).toHaveValue('password123');
    });

    it('should toggle password visibility', async () => {
      const user = userEvent.setup();
      
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      const passwordInput = screen.getByLabelText(/senha/i);
      const toggleButton = passwordInput.nextElementSibling;

      // Password deve estar oculta inicialmente
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Clicar no botão de toggle
      if (toggleButton) {
        await user.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'text');

        // Clicar novamente para ocultar
        await user.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'password');
      }
    });
  });

  describe('Form Submission', () => {
    it('should call onLogin with correct credentials on form submission', async () => {
      const user = userEvent.setup();
      
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      // Preencher formulário
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      await user.type(emailInput, 'admin@conectar.com');
      await user.type(passwordInput, '123456');
      await user.click(submitButton);

      // Verificar se onLogin foi chamado com os dados corretos
      expect(mockOnLogin).toHaveBeenCalledWith('admin@conectar.com', '123456');
    });

    it('should call onLogin when Enter is pressed in password field', async () => {
      const user = userEvent.setup();
      
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      // Preencher formulário
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);

      await user.type(emailInput, 'admin@conectar.com');
      await user.type(passwordInput, '123456');
      await user.keyboard('{Enter}');

      expect(mockOnLogin).toHaveBeenCalledWith('admin@conectar.com', '123456');
    });

    it('should not submit form with empty fields', async () => {
      const user = userEvent.setup();
      
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      const submitButton = screen.getByRole('button', { name: /entrar/i });
      await user.click(submitButton);

      // onLogin não deve ser chamado com campos vazios
      expect(mockOnLogin).not.toHaveBeenCalled();
    });

    it('should show loading state during submission', async () => {
      // Mock onLogin que demora um pouco
      const slowLogin = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
      const user = userEvent.setup();
      
      render(
        <Login 
          onLogin={slowLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      // Preencher e submeter formulário
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      await user.type(emailInput, 'admin@conectar.com');
      await user.type(passwordInput, '123456');
      await user.click(submitButton);

      // Verificar estado de loading
      expect(screen.getByText(/entrando/i)).toBeInTheDocument();
      
      // Aguardar finalização
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should call onRegisterClick when register link is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      const registerLink = screen.getByText(/criar conta gratuita/i);
      await user.click(registerLink);

      expect(mockOnRegisterClick).toHaveBeenCalled();
    });
  });

  describe('Google OAuth', () => {
    beforeEach(() => {
      // Mock Google OAuth
      global.google = {
        accounts: {
          id: {
            initialize: jest.fn(),
            prompt: jest.fn(),
          }
        }
      };
    });

    it('should initialize Google OAuth on mount', () => {
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      expect(global.google.accounts.id.initialize).toHaveBeenCalled();
    });

    it('should trigger Google prompt when Google login button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      const googleButton = screen.getByText(/continuar com google/i);
      await user.click(googleButton);

      expect(global.google.accounts.id.prompt).toHaveBeenCalled();
    });

    it('should handle Google OAuth not available', async () => {
      // Remover Google do global
      delete (global as any).google;
      
      const user = userEvent.setup();
      
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      const googleButton = screen.getByText(/continuar com google/i);
      await user.click(googleButton);

      // Verificar se mostra erro (se implementado)
      // Este teste pode precisar ser ajustado baseado na implementação
    });
  });

  describe('Error Handling', () => {
    it('should handle login errors gracefully', async () => {
      const errorLogin = jest.fn().mockRejectedValue(new Error('Login failed'));
      const user = userEvent.setup();
      
      render(
        <Login 
          onLogin={errorLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      // Preencher e submeter formulário
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      await user.type(emailInput, 'admin@conectar.com');
      await user.type(passwordInput, '123456');
      await user.click(submitButton);

      // Aguardar o erro ser processado
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
      });

      // Verificar se o botão voltou ao estado normal
      expect(screen.getByRole('button', { name: /entrar/i })).not.toBeDisabled();
    });

    it('should clear local error when global error changes', () => {
      const { rerender } = render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick}
          error="Initial error"
        />
      );

      expect(screen.getByText('Initial error')).toBeInTheDocument();

      // Re-render sem erro
      rerender(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick}
          error=""
        />
      );

      expect(screen.queryByText('Initial error')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      expect(screen.getByLabelText(/email/i)).toHaveAttribute('type', 'email');
      expect(screen.getByLabelText(/senha/i)).toHaveAttribute('type', 'password');
    });

    it('should have proper button roles', () => {
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continuar com google/i })).toBeInTheDocument();
    });
  });
});

describe('Login Component', () => {
  const mockOnLogin = jest.fn();
  const mockOnRegisterClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render login form correctly', () => {
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      // Verificar elementos principais
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
      expect(screen.getByText(/continuar com google/i)).toBeInTheDocument();
      expect(screen.getByText(/criar conta gratuita/i)).toBeInTheDocument();
      
      // Verificar credenciais de teste
      expect(screen.getByText(/credenciais de teste/i)).toBeInTheDocument();
      expect(screen.getByText(/admin@conectar.com/i)).toBeInTheDocument();
    });

    it('should display error message when provided', () => {
      const errorMessage = 'Erro de teste';
      
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick}
          error={errorMessage}
        />
      );

      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should show logo image', () => {
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      const logo = screen.getByAltText(/conectar logo/i);
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute('src');
    });
  });

  describe('Form Interaction', () => {
    it('should allow typing in email field', async () => {
      const user = userEvent.setup();
      
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      const emailInput = screen.getByLabelText(/email/i);
      await user.type(emailInput, 'test@example.com');

      expect(emailInput).toHaveValue('test@example.com');
    });

    it('should allow typing in password field', async () => {
      const user = userEvent.setup();
      
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      const passwordInput = screen.getByLabelText(/senha/i);
      await user.type(passwordInput, 'password123');

      expect(passwordInput).toHaveValue('password123');
    });

    it('should toggle password visibility', async () => {
      const user = userEvent.setup();
      
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      const passwordInput = screen.getByLabelText(/senha/i);
      const toggleButton = passwordInput.nextElementSibling;

      // Password deve estar oculta inicialmente
      expect(passwordInput).toHaveAttribute('type', 'password');

      // Clicar no botão de toggle
      if (toggleButton) {
        await user.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'text');

        // Clicar novamente para ocultar
        await user.click(toggleButton);
        expect(passwordInput).toHaveAttribute('type', 'password');
      }
    });
  });

  describe('Form Submission', () => {
    it('should call onLogin with correct credentials on form submission', async () => {
      const user = userEvent.setup();
      
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      // Preencher formulário
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      await user.type(emailInput, 'admin@conectar.com');
      await user.type(passwordInput, '123456');
      await user.click(submitButton);

      // Verificar se onLogin foi chamado com os dados corretos
      expect(mockOnLogin).toHaveBeenCalledWith('admin@conectar.com', '123456');
    });

    it('should call onLogin when Enter is pressed in password field', async () => {
      const user = userEvent.setup();
      
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      // Preencher formulário
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);

      await user.type(emailInput, 'admin@conectar.com');
      await user.type(passwordInput, '123456');
      await user.keyboard('{Enter}');

      expect(mockOnLogin).toHaveBeenCalledWith('admin@conectar.com', '123456');
    });

    it('should not submit form with empty fields', async () => {
      const user = userEvent.setup();
      
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      const submitButton = screen.getByRole('button', { name: /entrar/i });
      await user.click(submitButton);

      // onLogin não deve ser chamado com campos vazios
      expect(mockOnLogin).not.toHaveBeenCalled();
    });

    it('should show loading state during submission', async () => {
      // Mock onLogin que demora um pouco
      const slowLogin = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
      const user = userEvent.setup();
      
      render(
        <Login 
          onLogin={slowLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      // Preencher e submeter formulário
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      await user.type(emailInput, 'admin@conectar.com');
      await user.type(passwordInput, '123456');
      await user.click(submitButton);

      // Verificar estado de loading
      expect(screen.getByText(/entrando/i)).toBeInTheDocument();
      
      // Aguardar finalização
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
      });
    });
  });

  describe('Navigation', () => {
    it('should call onRegisterClick when register link is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      const registerLink = screen.getByText(/criar conta gratuita/i);
      await user.click(registerLink);

      expect(mockOnRegisterClick).toHaveBeenCalled();
    });
  });

  describe('Google OAuth', () => {
    beforeEach(() => {
      // Mock Google OAuth
      global.google = {
        accounts: {
          id: {
            initialize: jest.fn(),
            prompt: jest.fn(),
          }
        }
      };
    });

    it('should initialize Google OAuth on mount', () => {
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      expect(global.google.accounts.id.initialize).toHaveBeenCalled();
    });

    it('should trigger Google prompt when Google login button is clicked', async () => {
      const user = userEvent.setup();
      
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      const googleButton = screen.getByText(/continuar com google/i);
      await user.click(googleButton);

      expect(global.google.accounts.id.prompt).toHaveBeenCalled();
    });

    it('should handle Google OAuth not available', async () => {
      // Remover Google do global
      delete (global as any).google;
      
      const user = userEvent.setup();
      
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      const googleButton = screen.getByText(/continuar com google/i);
      await user.click(googleButton);

      // Verificar se mostra erro (se implementado)
      // Este teste pode precisar ser ajustado baseado na implementação
    });
  });

  describe('Error Handling', () => {
    it('should handle login errors gracefully', async () => {
      const errorLogin = jest.fn().mockRejectedValue(new Error('Login failed'));
      const user = userEvent.setup();
      
      render(
        <Login 
          onLogin={errorLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      // Preencher e submeter formulário
      const emailInput = screen.getByLabelText(/email/i);
      const passwordInput = screen.getByLabelText(/senha/i);
      const submitButton = screen.getByRole('button', { name: /entrar/i });

      await user.type(emailInput, 'admin@conectar.com');
      await user.type(passwordInput, '123456');
      await user.click(submitButton);

      // Aguardar o erro ser processado
      await waitFor(() => {
        expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
      });

      // Verificar se o botão voltou ao estado normal
      expect(screen.getByRole('button', { name: /entrar/i })).not.toBeDisabled();
    });

    it('should clear local error when global error changes', () => {
      const { rerender } = render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick}
          error="Initial error"
        />
      );

      expect(screen.getByText('Initial error')).toBeInTheDocument();

      // Re-render sem erro
      rerender(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick}
          error=""
        />
      );

      expect(screen.queryByText('Initial error')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper form labels', () => {
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      expect(screen.getByLabelText(/email/i)).toHaveAttribute('type', 'email');
      expect(screen.getByLabelText(/senha/i)).toHaveAttribute('type', 'password');
    });

    it('should have proper button roles', () => {
      render(
        <Login 
          onLogin={mockOnLogin} 
          onRegisterClick={mockOnRegisterClick} 
        />
      );

      expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /continuar com google/i })).toBeInTheDocument();
    });
  });
});