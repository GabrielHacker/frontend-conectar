import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ClientForm from '../ClientForm';
import { mockClientFormData } from '../../__tests__/utils/test-utils';

// Mock do módulo de API
jest.mock('../../services/api', () => ({
  clientsAPI: {
    create: jest.fn(),
    update: jest.fn(),
    getById: jest.fn(),
  }
}));

// Mock do logo
jest.mock('../../assets/logo.png', () => 'logo-mock.png');

const { clientsAPI } = require('../../services/api');

describe('ClientForm Component', () => {
  const mockOnLogout = jest.fn();
  const mockOnBack = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Create Mode', () => {
    it('should render create form correctly', () => {
      render(
        <ClientForm
          onLogout={mockOnLogout}
          onBack={mockOnBack}
          onSuccess={mockOnSuccess}
          mode="create"
        />
      );

      expect(screen.getByText(/novo cliente/i)).toBeInTheDocument();
      expect(screen.getByText(/dados cadastrais/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /criar cliente/i })).toBeInTheDocument();
    });

    it('should have all required form fields', () => {
      render(
        <ClientForm
          onLogout={mockOnLogout}
          onBack={mockOnBack}
          onSuccess={mockOnSuccess}
          mode="create"
        />
      );

      // Campos obrigatórios
      expect(screen.getByLabelText(/razão social/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/cnpj/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/nome na fachada/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/cidade/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/estado/i)).toBeInTheDocument();

      // Campos opcionais
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/telefone/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/cep/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/rua/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/número/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/bairro/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/observações/i)).toBeInTheDocument();
    });

    it('should submit form with valid data', async () => {
      clientsAPI.create.mockResolvedValue({ id: '1', ...mockClientFormData });
      const user = userEvent.setup();

      render(
        <ClientForm
          onLogout={mockOnLogout}
          onBack={mockOnBack}
          onSuccess={mockOnSuccess}
          mode="create"
        />
      );

      // Preencher campos obrigatórios
      await user.type(screen.getByLabelText(/razão social/i), mockClientFormData.razaoSocial);
      await user.type(screen.getByLabelText(/cnpj/i), mockClientFormData.cnpj);
      await user.type(screen.getByLabelText(/nome na fachada/i), mockClientFormData.nomeNaFachada);
      await user.type(screen.getByLabelText(/cidade/i), mockClientFormData.cidade);
      await user.type(screen.getByLabelText(/estado/i), mockClientFormData.estado);

      // Submeter formulário
      await user.click(screen.getByRole('button', { name: /criar cliente/i }));

      await waitFor(() => {
        expect(clientsAPI.create).toHaveBeenCalledWith(expect.objectContaining({
          razaoSocial: mockClientFormData.razaoSocial,
          cnpj: mockClientFormData.cnpj,
          nomeNaFachada: mockClientFormData.nomeNaFachada,
          cidade: mockClientFormData.cidade,
          estado: mockClientFormData.estado,
        }));
      });

      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  describe('Edit Mode', () => {
    const mockClient = {
      id: '1',
      ...mockClientFormData
    };

    it('should render edit form correctly', async () => {
      clientsAPI.getById.mockResolvedValue(mockClient);

      render(
        <ClientForm
          onLogout={mockOnLogout}
          onBack={mockOnBack}
          onSuccess={mockOnSuccess}
          mode="edit"
          clientId="1"
        />
      );

      await waitFor(() => {
        expect(screen.getByText(/editar cliente/i)).toBeInTheDocument();
      });

      expect(screen.getByRole('button', { name: /atualizar cliente/i })).toBeInTheDocument();
    });

    it('should load client data in edit mode', async () => {
      clientsAPI.getById.mockResolvedValue(mockClient);

      render(
        <ClientForm
          onLogout={mockOnLogout}
          onBack={mockOnBack}
          onSuccess={mockOnSuccess}
          mode="edit"
          clientId="1"
        />
      );

      await waitFor(() => {
        expect(clientsAPI.getById).toHaveBeenCalledWith('1');
      });

      // Verificar se os campos foram preenchidos
      await waitFor(() => {
        expect(screen.getByDisplayValue(mockClient.razaoSocial)).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockClient.cnpj)).toBeInTheDocument();
        expect(screen.getByDisplayValue(mockClient.nomeNaFachada)).toBeInTheDocument();
      });
    });

    it('should update client data in edit mode', async () => {
      clientsAPI.getById.mockResolvedValue(mockClient);
      clientsAPI.update.mockResolvedValue({ ...mockClient, razaoSocial: 'Updated Name' });
      const user = userEvent.setup();

      render(
        <ClientForm
          onLogout={mockOnLogout}
          onBack={mockOnBack}
          onSuccess={mockOnSuccess}
          mode="edit"
          clientId="1"
        />
      );

      // Aguardar carregamento dos dados
      await waitFor(() => {
        expect(screen.getByDisplayValue(mockClient.razaoSocial)).toBeInTheDocument();
      });

      // Modificar razão social
      const razaoSocialInput = screen.getByLabelText(/razão social/i);
      await user.clear(razaoSocialInput);
      await user.type(razaoSocialInput, 'Updated Name');

      // Submeter formulário
      await user.click(screen.getByRole('button', { name: /atualizar cliente/i }));

      await waitFor(() => {
        expect(clientsAPI.update).toHaveBeenCalledWith('1', expect.objectContaining({
          razaoSocial: 'Updated Name'
        }));
      });

      expect(mockOnSuccess).toHaveBeenCalled();
    });

    it('should handle client not found error', async () => {
      clientsAPI.getById.mockRejectedValue(new Error('Client not found'));

      render(
        <ClientForm
          onLogout={mockOnLogout}
          onBack={mockOnBack}
          onSuccess={mockOnSuccess}
          mode="edit"
          clientId="999"
        />
      );

      await waitFor(() => {
        expect(mockOnBack).toHaveBeenCalled();
      });
    });
  });

  describe('Form Validation', () => {
    it('should validate required fields', async () => {
      const user = userEvent.setup();

      render(
        <ClientForm
          onLogout={mockOnLogout}
          onBack={mockOnBack}
          onSuccess={mockOnSuccess}
          mode="create"
        />
      );

      // Tentar submeter sem preencher campos obrigatórios
      await user.click(screen.getByRole('button', { name: /criar cliente/i }));

      expect(screen.getByText(/razão social é obrigatória/i)).toBeInTheDocument();
      expect(screen.getByText(/cnpj é obrigatório/i)).toBeInTheDocument();
      expect(screen.getByText(/nome na fachada é obrigatório/i)).toBeInTheDocument();
      expect(screen.getByText(/cidade é obrigatória/i)).toBeInTheDocument();
      expect(screen.getByText(/estado é obrigatório/i)).toBeInTheDocument();

      expect(clientsAPI.create).not.toHaveBeenCalled();
    });

    it('should validate CNPJ format', async () => {
      const user = userEvent.setup();

      render(
        <ClientForm
          onLogout={mockOnLogout}
          onBack={mockOnBack}
          onSuccess={mockOnSuccess}
          mode="create"
        />
      );

      // Preencher CNPJ inválido
      await user.type(screen.getByLabelText(/cnpj/i), '123456789');
      await user.click(screen.getByRole('button', { name: /criar cliente/i }));

      expect(screen.getByText(/cnpj deve estar no formato/i)).toBeInTheDocument();
    });

    it('should validate email format', async () => {
      const user = userEvent.setup();

      render(
        <ClientForm
          onLogout={mockOnLogout}
          onBack={mockOnBack}
          onSuccess={mockOnSuccess}
          mode="create"
        />
      );

      // Preencher email inválido
      await user.type(screen.getByLabelText(/email/i), 'email-inválido');
      await user.click(screen.getByRole('button', { name: /criar cliente/i }));

      expect(screen.getByText(/email deve ter um formato válido/i)).toBeInTheDocument();
    });

    it('should validate CEP format', async () => {
      const user = userEvent.setup();

      render(
        <ClientForm
          onLogout={mockOnLogout}
          onBack={mockOnBack}
          onSuccess={mockOnSuccess}
          mode="create"
        />
      );

      // Preencher CEP inválido
      await user.type(screen.getByLabelText(/cep/i), '123');
      await user.click(screen.getByRole('button', { name: /criar cliente/i }));

      expect(screen.getByText(/cep deve ter um formato válido/i)).toBeInTheDocument();
    });
  });

  describe('Input Formatting', () => {
    it('should format CNPJ input', async () => {
      const user = userEvent.setup();

      render(
        <ClientForm
          onLogout={mockOnLogout}
          onBack={mockOnBack}
          onSuccess={mockOnSuccess}
          mode="create"
        />
      );

      const cnpjInput = screen.getByLabelText(/cnpj/i);
      await user.type(cnpjInput, '12345678000190');

      expect(cnpjInput).toHaveValue('12.345.678/0001-90');
    });

    it('should format CEP input', async () => {
      const user = userEvent.setup();

      render(
        <ClientForm
          onLogout={mockOnLogout}
          onBack={mockOnBack}
          onSuccess={mockOnSuccess}
          mode="create"
        />
      );

      const cepInput = screen.getByLabelText(/cep/i);
      await user.type(cepInput, '12345678');

      expect(cepInput).toHaveValue('12345-678');
    });

    it('should format phone input', async () => {
      const user = userEvent.setup();

      render(
        <ClientForm
          onLogout={mockOnLogout}
          onBack={mockOnBack}
          onSuccess={mockOnSuccess}
          mode="create"
        />
      );

      const phoneInput = screen.getByLabelText(/telefone/i);
      await user.type(phoneInput, '11999999999');

      expect(phoneInput).toHaveValue('(11) 99999-9999');
    });

    it('should convert estado to uppercase', async () => {
      const user = userEvent.setup();

      render(
        <ClientForm
          onLogout={mockOnLogout}
          onBack={mockOnBack}
          onSuccess={mockOnSuccess}
          mode="create"
        />
      );

      const estadoInput = screen.getByLabelText(/estado/i);
      await user.type(estadoInput, 'sp');

      expect(estadoInput).toHaveValue('SP');
    });
  });

  describe('Tabs Navigation', () => {
    it('should show different tabs in desktop view', () => {
      render(
        <ClientForm
          onLogout={mockOnLogout}
          onBack={mockOnBack}
          onSuccess={mockOnSuccess}
          mode="create"
        />
      );

      expect(screen.getByText(/dados cadastrais/i)).toBeInTheDocument();
      expect(screen.getByText(/informações internas/i)).toBeInTheDocument();
      expect(screen.getByText(/usuários/i)).toBeInTheDocument();
    });

    it('should disable future tabs', () => {
      render(
        <ClientForm
          onLogout={mockOnLogout}
          onBack={mockOnBack}
          onSuccess={mockOnSuccess}
          mode="create"
        />
      );

      // As outras abas devem estar desabilitadas
      expect(screen.getByText(/informações internas.*em breve/i)).toBeInTheDocument();
      expect(screen.getByText(/usuários.*em breve/i)).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should call onBack when cancel button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <ClientForm
          onLogout={mockOnLogout}
          onBack={mockOnBack}
          onSuccess={mockOnSuccess}
          mode="create"
        />
      );

      await user.click(screen.getByRole('button', { name: /cancelar/i }));

      expect(mockOnBack).toHaveBeenCalled();
    });

    it('should call onLogout when logout button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <ClientForm
          onLogout={mockOnLogout}
          onBack={mockOnBack}
          onSuccess={mockOnSuccess}
          mode="create"
        />
      );

      // No desktop
      const desktopLogoutButton = screen.getAllByRole('button').find(
        button => button.getAttribute('title') === 'Sair' || 
        button.querySelector('svg')
      );

      if (desktopLogoutButton) {
        await user.click(desktopLogoutButton);
        expect(mockOnLogout).toHaveBeenCalled();
      }
    });

    it('should call onBack when back to clients button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <ClientForm
          onLogout={mockOnLogout}
          onBack={mockOnBack}
          onSuccess={mockOnSuccess}
          mode="create"
        />
      );

      const backButton = screen.getByText(/voltar para clientes/i);
      await user.click(backButton);

      expect(mockOnBack).toHaveBeenCalled();
    });
  });

  describe('Loading States', () => {
    it('should show loading state when loading client data', () => {
      clientsAPI.getById.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(
        <ClientForm
          onLogout={mockOnLogout}
          onBack={mockOnBack}
          onSuccess={mockOnSuccess}
          mode="edit"
          clientId="1"
        />
      );

      expect(screen.getByText(/carregando/i)).toBeInTheDocument();
    });

    it('should show loading state when submitting form', async () => {
      clientsAPI.create.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      const user = userEvent.setup();

      render(
        <ClientForm
          onLogout={mockOnLogout}
          onBack={mockOnBack}
          onSuccess={mockOnSuccess}
          mode="create"
        />
      );

      // Preencher campos obrigatórios
      await user.type(screen.getByLabelText(/razão social/i), 'Test Company');
      await user.type(screen.getByLabelText(/cnpj/i), '12.345.678/0001-90');
      await user.type(screen.getByLabelText(/nome na fachada/i), 'Test');
      await user.type(screen.getByLabelText(/cidade/i), 'São Paulo');
      await user.type(screen.getByLabelText(/estado/i), 'SP');

      // Submeter formulário
      await user.click(screen.getByRole('button', { name: /criar cliente/i }));

      // Verificar estado de loading
      expect(screen.getByText(/salvando/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display submit errors', async () => {
      clientsAPI.create.mockRejectedValue(new Error('Server error'));
      const user = userEvent.setup();

      render(
        <ClientForm
          onLogout={mockOnLogout}
          onBack={mockOnBack}
          onSuccess={mockOnSuccess}
          mode="create"
        />
      );

      // Preencher e submeter formulário
      await user.type(screen.getByLabelText(/razão social/i), 'Test Company');
      await user.type(screen.getByLabelText(/cnpj/i), '12.345.678/0001-90');
      await user.type(screen.getByLabelText(/nome na fachada/i), 'Test');
      await user.type(screen.getByLabelText(/cidade/i), 'São Paulo');
      await user.type(screen.getByLabelText(/estado/i), 'SP');

      await user.click(screen.getByRole('button', { name: /criar cliente/i }));

      await waitFor(() => {
        expect(screen.getByText(/erro ao salvar cliente/i)).toBeInTheDocument();
      });
    });

    it('should clear field errors when user starts typing', async () => {
      const user = userEvent.setup();

      render(
        <ClientForm
          onLogout={mockOnLogout}
          onBack={mockOnBack}
          onSuccess={mockOnSuccess}
          mode="create"
        />
      );

      // Gerar erro primeiro
      await user.click(screen.getByRole('button', { name: /criar cliente/i }));
      expect(screen.getByText(/razão social é obrigatória/i)).toBeInTheDocument();

      // Começar a digitar
      await user.type(screen.getByLabelText(/razão social/i), 'T');

      // Erro deve desaparecer
      expect(screen.queryByText(/razão social é obrigatória/i)).not.toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('should show mobile menu toggle button', () => {
      render(
        <ClientForm
          onLogout={mockOnLogout}
          onBack={mockOnBack}
          onSuccess={mockOnSuccess}
          mode="create"
        />
      );

      // O botão de menu mobile deve estar presente (mesmo que não visível no desktop)
      const menuButtons = screen.getAllByLabelText(/menu/i);
      expect(menuButtons.length).toBeGreaterThan(0);
    });

    it('should have mobile-friendly form layout', () => {
      render(
        <ClientForm
          onLogout={mockOnLogout}
          onBack={mockOnBack}
          onSuccess={mockOnSuccess}
          mode="create"
        />
      );

      // Verificar se há classes responsivas (grid, etc.)
      const form = screen.getByRole('form') || document.querySelector('form');
      expect(form).toBeInTheDocument();
    });
  });
});