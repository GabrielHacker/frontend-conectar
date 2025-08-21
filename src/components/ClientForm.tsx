import React, { useState, useEffect } from 'react';
import { CreateClientDto, clientsAPI } from '../services/api';
import logo from '../assets/logo.png';

interface ClientFormProps {
  onLogout: () => void;
  onBack: () => void;
  onSuccess: () => void;
  mode: 'create' | 'edit';
  clientId?: string;
}

const ClientForm: React.FC<ClientFormProps> = ({ 
  onLogout, 
  onBack, 
  onSuccess, 
  mode, 
  clientId 
}) => {
  const isEditing = mode === 'edit';

  const [activeTab, setActiveTab] = useState('dados-cadastrais');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  const [formData, setFormData] = useState<CreateClientDto>({
    razaoSocial: '',
    cnpj: '',
    nomeNaFachada: '',
    rua: '',
    numero: '',
    bairro: '',
    cidade: '',
    estado: '',
    cep: '',
    telefone: '',
    email: '',
    status: 'ativo',
    observacoes: ''
  });

  // Carregar dados do cliente se estiver editando
  useEffect(() => {
    if (isEditing && clientId) {
      loadClient(clientId);
    }
  }, [clientId, isEditing]);

  const loadClient = async (clientId: string) => {
    try {
      setLoading(true);
      const client = await clientsAPI.getById(clientId);
      setFormData({
        razaoSocial: client.razaoSocial || '',
        cnpj: client.cnpj || '',
        nomeNaFachada: client.nomeNaFachada || '',
        rua: client.rua || '',
        numero: client.numero || '',
        bairro: client.bairro || '',
        cidade: client.cidade || '',
        estado: client.estado || '',
        cep: client.cep || '',
        telefone: client.telefone || '',
        email: client.email || '',
        status: client.status || 'ativo',
        observacoes: client.observacoes || ''
      });
    } catch (error) {
      console.error('Erro ao carregar cliente:', error);
      alert('Erro ao carregar dados do cliente');
      onBack();
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Validações para aba "Dados Cadastrais"
    if (activeTab === 'dados-cadastrais') {
      if (!formData.razaoSocial?.trim()) {
        newErrors.razaoSocial = 'Razão Social é obrigatória';
      }

      if (!formData.cnpj?.trim()) {
        newErrors.cnpj = 'CNPJ é obrigatório';
      } else if (!/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/.test(formData.cnpj)) {
        newErrors.cnpj = 'CNPJ deve estar no formato XX.XXX.XXX/XXXX-XX';
      }

      if (!formData.nomeNaFachada?.trim()) {
        newErrors.nomeNaFachada = 'Nome na Fachada é obrigatório';
      }

      if (!formData.cidade?.trim()) {
        newErrors.cidade = 'Cidade é obrigatória';
      }

      if (!formData.estado?.trim()) {
        newErrors.estado = 'Estado é obrigatório';
      }

      if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Email deve ter um formato válido';
      }

      if (formData.cep && !/^\d{5}-?\d{3}$/.test(formData.cep)) {
        newErrors.cep = 'CEP deve ter um formato válido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSaving(true);
    
    try {
      // Prepare data ensuring required fields have values
      const clientData = {
        ...formData,
        // Ensure required fields are not undefined
        cep: formData.cep || '',
        rua: formData.rua || '',
        numero: formData.numero || '',
        bairro: formData.bairro || '',
        telefone: formData.telefone || '',
        email: formData.email || '',
        observacoes: formData.observacoes || ''
      };

      if (isEditing && clientId) {
        await clientsAPI.update(clientId, clientData);
        alert('Cliente atualizado com sucesso!');
      } else {
        await clientsAPI.create(clientData);
        alert('Cliente criado com sucesso!');
      }
      onSuccess();
    } catch (error: any) {
      console.error('Erro ao salvar cliente:', error);
      setErrors({ 
        submit: error.response?.data?.message || 'Erro ao salvar cliente' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof CreateClientDto, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro do campo quando usuário começar a digitar
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatCNPJ = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 14) {
      return numericValue
        .replace(/^(\d{2})(\d)/, '$1.$2')
        .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
        .replace(/\.(\d{3})(\d)/, '.$1/$2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    }
    return value;
  };

  const formatCEP = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 8) {
      return numericValue.replace(/^(\d{5})(\d)/, '$1-$2');
    }
    return value;
  };

  const formatPhone = (value: string) => {
    const numericValue = value.replace(/\D/g, '');
    if (numericValue.length <= 11) {
      return numericValue
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4,5})(\d{4})$/, '$1-$2');
    }
    return value;
  };

  const tabs = [
    { id: 'dados-cadastrais', label: 'Dados Cadastrais', enabled: true },
    { id: 'informacoes-internas', label: 'Informações Internas', enabled: false },
    { id: 'usuarios', label: 'Usuários', enabled: false }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent mx-auto mb-4" style={{ borderColor: '#1bb17a', borderTopColor: 'transparent' }}></div>
          <span className="text-gray-600">Carregando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Mobile Friendly */}
      <header style={{ background: 'linear-gradient(to right, #1bb17a, #059669)' }} className="shadow-md sticky top-0 z-50">
        <div className="px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 sm:h-16">
            {/* Logo e Título */}
            <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
              <img 
                src={logo} 
                className="h-20 sm:h-28 w-auto flex-shrink-0"
                alt="Logo"
              />
              <div className="min-w-0">
                <span className="text-white font-medium text-sm sm:text-base block truncate">
                  {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
                </span>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <button
                onClick={onBack}
                className="text-white hover:text-green-100 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                </svg>
                <span>Voltar para Clientes</span>
              </button>
              
              <div className="flex items-center space-x-4">
                <button className="text-white hover:text-green-100 p-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                </button>
                
                <button className="text-white hover:text-green-100 p-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"/>
                  </svg>
                </button>

                <button 
                  onClick={onLogout}
                  className="flex items-center space-x-2 text-white hover:text-green-100 p-2"
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
              className="md:hidden text-white p-2"
              aria-label="Menu"
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
                    onBack();
                    setShowMobileMenu(false);
                  }}
                  className="text-white text-left px-2 py-2 hover:bg-green-600 rounded flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/>
                  </svg>
                  <span>Voltar para Clientes</span>
                </button>
                <button className="text-white text-left px-2 py-2 hover:bg-green-600 rounded">
                  Notificações
                </button>
                <button 
                  onClick={() => {
                    onLogout();
                    setShowMobileMenu(false);
                  }}
                  className="text-white text-left px-2 py-2 hover:bg-green-600 rounded"
                >
                  Sair
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="px-4 sm:px-6 py-4 sm:py-6 pb-20">
        {/* Page Title - Mobile */}
        <div className="mb-4 sm:mb-6 md:hidden">
          <h2 className="text-xl font-bold text-gray-900 border-b-2 border-gray-900 inline-block pb-1">
            {isEditing ? 'Editar Cliente' : 'Novo Cliente'}
          </h2>
        </div>

        {/* Error Message */}
        {errors.submit && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {errors.submit}
          </div>
        )}

        {/* TabBar - Mobile Friendly */}
        <div className="bg-white rounded-lg border border-gray-200 mb-4 sm:mb-6">
          <div className="border-b border-gray-200">
            {/* Desktop Tabs */}
            <nav className="hidden sm:flex space-x-8 px-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => tab.enabled && setActiveTab(tab.id)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-green-500 text-green-600'
                      : tab.enabled
                      ? 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      : 'border-transparent text-gray-300 cursor-not-allowed'
                  }`}
                  disabled={!tab.enabled}
                >
                  {tab.label}
                  {!tab.enabled && (
                    <span className="ml-2 text-xs text-gray-400">(Em breve)</span>
                  )}
                </button>
              ))}
            </nav>

            {/* Mobile Tabs - Dropdown Style */}
            <div className="sm:hidden p-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Seção Ativa
              </label>
              <select
                value={activeTab}
                onChange={(e) => {
                  const tab = tabs.find(t => t.id === e.target.value);
                  if (tab?.enabled) {
                    setActiveTab(e.target.value);
                  }
                }}
                className="w-full px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {tabs.map((tab) => (
                  <option key={tab.id} value={tab.id} disabled={!tab.enabled}>
                    {tab.label} {!tab.enabled && '(Em breve)'}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Tab Content */}
          <form onSubmit={handleSubmit} className="p-4 sm:p-6">
            {activeTab === 'dados-cadastrais' && (
              <div className="space-y-6 sm:space-y-8">
                {/* Informações Cadastrais */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                    Informações Cadastrais
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {/* Nome na Fachada */}
                    <div className="sm:col-span-2 lg:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome na Fachada *
                      </label>
                      <input
                        type="text"
                        value={formData.nomeNaFachada || ''}
                        onChange={(e) => handleInputChange('nomeNaFachada', e.target.value)}
                        className={`w-full px-3 py-2 text-base border rounded-md transition-colors ${
                          errors.nomeNaFachada ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                        } focus:outline-none focus:ring-2 focus:border-transparent`}
                        placeholder="Digite o nome na fachada"
                      />
                      {errors.nomeNaFachada && (
                        <p className="mt-1 text-sm text-red-600">{errors.nomeNaFachada}</p>
                      )}
                    </div>

                    {/* CNPJ */}
                    <div className="sm:col-span-2 lg:col-span-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CNPJ *
                      </label>
                      <input
                        type="text"
                        value={formData.cnpj || ''}
                        onChange={(e) => handleInputChange('cnpj', formatCNPJ(e.target.value))}
                        className={`w-full px-3 py-2 text-base border rounded-md transition-colors ${
                          errors.cnpj ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                        } focus:outline-none focus:ring-2 focus:border-transparent`}
                        placeholder="XX.XXX.XXX/XXXX-XX"
                        maxLength={18}
                      />
                      {errors.cnpj && (
                        <p className="mt-1 text-sm text-red-600">{errors.cnpj}</p>
                      )}
                    </div>

                    {/* Razão Social */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Razão Social *
                      </label>
                      <input
                        type="text"
                        value={formData.razaoSocial || ''}
                        onChange={(e) => handleInputChange('razaoSocial', e.target.value)}
                        className={`w-full px-3 py-2 text-base border rounded-md transition-colors ${
                          errors.razaoSocial ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                        } focus:outline-none focus:ring-2 focus:border-transparent`}
                        placeholder="Digite a razão social"
                      />
                      {errors.razaoSocial && (
                        <p className="mt-1 text-sm text-red-600">{errors.razaoSocial}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={`w-full px-3 py-2 text-base border rounded-md transition-colors ${
                          errors.email ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                        } focus:outline-none focus:ring-2 focus:border-transparent`}
                        placeholder="cliente@exemplo.com"
                      />
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                      )}
                    </div>

                    {/* Telefone */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefone
                      </label>
                      <input
                        type="text"
                        value={formData.telefone || ''}
                        onChange={(e) => handleInputChange('telefone', formatPhone(e.target.value))}
                        className="w-full px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="(XX) XXXXX-XXXX"
                        maxLength={15}
                      />
                    </div>

                    {/* Status */}
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status *
                      </label>
                      <select
                        value={formData.status || 'ativo'}
                        onChange={(e) => handleInputChange('status', e.target.value as 'ativo' | 'inativo')}
                        className="w-full px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="ativo">Ativo</option>
                        <option value="inativo">Inativo</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Endereço */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                    Endereço
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {/* CEP */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        CEP
                      </label>
                      <input
                        type="text"
                        value={formData.cep || ''}
                        onChange={(e) => handleInputChange('cep', formatCEP(e.target.value))}
                        className={`w-full px-3 py-2 text-base border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                          errors.cep ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                        }`}
                        placeholder="XXXXX-XXX"
                        maxLength={9}
                      />
                      {errors.cep && (
                        <p className="mt-1 text-sm text-red-600">{errors.cep}</p>
                      )}
                    </div>

                    {/* Rua */}
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rua
                      </label>
                      <input
                        type="text"
                        value={formData.rua || ''}
                        onChange={(e) => handleInputChange('rua', e.target.value)}
                        className="w-full px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Digite o nome da rua"
                      />
                    </div>

                    {/* Número */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número
                      </label>
                      <input
                        type="text"
                        value={formData.numero || ''}
                        onChange={(e) => handleInputChange('numero', e.target.value)}
                        className="w-full px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Número"
                      />
                    </div>

                    {/* Bairro */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Bairro
                      </label>
                      <input
                        type="text"
                        value={formData.bairro || ''}
                        onChange={(e) => handleInputChange('bairro', e.target.value)}
                        className="w-full px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="Digite o bairro"
                      />
                    </div>

                    {/* Cidade */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cidade *
                      </label>
                      <input
                        type="text"
                        value={formData.cidade || ''}
                        onChange={(e) => handleInputChange('cidade', e.target.value)}
                        className={`w-full px-3 py-2 text-base border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                          errors.cidade ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                        }`}
                        placeholder="Digite a cidade"
                      />
                      {errors.cidade && (
                        <p className="mt-1 text-sm text-red-600">{errors.cidade}</p>
                      )}
                    </div>

                    {/* Estado */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado *
                      </label>
                      <input
                        type="text"
                        value={formData.estado || ''}
                        onChange={(e) => handleInputChange('estado', e.target.value.toUpperCase())}
                        className={`w-full px-3 py-2 text-base border rounded-md focus:outline-none focus:ring-2 focus:border-transparent ${
                          errors.estado ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-green-500'
                        }`}
                        placeholder="Ex: SP"
                        maxLength={2}
                      />
                      {errors.estado && (
                        <p className="mt-1 text-sm text-red-600">{errors.estado}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Observações */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                    Observações
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Observações Gerais
                    </label>
                    <textarea
                      value={formData.observacoes || ''}
                      onChange={(e) => handleInputChange('observacoes', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 text-base border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                      placeholder="Observações adicionais sobre o cliente"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Outras abas (placeholders) */}
            {activeTab === 'informacoes-internas' && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🔧</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Em desenvolvimento
                </h3>
                <p className="text-gray-500 text-sm sm:text-base">
                  A aba "Informações Internas" será implementada em breve.
                </p>
              </div>
            )}

            {activeTab === 'usuarios' && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Em desenvolvimento
                </h3>
                <p className="text-gray-500 text-sm sm:text-base">
                  A aba "Usuários" será implementada em breve.
                </p>
              </div>
            )}

            {/* Footer - Mobile Friendly */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 mt-6 sm:mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onBack}
                className="w-full sm:w-auto px-6 py-3 sm:py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium transition-colors"
                disabled={saving}
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving || activeTab !== 'dados-cadastrais'}
                className="w-full sm:w-auto px-6 py-3 sm:py-2 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                style={{ 
                  backgroundColor: saving || activeTab !== 'dados-cadastrais' ? '#9ca3af' : '#1bb17a'
                }}
                onMouseOver={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = '#059669';
                  }
                }}
                onMouseOut={(e) => {
                  if (!e.currentTarget.disabled) {
                    e.currentTarget.style.backgroundColor = '#1bb17a';
                  }
                }}
              >
                {saving ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-white"></div>
                    <span>Salvando...</span>
                  </div>
                ) : (
                  isEditing ? 'Atualizar Cliente' : 'Criar Cliente'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Fixed Bottom Action Bar - Mobile Only */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 sm:hidden z-40">
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 font-medium transition-colors"
              disabled={saving}
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={saving || activeTab !== 'dados-cadastrais'}
              className="flex-1 px-4 py-3 text-white rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ 
                backgroundColor: saving || activeTab !== 'dados-cadastrais' ? '#9ca3af' : '#1bb17a'
              }}
            >
              {saving ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent border-white"></div>
                  <span className="text-sm">Salvando...</span>
                </div>
              ) : (
                <span className="text-sm">
                  {isEditing ? 'Atualizar' : 'Criar'}
                </span>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClientForm;