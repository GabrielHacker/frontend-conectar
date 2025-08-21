import React, { useState, useEffect } from 'react';
import { Client, clientsAPI } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import logo from '../../assets/logo.png';

interface ClientsListProps {
  onCreateClient: () => void;
  onEditClient: (client: Client) => void;
  onLogout: () => void;
}

const ClientsList: React.FC<ClientsListProps> = ({ onCreateClient, onEditClient, onLogout }) => {
  const { state } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [filters, setFilters] = useState({
    nomeNaFachada: '',
    cnpj: '',
    status: '',
    conectarPlus: '',
    sortBy: '',
    order: 'asc' as 'asc' | 'desc',
  });

  const loadClients = async () => {
    try {
      setLoading(true);
      const data = await clientsAPI.getAll({
        nomeNaFachada: filters.nomeNaFachada || undefined,
        cnpj: filters.cnpj || undefined,
        status: filters.status || undefined,
      });
      setClients(data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleFilter = () => {
    loadClients();
  };

  const clearFilters = () => {
    setFilters({
      nomeNaFachada: '',
      cnpj: '',
      status: '',
      conectarPlus: '',
      sortBy: '',
      order: 'asc',
    });
  };

  const handleDelete = async (client: Client) => {
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

  const handleCreateSuccess = () => {
    loadClients();
    alert('Cliente criado com sucesso!');
  };

  const handleCreateClient = () => {
    onCreateClient();
  };

  const handleEditClient = (client: Client) => {
    onEditClient(client);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Conectar Style */}
      <header style={{ background: 'linear-gradient(to right, #1bb17a, #059669)' }} className="shadow-md">
        <div className="px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <img 
                src={logo} 
                className="h-28 w-auto"
              />

                            <span className="text-white font-medium border-b-2 border-white pb-1">
                Clientes
              </span>
            </div>

            {/* Navigation - Desktop */}
            <div className="hidden md:flex items-center space-x-6">

              
              {/* User Menu */}
              <div className="flex items-center space-x-4">
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
                <span className="text-white font-medium">Clientes</span>
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

      <main className="px-6 py-6">
        {/* Page Title */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 border-b-2 border-gray-900 inline-block pb-1">
            Dados Básicos
          </h2>
        </div>

        {/* Filters Section */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div 
            className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50"
            onClick={() => setShowFilters(!showFilters)}
          >
            <div className="flex items-center space-x-3">
              <svg className="w-5 h-5" style={{ color: '#1bb17a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Buscar por nome
                  </label>
                  <input
                    type="text"
                    value={filters.nomeNaFachada}
                    onChange={(e) => setFilters({ ...filters, nomeNaFachada: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                    placeholder="Digite aqui sua busca"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                    placeholder="Digite aqui sua busca"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Buscar por status
                  </label>
                  <select
                    value={filters.status}
                    onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                  >
                    <option value="">Selecione</option>
                    <option value="ativo">Ativo</option>
                    <option value="inativo">Inativo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Buscar por conectar+
                  </label>
                  <select
                    value={filters.conectarPlus}
                    onChange={(e) => setFilters({ ...filters, conectarPlus: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:border-transparent"
                  >
                    <option value="">Selecione</option>
                    <option value="sim">Sim</option>
                    <option value="nao">Não</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={clearFilters}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium"
                >
                  Limpar campos
                </button>
                <button
                  onClick={handleFilter}
                  className="px-6 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 font-medium"
                >
                  Filtrar
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Clients Table */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">Clientes</h3>
                <p className="text-sm text-gray-500">Você tem {clients.length} cliente(s) para exibir essas informações</p>
              </div>
              <button 
                onClick={handleCreateClient}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 border border-gray-300 font-medium"
              >
                Novo
              </button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent" style={{ borderColor: '#1bb17a', borderTopColor: 'transparent' }}></div>
              <span className="ml-3 text-gray-600">Carregando clientes...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              {/* Desktop Table */}
              <table className="hidden md:table w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Razão social
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CNPJ
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome na fachada
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tags
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Conectar Plus
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
                          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1bb17a' }}>
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {client.cidade}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${
                          client.status === 'ativo' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          <div className={`w-1.5 h-1.5 rounded-full mr-1`} style={{ 
                            backgroundColor: client.status === 'ativo' ? '#1bb17a' : '#dc2626' 
                          }}></div>
                          {client.status === 'ativo' ? 'Ativo' : 'Inativo'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          Não
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditClient(client)}
                            className="hover:opacity-80 transition-opacity"
                            style={{ color: '#1bb17a' }}
                            title="Editar cliente"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(client)}
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
                        <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#1bb17a' }}>
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
                      <div className="flex items-center mt-1">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 mr-2">
                          {client.cidade}
                        </span>
                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                          Conectar Plus: Não
                        </span>
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleEditClient(client)}
                        className="hover:opacity-80 transition-opacity"
                        style={{ color: '#1bb17a' }}
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(client)}
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
                    Comece criando seu primeiro cliente
                  </p>
                  <button
                    onClick={handleCreateClient}
                    className="px-4 py-2 text-white rounded-md font-medium transition-colors"
                    style={{ 
                      backgroundColor: '#1bb17a'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#059669'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#1bb17a'}
                  >
                    + Criar Primeiro Cliente
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default ClientsList;