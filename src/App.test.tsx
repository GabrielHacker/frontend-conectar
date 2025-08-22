// src/App.test.tsx (Versão Simples)
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

// Mock do logo para evitar erros de importação
jest.mock('./assets/logo.png', () => 'logo-mock.png');

describe('App', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders without crashing', () => {
    render(<App />);
    expect(document.body).toBeInTheDocument();
  });

  it('shows login form when not authenticated', async () => {
    render(<App />);

    await waitFor(() => {
      expect(screen.getByText(/entrar/i)).toBeInTheDocument();
    });

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
  });

  it('displays the logo', async () => {
    render(<App />);

    await waitFor(() => {
      const logo = screen.getByAltText(/conectar logo/i);
      expect(logo).toBeInTheDocument();
    });
  });
});