import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Login from '../pages/Login';
import Register from '../pages/Register';
import { authAPI } from '../services/api';
import AdminDashboard from '../pages/admin/AdminDashboard';
import UserDashboard from '../pages/usuarios/UserDashboard';

const AppContent: React.FC = () => {
  const { state, login, logout, updateUser } = useAuth();
  const { user, isAuthenticated, isLoading, error } = state;
  
  // Estado para controlar qual tela mostrar quando não autenticado
  const [showRegister, setShowRegister] = useState(false);

  const handleRegister = async (userData: {
    name: string;
    email: string;
    password: string;
  }) => {
    try {
      const response = await authAPI.register(userData);
      
      // Verificar se houve erro na resposta
      if (response.message === 'Email já está em uso') {
        throw new Error(response.error || 'Este email já está cadastrado no sistema.');
      }
      
      if (response.message === 'User created successfully') {
        // Após cadastro bem-sucedido, fazer login automaticamente
        await login(userData.email, userData.password);
        setShowRegister(false);
      } else {
        throw new Error(response.error || 'Erro ao criar conta');
      }
    } catch (error: any) {
      console.error('Erro no cadastro:', error);
      
      // Tratar diferentes tipos de erro
      let errorMessage = 'Erro ao criar conta. Tente novamente.';
      
      if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      throw new Error(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        fontSize: '18px'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid rgba(255, 255, 255, 0.3)',
            borderTop: '4px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          Carregando...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    if (showRegister) {
      return (
        <Register 
          onRegister={handleRegister}
          onBackToLogin={() => setShowRegister(false)}
          error={error} 
        />
      );
    }
    
    return (
      <Login 
        onLogin={login} 
        onRegisterClick={() => setShowRegister(true)}
        error={error} 
      />
    );
  }

  // Renderizar baseado na role do usuário
  if (user?.role === 'admin') {
    // Administradores veem o dashboard modular com abas (usuários + todos os clientes)
    // O AdminDashboard já tem o AdminProvider interno
    return (
      <AdminDashboard 
        currentUser={user} 
        onLogout={logout} 
      />
    );
  } else {
    // Usuários regulares veem dashboard com abas (perfil + seus clientes)
    return (
      <UserDashboard 
        currentUser={user!} 
        onLogout={logout}
        onUserUpdate={updateUser}
      />
    );
  }
};

export default AppContent;