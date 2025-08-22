import React, { useState, useEffect } from 'react';
import { User, usersAPI, NotificationData } from '../services/api';

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState<NotificationData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadNotifications = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await usersAPI.getNotifications();
      setNotifications(data);
    } catch (error: any) {
      setError('Erro ao carregar notificações');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getDaysInactive = (user: User) => {
    const lastActivity = user.lastLogin || user.createdAt;
    const now = new Date();
    const lastDate = new Date(lastActivity);
    const diffTime = now.getTime() - lastDate.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getInactivityLevel = (days: number) => {
    if (days >= 60) return { color: 'bg-red-50 border-red-200', text: 'text-red-700', badge: 'bg-red-500' };
    if (days >= 45) return { color: 'bg-orange-50 border-orange-200', text: 'text-orange-700', badge: 'bg-orange-500' };
    if (days >= 30) return { color: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700', badge: 'bg-yellow-500' };
    return { color: 'bg-gray-50 border-gray-200', text: 'text-gray-700', badge: 'bg-gray-500' };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-500 to-green-600">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white flex items-center space-x-2">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-5 5-5-5h5V12H9l4-4 4 4h-2v5zM5 6a2 2 0 012-2h6a2 2 0 012 2v2a2 2 0 01-2 2H7a2 2 0 01-2-2V6z"/>
              </svg>
              <span>Central de Notificações</span>
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-green-100 transition-colors p-2 rounded-lg hover:bg-green-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-500 border-t-transparent"></div>
              <span className="ml-3 text-gray-600">Carregando notificações...</span>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
                {error}
              </div>
              <button
                onClick={loadNotifications}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
              >
                Tentar novamente
              </button>
            </div>
          ) : notifications ? (
            <div className="space-y-6">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-blue-900">{notifications.totalUsers}</div>
                      <div className="text-sm text-blue-700">Total de Usuários</div>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-orange-900">{notifications.inactiveUsers.count}</div>
                      <div className="text-sm text-orange-700">Usuários Inativos</div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/>
                      </svg>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-900">
                        {Math.round((notifications.inactiveUsers.count / notifications.totalUsers) * 100)}%
                      </div>
                      <div className="text-sm text-purple-700">Taxa de Inatividade</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Inactive Users Section */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                    <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                    </svg>
                    <span>Usuários Inativos (+ de 30 dias)</span>
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Usuários que não fazem login há mais de 30 dias. Considere entrar em contato.
                  </p>
                </div>

                <div className="p-4">
                  {notifications.inactiveUsers.count === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                        </svg>
                      </div>
                      <h4 className="text-lg font-medium text-gray-900 mb-2">Nenhum usuário inativo!</h4>
                      <p className="text-gray-500">Todos os usuários estão ativos no sistema.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {notifications.inactiveUsers.users.map((user) => {
                        const daysInactive = getDaysInactive(user);
                        const levelStyle = getInactivityLevel(daysInactive);
                        
                        return (
                          <div key={user.id} className={`border rounded-lg p-4 ${levelStyle.color}`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold">
                                  {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <h4 className={`font-medium ${levelStyle.text}`}>{user.name}</h4>
                                    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${
                                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                    }`}>
                                      {user.role === 'admin' ? '👑 Admin' : '👤 Usuário'}
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-600">{user.email}</p>
                                  <p className="text-xs text-gray-500">
                                    Último acesso: {user.lastLogin ? formatDate(user.lastLogin) : 'Nunca logou'}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="text-right">
                                <div className="flex items-center space-x-2">
                                  <div className={`w-3 h-3 rounded-full ${levelStyle.badge}`}></div>
                                  <div>
                                    <div className={`text-2xl font-bold ${levelStyle.text}`}>{daysInactive}</div>
                                    <div className="text-xs text-gray-500">dias</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="text-sm text-gray-500">
                  Última atualização: {formatDate(notifications.lastUpdate)}
                </span>
                <button
                  onClick={loadNotifications}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  disabled={loading}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  <span>Atualizar</span>
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;