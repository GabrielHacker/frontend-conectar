import React, { useState, useEffect } from 'react';
import { User, usersAPI, NotificationData } from '../services/api';
import styles from './NotificationPanel.module.css';

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
    if (days >= 60) return 'critical';
    if (days >= 45) return 'high';
    if (days >= 30) return 'medium';
    return 'low';
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.panel}>
        <div className={styles.header}>
          <h2>📢 Central de Notificações</h2>
          <button onClick={onClose} className={styles.closeBtn}>
            ✕
          </button>
        </div>

        <div className={styles.content}>
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              Carregando notificações...
            </div>
          ) : error ? (
            <div className={styles.error}>
              {error}
              <button onClick={loadNotifications} className={styles.retryBtn}>
                Tentar novamente
              </button>
            </div>
          ) : notifications ? (
            <>
              {/* Resumo */}
              <div className={styles.summary}>
                <div className={styles.summaryCard}>
                  <div className={styles.summaryIcon}>👥</div>
                  <div className={styles.summaryInfo}>
                    <span className={styles.summaryNumber}>{notifications.totalUsers}</span>
                    <span className={styles.summaryLabel}>Total de Usuários</span>
                  </div>
                </div>
                
                <div className={styles.summaryCard}>
                  <div className={styles.summaryIcon}>⚠️</div>
                  <div className={styles.summaryInfo}>
                    <span className={styles.summaryNumber}>{notifications.inactiveUsers.count}</span>
                    <span className={styles.summaryLabel}>Usuários Inativos</span>
                  </div>
                </div>
                
                <div className={styles.summaryCard}>
                  <div className={styles.summaryIcon}>📊</div>
                  <div className={styles.summaryInfo}>
                    <span className={styles.summaryNumber}>
                      {Math.round((notifications.inactiveUsers.count / notifications.totalUsers) * 100)}%
                    </span>
                    <span className={styles.summaryLabel}>Taxa de Inatividade</span>
                  </div>
                </div>
              </div>

              {/* Lista de usuários inativos */}
              <div className={styles.section}>
                <h3>⚠️ Usuários Inativos (+ de 30 dias)</h3>
                <p className={styles.sectionDesc}>
                  Usuários que não fazem login há mais de 30 dias. Considere entrar em contato.
                </p>

                {notifications.inactiveUsers.count === 0 ? (
                  <div className={styles.noData}>
                    <div className={styles.noDataIcon}>🎉</div>
                    <h4>Nenhum usuário inativo!</h4>
                    <p>Todos os usuários estão ativos no sistema.</p>
                  </div>
                ) : (
                  <div className={styles.usersList}>
                    {notifications.inactiveUsers.users.map((user) => {
                      const daysInactive = getDaysInactive(user);
                      const level = getInactivityLevel(daysInactive);
                      
                      return (
                        <div key={user.id} className={`${styles.userCard} ${styles[level]}`}>
                          <div className={styles.userInfo}>
                            <div className={styles.userName}>
                              <strong>{user.name}</strong>
                              <span className={styles.userEmail}>{user.email}</span>
                            </div>
                            <div className={styles.userMeta}>
                              <span className={styles.userRole}>
                                {user.role === 'admin' ? '👑 Admin' : '👤 Usuário'}
                              </span>
                            </div>
                          </div>
                          
                          <div className={styles.inactivityInfo}>
                            <div className={styles.inactivityDays}>
                              <span className={styles.daysNumber}>{daysInactive}</span>
                              <span className={styles.daysLabel}>dias</span>
                            </div>
                            <div className={styles.lastActivity}>
                              <small>
                                Último acesso: {user.lastLogin ? formatDate(user.lastLogin) : 'Nunca'}
                              </small>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Última atualização */}
              <div className={styles.footer}>
                <span className={styles.lastUpdate}>
                  Última atualização: {formatDate(notifications.lastUpdate)}
                </span>
                <button onClick={loadNotifications} className={styles.refreshBtn}>
                  🔄 Atualizar
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;