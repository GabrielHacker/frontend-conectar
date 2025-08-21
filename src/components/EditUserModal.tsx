import React, { useState, useEffect } from 'react';
import { User } from '../services/api';
import { useAdmin } from '../contexts/AdminContext';
import styles from './EditUserModal.module.css';

interface EditUserModalProps {
  user: User | null;
  currentUser: User;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  user,
  currentUser,
  isOpen,
  onClose,
  onSuccess,
}) => {
  // ✅ Usar o contexto AdminContext
  const { updateUser } = useAdmin();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'user' as 'admin' | 'user',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
      });
    }
    // Limpar erro quando abrir o modal
    setError('');
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    setError('');

    try {
      // ✅ Usar o método do contexto que já trata os tipos corretamente
      await updateUser(user.id, formData);
      onSuccess();
      onClose();
    } catch (error: any) {
      setError(error.message || 'Erro ao atualizar usuário');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    // Reset form quando fechar
    setError('');
    setFormData({
      name: '',
      email: '',
      role: 'user',
    });
    onClose();
  };

  const isAdmin = currentUser.role === 'admin';
  const isEditingSelf = user?.id === currentUser.id;

  if (!isOpen || !user) return null;

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2>Editar Usuário</h2>
          <button 
            onClick={handleClose} 
            className={styles.closeBtn}
            type="button"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.field}>
            <label htmlFor="name">Nome:</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              disabled={isLoading}
            />
          </div>

          {/* Apenas admins podem alterar role, exceto quando editando a si mesmo */}
          {isAdmin && !isEditingSelf && (
            <div className={styles.field}>
              <label htmlFor="role">Função:</label>
              <select
                id="role"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value as 'admin' | 'user' })}
                disabled={isLoading}
              >
                <option value="user">Usuário</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          )}

          {/* Mostrar função atual quando não pode editar */}
          {(!isAdmin || isEditingSelf) && (
            <div className={styles.field}>
              <label>Função:</label>
              <div className={styles.readOnly}>
                {user.role === 'admin' ? 'Administrador' : 'Usuário'}
                {isEditingSelf && (
                  <small className={styles.helpText}>
                    Você não pode alterar sua própria função
                  </small>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <div className={styles.actions}>
            <button 
              type="button" 
              onClick={handleClose} 
              className={styles.cancelBtn}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              disabled={isLoading} 
              className={styles.saveBtn}
            >
              {isLoading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;