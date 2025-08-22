// src/__tests__/Register.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Register from '../pages/Register';

describe('Register Component', () => {
  const mockOnRegister = jest.fn();
  const mockOnBackToLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render register form', () => {
    render(
      <Register 
        onRegister={mockOnRegister} 
        onBackToLogin={mockOnBackToLogin} 
      />
    );

    expect(screen.getByText(/criar nova conta/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email/i)).toBeInTheDocument();
    expect(screen.getByText(/criar conta/i)).toBeInTheDocument();
  });

  it('should call onBackToLogin when back button is clicked', async () => {
    render(
      <Register 
        onRegister={mockOnRegister} 
        onBackToLogin={mockOnBackToLogin} 
      />
    );

    const backButton = screen.getByText(/fazer login/i);
    fireEvent.click(backButton);

    expect(mockOnBackToLogin).toHaveBeenCalled();
  });

  it('should validate required fields', async () => {
    render(
      <Register 
        onRegister={mockOnRegister} 
        onBackToLogin={mockOnBackToLogin} 
      />
    );

    // Tentar submeter sem preencher
    const submitButton = screen.getByText(/criar conta/i);
    fireEvent.click(submitButton);

    expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument();
    expect(mockOnRegister).not.toHaveBeenCalled();
  });

  it('should validate email format', async () => {
    render(
      <Register 
        onRegister={mockOnRegister} 
        onBackToLogin={mockOnBackToLogin} 
      />
    );

    const nameInput = screen.getByLabelText(/nome completo/i);
    const emailInput = screen.getByLabelText(/^email/i);
    const submitButton = screen.getByText(/criar conta/i);

    fireEvent.change(nameInput, { target: { value: 'João Silva' } });
    fireEvent.change(emailInput, { target: { value: 'email-inválido' } });
    fireEvent.click(submitButton);

    expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
  });

  it('should validate password confirmation', async () => {
    render(
      <Register 
        onRegister={mockOnRegister} 
        onBackToLogin={mockOnBackToLogin} 
      />
    );

    const nameInput = screen.getByLabelText(/nome completo/i);
    const emailInput = screen.getByLabelText(/^email/i);
    const passwordInput = screen.getByLabelText(/^senha/i);
    const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
    const submitButton = screen.getByText(/criar conta/i);

    fireEvent.change(nameInput, { target: { value: 'João Silva' } });
    fireEvent.change(emailInput, { target: { value: 'joao@exemplo.com' } });
    fireEvent.change(passwordInput, { target: { value: '123456' } });
    fireEvent.change(confirmPasswordInput, { target: { value: '654321' } });
    fireEvent.click(submitButton);

    expect(screen.getByText(/senhas não coincidem/i)).toBeInTheDocument();
  });

  it('should submit valid form', async () => {
    mockOnRegister.mockResolvedValue(undefined);
    
    render(
      <Register 
        onRegister={mockOnRegister} 
        onBackToLogin={mockOnBackToLogin} 
      />
    );

    const nameInput = screen.getByLabelText(/nome completo/i);
    const emailInput = screen.getByLabelText(/^email/i);
    const passwordInput = screen.getByLabelText(/^senha/i);
    const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
    const submitButton = screen.getByText(/criar conta/i);

    fireEvent.change(nameInput, { target: { value: 'João Silva' } });
    fireEvent.change(emailInput, { target: { value: 'joao@exemplo.com' } });
    fireEvent.change(passwordInput, { target: { value: '123456' } });
    fireEvent.change(confirmPasswordInput, { target: { value: '123456' } });
    fireEvent.click(submitButton);

    expect(mockOnRegister).toHaveBeenCalledWith({
      name: 'João Silva',
      email: 'joao@exemplo.com',
      password: '123456'
    });
  });

  it('should show loading state during submission', async () => {
    const slowRegister = jest.fn(() => new Promise(resolve => setTimeout(resolve, 100)));
    
    render(
      <Register 
        onRegister={slowRegister} 
        onBackToLogin={mockOnBackToLogin} 
      />
    );

    const nameInput = screen.getByLabelText(/nome completo/i);
    const emailInput = screen.getByLabelText(/^email/i);
    const passwordInput = screen.getByLabelText(/^senha/i);
    const confirmPasswordInput = screen.getByLabelText(/confirmar senha/i);
    const submitButton = screen.getByText(/criar conta/i);

    fireEvent.change(nameInput, { target: { value: 'João Silva' } });
    fireEvent.change(emailInput, { target: { value: 'joao@exemplo.com' } });
    fireEvent.change(passwordInput, { target: { value: '123456' } });
    fireEvent.change(confirmPasswordInput, { target: { value: '123456' } });
    fireEvent.click(submitButton);

    expect(screen.getByText(/criando conta/i)).toBeInTheDocument();
  });
});

describe('Register Component', () => {
  const mockOnRegister = jest.fn();
  const mockOnBackToLogin = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render register form', () => {
    render(
      <Register 
        onRegister={mockOnRegister} 
        onBackToLogin={mockOnBackToLogin} 
      />
    );

    expect(screen.getByText(/criar nova conta/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^email/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /criar conta/i })).toBeInTheDocument();
  });

  it('should call onBackToLogin when back button is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <Register 
        onRegister={mockOnRegister} 
        onBackToLogin={mockOnBackToLogin} 
      />
    );

    const backButton = screen.getByText(/fazer login/i);
    await user.click(backButton);

    expect(mockOnBackToLogin).toHaveBeenCalled();
  });

  it('should validate required fields', async () => {
    const user = userEvent.setup();
    
    render(
      <Register 
        onRegister={mockOnRegister} 
        onBackToLogin={mockOnBackToLogin} 
      />
    );

    // Tentar submeter sem preencher
    const submitButton = screen.getByRole('button', { name: /criar conta/i });
    await user.click(submitButton);

    expect(screen.getByText(/nome é obrigatório/i)).toBeInTheDocument();
    expect(mockOnRegister).not.toHaveBeenCalled();
  });

  it('should validate email format', async () => {
    const user = userEvent.setup();
    
    render(
      <Register 
        onRegister={mockOnRegister} 
        onBackToLogin={mockOnBackToLogin} 
      />
    );

    await user.type(screen.getByLabelText(/nome completo/i), 'João Silva');
    await user.type(screen.getByLabelText(/^email/i), 'email-inválido');
    await user.click(screen.getByRole('button', { name: /criar conta/i }));

    expect(screen.getByText(/email inválido/i)).toBeInTheDocument();
  });

  it('should validate password confirmation', async () => {
    const user = userEvent.setup();
    
    render(
      <Register 
        onRegister={mockOnRegister} 
        onBackToLogin={mockOnBackToLogin} 
      />
    );

    await user.type(screen.getByLabelText(/nome completo/i), 'João Silva');
    await user.type(screen.getByLabelText(/^email/i), 'joao@exemplo.com');
    await user.type(screen.getByLabelText(/^senha/i), '123456');
    await user.type(screen.getByLabelText(/confirmar senha/i), '654321');
    await user.click(screen.getByRole('button', { name: /criar conta/i }));

    expect(screen.getByText(/senhas não coincidem/i)).toBeInTheDocument();
  });
});