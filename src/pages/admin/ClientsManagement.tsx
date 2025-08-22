import React, { useState, useEffect } from 'react';
import { User } from '../../services/api';
import { useAdmin } from '../../contexts/AdminContext';

interface ClientsManagementProps {
  currentUser: User;
}

const ClientsManagement: React.FC<ClientsManagementProps> = ({ currentUser }) => {
  const {
    state: { clients: allClients, isLoadingClients, clientsError },
    loadClients,
    deleteClient,
    clearErrors,
    getFilteredClients
  } = useAdmin();

  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({
    nomeNaFachada: '',
    cnpj: '',
    status: '',
    cidade: '',
    sortBy: '',
    order: 'asc' as 'asc' | 'desc',
  });

  // Get filtered clients from context
  const clients = getFilteredClients(filters);

  // Load clients on component mount or when filters change significantly
  useEffect(() => {
    // Load all clients initially (context will handle caching)
    loadClients({}, false).catch(console.error);
  }, []);

  // Clear errors when component unmounts or changes
  useEffect(() => {
    return () => {
      clearErrors();
    };
  }, [clearErrors]);

  const handleFilter = () => {
    // Since we're using client-side filtering, no need to call API
    // The clients variable is already filtered via getFilteredClients
    console.log('Filtering with:', filters);
  };

  const handleForceRefresh = async () => {
    try {
      await loadClients({}, true); // Force refresh from API
    } catch (error) {
      console.error('Erro ao recarregar clientes:', error);
    }
  };

  const clearFilters = () => {
    setFilters({
      nomeNaFachada: '',
      cnpj: '',
      status: '',
      cidade: '',
      sortBy: '',
      order: 'asc',
    });
  };

  const handleDeleteClient = async (client: any) => {
    const confirmDelete = window.confirm(
      `Tem certeza que deseja excluir o cliente "${client.razaoSocial}"?`
    );

    if (confirmDelete) {
      try {
        await deleteClient(client.id);
        alert('Cliente excluído com sucesso!');
      } catch (error: any) {
        alert(error.message || 'Erro ao excluir cliente');
      }
    }
  };

  const handleEditClient = (client: any) => {
    // Implementar edição de cliente
    console.log('Editar cliente:', client.id);
    alert(`Editar cliente: ${client.razaoSocial} (funcionalidade a ser implementada)`);
  };

  return (
    <main className="max-w-7xl mx-auto px-6 py-6">
      {/* Page Title */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-gray-900 inline-block pb-1">
            Clientes
          </h2>
          <button
            onClick={handleForceRefresh}
            className="flex items-center space-x-2 px-3 py-2 text-sm bg-green-50 text-green-700 rounded-md hover:bg-green-100 border border-green-200"
            disabled={isLoadingClients}
          >
            <svg className={`w-4 h-4 ${isLoadingClients ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
            <span>Atualizar</span>
          </button>
        </div>
        
        {/* Error Display */}
        {clientsError && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <div className="ml-3">
                <p className="text-sm text-red-700">{clientsError}</p>
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
              <p className="text-sm text-gray-500">Filtre e busque clientes localmente</p>
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
                  value={filters.nomeNaFachada}
                  onChange={(e) => setFilters({ ...filters, nomeNaFachada: e.target.value })}
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
                  value={filters.cnpj}
                  onChange={(e) => setFilters({ ...filters, cnpj: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                >
                  <option value="">Todos</option>
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
                  value={filters.cidade}
                  onChange={(e) => setFilters({ ...filters, cidade: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                />
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
                  <option value="razaoSocial">Razão Social</option>
                  <option value="nomeNaFachada">Nome na Fachada</option>
                  <option value="cidade">Cidade</option>
                  <option value="status">Status</option>
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
                Mostrando {clients.length} de {allClients.length} clientes
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
              <h3 className="font-semibold text-gray-900">Clientes</h3>
              <p className="text-sm text-gray-500">
                {isLoadingClients ? 'Carregando...' : `Total de ${clients.length} cliente(s) encontrado(s)`}
              </p>
            </div>
          </div>
        </div>

        {isLoadingClients ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent"></div>
            <span className="ml-3 text-gray-600">Carregando clientes...</span>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {/* Tabela Desktop */}
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
                          onClick={() => handleEditClient(client)}
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

            {/* Mobile Cards */}
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
                      onClick={() => handleEditClient(client)}
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

            {clients.length === 0 && !isLoadingClients && (
              <div className="text-center py-12">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-1">
                  {allClients.length === 0 ? 'Nenhum cliente cadastrado' : 'Nenhum cliente encontrado'}
                </h3>
                <p className="text-gray-500 mb-4">
                  {allClients.length === 0 
                    ? 'Não há clientes cadastrados no sistema ainda.' 
                    : 'Nenhum cliente corresponde aos filtros aplicados. Tente ajustar os critérios de busca.'
                  }
                </p>
                {allClients.length > 0 && (
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
    </main>
  );
};

export default ClientsManagement;