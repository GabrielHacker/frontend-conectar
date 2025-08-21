import React, { useState, useEffect } from 'react';
import { User, usersAPI, Client, clientsAPI } from '../services/api';
import EditUserModal from '../components/EditUserModal';
import NotificationPanel from '../components/NotificationPanel';

interface UsersListProps {
  currentUser: User;
  onLogout: () => void;
}

const UsersList: React.FC<UsersListProps> = ({ currentUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'users' | 'clients'>('users');
  
  // Estados para Usuários
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState(true);
  const [userFilters, setUserFilters] = useState({
    name: '',
    email: '',
    role: '',
    sortBy: '',
    order: 'asc' as 'asc' | 'desc',
  });
  
  // Estados para Clientes
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [clientFilters, setClientFilters] = useState({
    nomeNaFachada: '',
    cnpj: '',
    status: '',
    cidade: '',
    sortBy: '',
    order: 'asc' as 'asc' | 'desc',
  });
  
  // Estados gerais
  const [showFilters, setShowFilters] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Funções para Usuários
  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      const data = await usersAPI.getAll(userFilters);
      setUsers(data);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setUsersLoading(false);
    }
  };

  // Funções para Clientes
  const loadClients = async () => {
    try {
      setClientsLoading(true);
      const data = await clientsAPI.getAll(clientFilters);
      setClients(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setClientsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers();
    } else {
      loadClients();
    }
  }, [activeTab]);

  const handleUserFilter = () => {
    loadUsers();
  };

  const handleClientFilter = () => {
    loadClients();
  };

  const clearUserFilters = () => {
    setUserFilters({
      name: '',
      email: '',
      role: '',
      sortBy: '',
      order: 'asc',
    });
  };

  const clearClientFilters = () => {
    setClientFilters({
      nomeNaFachada: '',
      cnpj: '',
      status: '',
      cidade: '',
      sortBy: '',
      order: 'asc',
    });
  };

  const handleEdit = (user: User) => {
    setEditingUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = async (user: User) => {
    if (user.id === currentUser.id) {
      alert('Você não pode excluir sua própria conta!');
      return;
    }

    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir o usuário "${user.name}"?`
    );

    if (confirmDelete) {
      try {
        await usersAPI.delete(user.id);
        alert('Usuário excluído com sucesso!');
        loadUsers();
      } catch (error: any) {
        alert(error.response?.data?.message || 'Erro ao excluir usuário');
      }
    }
  };

  const handleDeleteClient = async (client: Client) => {
    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir o cliente "${client.razaoSocial}"?`
    );

    if (confirmDelete) {
      try {
        await clientsAPI.delete(client.id);
        alert('Cliente excluído com sucesso!');
        loadClients();
      } catch (error: any) {
        alert(error.response?.data?.message || 'Erro ao excluir cliente');
      }
    }
  };

  const handleEditSuccess = () => {
    loadUsers();
    alert('Usuário atualizado com sucesso!');
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Nunca';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRoleLabel = (role: string) => {
    return role === 'admin' ? 'Admin' : 'Usuário';
  };

  const canEditUser = (user: User) => {
    return currentUser.role === 'admin' || user.id === currentUser.id;
  };

  const canDeleteUser = (user: User) => {
    return currentUser.role === 'admin' && user.id !== currentUser.id;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
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
                onClick={() => setActiveTab('users')}
                className={`text-white font-medium pb-1 transition-all ${
                  activeTab === 'users' ? 'border-b-2 border-white' : 'hover:text-green-100'
                }`}
              >
                Usuários
              </button>
              <button
                onClick={() => setActiveTab('clients')}
                className={`text-white font-medium pb-1 transition-all ${
                  activeTab === 'clients' ? 'border-b-2 border-white' : 'hover:text-green-100'
                }`}
              >
                Clientes
              </button>
              
              {/* User Menu */}
              <div className="flex items-center space-x-4">
                <button className="text-white hover:text-green-100">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </button>
                
                <button 
                  onClick={() => setShowNotifications(true)}
                  className="text-white hover:text-green-100"
                >
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
                    setActiveTab('users');
                    setShowMobileMenu(false);
                  }}
                  className={`text-white text-left ${activeTab === 'users' ? 'font-medium' : ''}`}
                >
                  Usuários
                </button>
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
                  onClick={() => setShowNotifications(true)}
                  className="text-white text-left"
                >
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

      <main className="max-w-7xl mx-auto px-6 py-6">
        {/* Page Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-gray-900 inline-block pb-1">
            {activeTab === 'users' ? 'Usuários' : 'Clientes'}
          </h2>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div 
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
            onClick={() => setShowFilters(!showFilters)}
          >
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <div>
                <h3 className="font-semibold text-gray-900">Filtros</h3>
                <p className="text-sm text-gray-500">Filtre e busque itens na página</p>
              </div>
            </div>
            <svg className={`w-5 h-5 text-gray-400 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </div>

          {showFilters && (
            <div className="border-t border-gray-200 p-4">
              {activeTab === 'users' ? (
                // Filtros para Usuários
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Buscar por nome
                      </label>
                      <input
                        type="text"
                        value={userFilters.name}
                        onChange={(e) => setUserFilters({ ...userFilters, name: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Buscar por email
                      </label>
                      <input
                        type="text"
                        value={userFilters.email}
                        onChange={(e) => setUserFilters({ ...userFilters, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Função
                      </label>
                      <select
                        value={userFilters.role}
                        onChange={(e) => setUserFilters({ ...userFilters, role: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">Selecione</option>
                        <option value="admin">Admin</option>
                        <option value="user">Usuário</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ordenar por
                      </label>
                      <select
                        value={userFilters.sortBy}
                        onChange={(e) => setUserFilters({ ...userFilters, sortBy: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">Data de criação</option>
                        <option value="name">Nome</option>
                        <option value="email">Email</option>
                        <option value="role">Função</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={clearUserFilters}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
                    >
                      Limpar campos
                    </button>
                    <button
                      onClick={handleUserFilter}
                      className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 font-medium"
                    >
                      Filtrar
                    </button>
                  </div>
                </>
              ) : (
                // Filtros para Clientes
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Buscar por nome
                      </label>
                      <input
                        type="text"
                        value={clientFilters.nomeNaFachada}
                        onChange={(e) => setClientFilters({ ...clientFilters, nomeNaFachada: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        placeholder="Nome na fachada"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Buscar por CNPJ
                      </label>
                      <input
                        type="text"
                        value={clientFilters.cnpj}
                        onChange={(e) => setClientFilters({ ...clientFilters, cnpj: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={clientFilters.status}
                        onChange={(e) => setClientFilters({ ...clientFilters, status: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="">Selecione</option>
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cidade
                      </label>
                      <input
                        type="text"
                        value={clientFilters.cidade}
                        onChange={(e) => setClientFilters({ ...clientFilters, cidade: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={clearClientFilters}
                      className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
                    >
                      Limpar campos
                    </button>
                    <button
                      onClick={handleClientFilter}
                      className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 font-medium"
                    >
                      Filtrar
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Content Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {activeTab === 'users' ? 'Usuários' : 'Clientes'}
                </h3>
                <p className="text-sm text-gray-500">
                  {activeTab === 'users' 
                    ? 'Gerenciar usuários do sistema'
                    : `Total de ${clients.length} cliente(s) cadastrado(s)`
                  }
                </p>
              </div>
              <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 border border-gray-300 font-medium">
                Novo
              </button>
            </div>
          </div>

          {(activeTab === 'users' ? usersLoading : clientsLoading) ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent"></div>
              <span className="ml-3 text-gray-600">
                Carregando {activeTab === 'users' ? 'usuários' : 'clientes'}...
              </span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {activeTab === 'users' ? (
                // Tabela de Usuários
                <>
                  <table className="hidden md:table w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nome
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Função
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Último Acesso
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                  {user.name.charAt(0)}
                                </span>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                <div className="text-sm text-gray-500">ID: {user.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              user.role === 'admin' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {getRoleLabel(user.role)}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(user.lastLogin)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                              <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></div>
                              Ativo
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              {canEditUser(user) && (
                                <button
                                  onClick={() => handleEdit(user)}
                                  className="text-green-600 hover:text-green-900"
                                  title="Editar usuário"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                  </svg>
                                </button>
                              )}
                              {canDeleteUser(user) && (
                                <button
                                  onClick={() => handleDeleteUser(user)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Excluir usuário"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                  </svg>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Mobile Cards para Usuários */}
                  <div className="md:hidden divide-y divide-gray-200">
                    {users.map((user) => (
                      <div key={user.id} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium">
                                {user.name.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="font-medium text-gray-900">{user.name}</div>
                              <div className="text-sm text-gray-500">{user.email}</div>
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'admin' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {getRoleLabel(user.role)}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-500 mb-3">
                          <div>Último acesso: {formatDate(user.lastLogin)}</div>
                          <div className="flex items-center mt-1">
                            <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                            Ativo
                          </div>
                        </div>

                        <div className="flex space-x-3">
                          {canEditUser(user) && (
                            <button
                              onClick={() => handleEdit(user)}
                              className="text-green-600 hover:text-green-900"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                              </svg>
                            </button>
                          )}
                          {canDeleteUser(user) && (
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="text-red-600 hover:text-red-900"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {users.length === 0 && (
                    <div className="text-center py-12">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum usuário encontrado</h3>
                      <p className="text-gray-500">
                        Ajuste seus filtros ou adicione novos usuários ao sistema.
                      </p>
                    </div>
                  )}
                </>
              ) : (
                // Tabela de Clientes
                <>
                  <table className="hidden md:table w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Razão Social
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          CNPJ
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nome na Fachada
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Cidade
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Responsável
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {clients.map((client) => (
                        <tr key={client.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                                <span className="text-white text-sm font-medium">
                                  {client.razaoSocial.charAt(0)}
                                </span>
                              </div>
                              <div className="ml-3">
                                <div className="text-sm font-medium text-gray-900">{client.razaoSocial}</div>
                                <div className="text-sm text-gray-500">ID: {client.id}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                            {client.cnpj}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {client.nomeNaFachada}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {client.cidade}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                              client.status === 'ativo' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              <div className={`w-1.5 h-1.5 rounded-full mr-1`} style={{ 
                                backgroundColor: client.status === 'ativo' ? '#10b981' : '#dc2626' 
                              }}></div>
                              {client.status === 'ativo' ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {client.user?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  // Implementar edição de cliente
                                  console.log('Editar cliente:', client.id);
                                }}
                                className="text-green-600 hover:text-green-900"
                                title="Editar cliente"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                </svg>
                              </button>
                              <button
                                onClick={() => handleDeleteClient(client)}
                                className="text-red-600 hover:text-red-900"
                                title="Excluir cliente"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Mobile Cards para Clientes */}
                  <div className="md:hidden divide-y divide-gray-200">
                    {clients.map((client) => (
                      <div key={client.id} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                              <span className="text-white font-medium">
                                {client.razaoSocial.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="font-medium text-gray-900">{client.razaoSocial}</div>
                              <div className="text-sm text-gray-500">{client.cnpj}</div>
                            </div>
                          </div>
                          <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                            client.status === 'ativo' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {client.status === 'ativo' ? 'Ativo' : 'Inativo'}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-500 mb-3">
                          <div>Nome na fachada: {client.nomeNaFachada}</div>
                          <div>Cidade: {client.cidade}</div>
                          <div>Responsável: {client.user?.name || 'N/A'}</div>
                        </div>

                        <div className="flex space-x-3">
                          <button
                            onClick={() => {
                              console.log('Editar cliente:', client.id);
                            }}
                            className="text-green-600 hover:text-green-900"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDeleteClient(client)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {clients.length === 0 && (
                    <div className="text-center py-12">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum cliente encontrado</h3>
                      <p className="text-gray-500 mb-4">
                        Não há clientes cadastrados no sistema ou nenhum corresponde aos filtros aplicados.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <EditUserModal
        user={editingUser}
        currentUser={currentUser}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingUser(null);
        }}
        onSuccess={handleEditSuccess}
      />

      <NotificationPanel
        isOpen={showNotifications}
        onClose={() => setShowNotifications(false)}
      />
    </div>
  );
};

export default UsersList;