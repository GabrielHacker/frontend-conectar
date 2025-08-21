import React, { useState } from 'react';
import ClientsList from '../pages/usuarios/ClientsList';
import { Client } from '../services/api';
import ClientForm from './ClientForm';

interface ClientsRouterProps {
  onLogout: () => void;
}

type View = 'list' | 'create' | 'edit';

const ClientsRouter: React.FC<ClientsRouterProps> = ({ onLogout }) => {
  const [currentView, setCurrentView] = useState<View>('list');
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const handleCreateClient = () => {
    setEditingClient(null);
    setCurrentView('create');
  };

  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    setCurrentView('edit');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setEditingClient(null);
  };

  const handleSuccess = () => {
    handleBackToList();
  };

  // Renderizar com base na view atual
  switch (currentView) {
    case 'create':
      return (
        <ClientForm 
          onLogout={onLogout}
          onBack={handleBackToList}
          onSuccess={handleSuccess}
          mode="create"
        />
      );
    
    case 'edit':
      return (
        <ClientForm 
          onLogout={onLogout}
          onBack={handleBackToList}
          onSuccess={handleSuccess}
          mode="edit"
          clientId={editingClient?.id}
        />
      );
    
    case 'list':
    default:
      return (
        <ClientsList 
          onCreateClient={handleCreateClient}
          onEditClient={handleEditClient}
          onLogout={onLogout}
        />
      );
  }
};

export default ClientsRouter;