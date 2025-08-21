import React, { useState, useEffect } from 'react';
import { useUser, UserProvider } from '../../contexts/UserContext';
import { User } from '../../services/api';
import ClientsList from './ClientsList';
import UserProfile from './UserProfile';

interface UserDashboardProps {
  currentUser: User;
  onLogout: () => void;
  onUserUpdate: (updatedUser: User) => void;
}

// Componente interno que usa o contexto
const UserDashboardContent: React.FC<UserDashboardProps> = ({ 
  currentUser, 
  onLogout, 
  onUserUpdate 
}) => {
  const { state, setUser, updateUser } = useUser();
  const [activeTab, setActiveTab] = useState<'clients' | 'profile'>('clients');
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Inicializar o usuário no contexto quando o componente monta
  useEffect(() => {
    setUser(currentUser);
  }, [currentUser, setUser]);

  // Função para lidar com updates do usuário
  const handleUserUpdate = (updatedUserData: User) => {
    updateUser(updatedUserData);
    onUserUpdate(updatedUserData);
  };

  const getRoleLabel = (role: string) => {
    return role === 'admin' ? 'Administrador' : 'Usuário';
  };

  const handleCreateClient = () => {
    // Aqui você pode implementar a lógica para criar um novo cliente
    // Por enquanto, vamos apenas mostrar um alert
    alert('Função de criar cliente ainda não implementada');
  };

  const handleEditClient = (client: any) => {
    // Aqui você pode implementar a lógica para editar um cliente
    // Por enquanto, vamos apenas mostrar um alert
    alert(`Editar cliente: ${client.razaoSocial}`);
  };

  const displayUser = state.currentUser || currentUser;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Estilo Conéctar */}
      <header className="bg-gradient-to-r from-green-500 to-green-600 shadow-md">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <h1 className="text-white text-xl font-bold">Conéctar</h1>
            </div>

            {/* Navigation Tabs - Desktop */}
            <div className="hidden md:flex items-center space-x-6">
              <button
                onClick={() => setActiveTab('clients')}
                className={`text-white font-medium pb-1 transition-all ${
                  activeTab === 'clients' ? 'border-b-2 border-white' : 'hover:text-green-100'
                }`}
              >
                Meus Clientes
              </button>
              <button
                onClick={() => setActiveTab('profile')}
                className={`text-white font-medium pb-1 transition-all ${
                  activeTab === 'profile' ? 'border-b-2 border-white' : 'hover:text-green-100'
                }`}
              >
                Meu Perfil
              </button>
              
              {/* User Menu */}
              <div className="flex items-center space-x-4">
                <span className="text-white">👤 {displayUser.name}</span>
                <span className="text-green-100 text-sm">({getRoleLabel(displayUser.role)})</span>
                <button 
                  onClick={onLogout}
                  className="flex items-center space-x-2 text-white hover:text-green-100"
                  title="Sair"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden text-white"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
          </div>

          {/* Mobile Menu */}
          {showMobileMenu && (
            <div className="md:hidden border-t border-green-400 py-4">
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => {
                    setActiveTab('clients');
                    setShowMobileMenu(false);
                  }}
                  className={`text-white text-left ${activeTab === 'clients' ? 'font-medium' : ''}`}
                >
                  Meus Clientes
                </button>
                <button
                  onClick={() => {
                    setActiveTab('profile');
                    setShowMobileMenu(false);
                  }}
                  className={`text-white text-left ${activeTab === 'profile' ? 'font-medium' : ''}`}
                >
                  Meu Perfil
                </button>
                <div className="border-t border-green-400 pt-3">
                  <span className="text-green-100 text-sm block mb-2">
                    👤 {displayUser.name} ({getRoleLabel(displayUser.role)})
                  </span>
                  <button 
                    onClick={onLogout}
                    className="text-white text-left"
                  >
                    Sair
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Conteúdo Principal */}
      <div className="w-full">
        {activeTab === 'clients' ? (
          <ClientsList 
            onCreateClient={handleCreateClient}
            onEditClient={handleEditClient}
            onLogout={onLogout}
          />
        ) : (
          <div className="max-w-7xl mx-auto px-6 py-6">
            <UserProfile 
              currentUser={displayUser}
              onLogout={onLogout}
              onUserUpdate={handleUserUpdate}
            />
          </div>
        )}
      </div>
    </div>
  );
};

// Componente principal que fornece o contexto
const UserDashboard: React.FC<UserDashboardProps> = (props) => {
  return (
    <UserProvider>
      <UserDashboardContent {...props} />
    </UserProvider>
  );
};

export default UserDashboard;