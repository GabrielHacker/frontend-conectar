import React, { useState, useEffect } from 'react';
import { useUser, UserProvider } from '../../contexts/UserContext';
import { User, Client } from '../../services/api';
import ClientsList from './ClientsList';
import UserProfile from './UserProfile';
import logo from '../../assets/logo.png';
import CreateClientModal from '../../components/CreateClientModal';
import EditUserModal from '../../components/EditUserModal';
import EditClientModal from '../../components/EditClientModal';

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
  
  // Estados para os modais
  const [showCreateClientModal, setShowCreateClientModal] = useState(false);
  const [showEditClientModal, setShowEditClientModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [clientsListKey, setClientsListKey] = useState(0); // Para forçar re-render da lista

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
    setShowCreateClientModal(true);
  };

  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setShowEditClientModal(true);
  };

  const handleCreateClientSuccess = () => {
    setShowCreateClientModal(false);
    setClientsListKey(prev => prev + 1); // Força re-render da lista de clientes
  };

  const handleEditClientSuccess = () => {
    setShowEditClientModal(false);
    setSelectedClient(null);
    setClientsListKey(prev => prev + 1); // Força re-render da lista de clientes
  };

  const handleCloseCreateModal = () => {
    setShowCreateClientModal(false);
  };

  const handleCloseEditModal = () => {
    setShowEditClientModal(false);
    setSelectedClient(null);
  };

  const displayUser = state.currentUser || currentUser;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Conectar Style */}
      <header style={{ background: 'linear-gradient(to right, #1bb17a, #059669)' }} className="shadow-md">
        <div className="px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo e Navigation - Lado Esquerdo */}
            <div className="flex items-center space-x-8">
              {/* Logo */}
              <img 
                src={logo} 
                className="h-28 w-auto"
              />

              {/* Navigation Tabs - Desktop */}
              <div className="hidden md:flex items-center space-x-6">
                <button
                  onClick={() => setActiveTab('clients')}
                  className={`text-white font-medium pb-1 transition-all ${
                    activeTab === 'clients' ? 'border-b-2 border-white' : 'hover:text-green-100'
                  }`}
                >
                  Clientes
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`text-white font-medium pb-1 transition-all ${
                    activeTab === 'profile' ? 'border-b-2 border-white' : 'hover:text-green-100'
                  }`}
                >
                  Perfil
                </button>
              </div>
            </div>
            
            {/* User Menu - Lado Direito */}
            <div className="hidden md:flex items-center space-x-4">
              <button className="text-white hover:text-green-100">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </button>
              
              <button className="text-white hover:text-green-100">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
                </svg>
              </button>

              <button 
                onClick={onLogout}
                className="flex items-center space-x-2 text-white hover:text-green-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                </svg>
              </button>
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
                  Clientes
                </button>
                <button
                  onClick={() => {
                    setActiveTab('profile');
                    setShowMobileMenu(false);
                  }}
                  className={`text-white text-left ${activeTab === 'profile' ? 'font-medium' : ''}`}
                >
                  Perfil
                </button>
                <button className="text-white text-left">
                  Notificações
                </button>
                <button 
                  onClick={onLogout}
                  className="text-white text-left"
                >
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Conteúdo Principal */}
      <div className="w-full">
        {activeTab === 'clients' ? (
          <ClientsList 
            key={clientsListKey}
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

      {/* Modais */}
      <CreateClientModal
        isOpen={showCreateClientModal}
        onClose={handleCloseCreateModal}
        onSuccess={handleCreateClientSuccess}
      />

      <EditClientModal
        isOpen={showEditClientModal}
        client={selectedClient}
        onClose={handleCloseEditModal}
        onSuccess={handleEditClientSuccess}
      />
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