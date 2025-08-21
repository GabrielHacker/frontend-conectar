import React, { useState, useEffect } from 'react';
import EditUserModal from '../../components/EditUserModal';
import { useAdmin } from '../../contexts/AdminContext';
import { User } from '../../services/api';

interface UsersManagementProps {
  currentUser: User;
}

const UsersManagement: React.FC<UsersManagementProps> = ({ currentUser }) => {
  const {
    state: { users: allUsers, isLoadingUsers, usersError },
    loadUsers,
    updateUser,
    deleteUser,
    clearErrors,
    getFilteredUsers
  } = useAdmin();

  const [showFilters, setShowFilters] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  
  const [filters, setFilters] = useState({
    name: '',
    email: '',
    role: '',
    sortBy: '',
    order: 'asc' as 'asc' | 'desc',
  });

  // Get filtered users from context
  const users = getFilteredUsers(filters);

  // Load users on component mount
  useEffect(() => {
    // Load all users initially (context will handle caching)
    loadUsers({}, false).catch(console.error);
  }, []);

  // Clear errors when component unmounts or changes
  useEffect(() => {
    return () => {
      clearErrors();
    };
  }, [clearErrors]);

  const handleFilter = () => {
    // Since we're using client-side filtering, no need to call API
    // The users variable is already filtered via getFilteredUsers
    console.log('Filtering with:', filters);
  };

  const handleForceRefresh = async () => {
    try {
      await loadUsers({}, true); // Force refresh from API
    } catch (error) {
      console.error('Erro ao recarregar usuários:', error);
    }
  };

  const clearFilters = () => {
    setFilters({
      name: '',
      email: '',
      role: '',
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
        await deleteUser(user.id);
        alert('Usuário excluído com sucesso!');
      } catch (error: any) {
        alert(error.message || 'Erro ao excluir usuário');
      }
    }
  };

  const handleEditSuccess = () => {
    // The context will automatically update the user in state
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
    <main className="max-w-7xl mx-auto px-6 py-6">
      {/* Page Title */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-gray-900 inline-block pb-1">
            Usuários
          </h2>
          <button
            onClick={handleForceRefresh}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-green-50 text-green-700 rounded-md hover:bg-green-100 border border-green-200"
            disabled={isLoadingUsers}
          >
            <svg className={`w-4 h-4 ${isLoadingUsers ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <span>Atualizar</span>
          </button>
        </div>
        
        {/* Error Display */}
        {usersError && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-700">{usersError}</p>
                <button
                  onClick={clearErrors}
                  className="text-sm text-red-600 underline hover:text-red-800 mt-1"
                >
                  Dispensar
                </button>
              </div>
            </div>
          </div>
        )}
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
              <p className="text-sm text-gray-500">Filtre e busque usuários localmente</p>
            </div>
          </div>
          <svg className={`w-5 h-5 text-gray-400 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"/>
          </svg>
        </div>

        {showFilters && (
          <div className="border-t border-gray-200 p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar por nome
                </label>
                <input
                  type="text"
                  value={filters.name}
                  onChange={(e) => setFilters({ ...filters, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Buscar por email
                </label>
                <input
                  type="text"
                  value={filters.email}
                  onChange={(e) => setFilters({ ...filters, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Função
                </label>
                <select
                  value={filters.role}
                  onChange={(e) => setFilters({ ...filters, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Todos</option>
                  <option value="admin">Admin</option>
                  <option value="user">Usuário</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ordenar por
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Data de criação</option>
                  <option value="name">Nome</option>
                  <option value="email">Email</option>
                  <option value="role">Função</option>
                  <option value="lastLogin">Último acesso</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ordem
                </label>
                <select
                  value={filters.order}
                  onChange={(e) => setFilters({ ...filters, order: e.target.value as 'asc' | 'desc' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                >
                  <option value="asc">Crescente</option>
                  <option value="desc">Decrescente</option>
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-600">
                Mostrando {users.length} de {allUsers.length} usuários
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
                >
                  Limpar filtros
                </button>
                <button
                  onClick={handleFilter}
                  className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 font-medium"
                >
                  Aplicar filtros
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-gray-900">Usuários</h3>
              <p className="text-sm text-gray-500">
                {isLoadingUsers ? 'Carregando...' : `${users.length} usuário(s) encontrado(s)`}
              </p>
            </div>
            <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 font-medium">
              Novo Usuário
            </button>
          </div>
        </div>

        {isLoadingUsers ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent"></div>
            <span className="ml-3 text-gray-600">Carregando usuários...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Tabela Desktop */}
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

            {/* Mobile Cards */}
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

            {users.length === 0 && !isLoadingUsers && (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {allUsers.length === 0 ? 'Nenhum usuário cadastrado' : 'Nenhum usuário encontrado'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {allUsers.length === 0 
                    ? 'Não há usuários cadastrados no sistema ainda.' 
                    : 'Nenhum usuário corresponde aos filtros aplicados. Tente ajustar os critérios de busca.'
                  }
                </p>
                {allUsers.length > 0 && (
                  <button
                    onClick={clearFilters}
                    className="text-green-600 hover:text-green-800 underline"
                  >
                    Limpar filtros
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      <EditUserModal
        user={editingUser}
        currentUser={currentUser}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingUser(null);
        }}
        onSuccess={handleEditSuccess}
        onUserUpdate={updateUser}
      />
    </main>
  );
};

export default UsersManagement;