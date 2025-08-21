import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { User, Client, usersAPI, clientsAPI, authAPI } from '../services/api'; // ✅ Adicionar authAPI

// Tipos para o estado
interface AdminState {
  users: User[];
  clients: Client[];
  isLoadingUsers: boolean;
  isLoadingClients: boolean;
  usersError: string | null;
  clientsError: string | null;
  lastUpdated: {
    users: Date | null;
    clients: Date | null;
  };
}

// Ações disponíveis
type AdminAction =
  // Users actions
  | { type: 'SET_USERS_LOADING'; payload: boolean }
  | { type: 'SET_USERS_SUCCESS'; payload: User[] }
  | { type: 'SET_USERS_ERROR'; payload: string }
  | { type: 'ADD_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'DELETE_USER'; payload: string | number } // ✅ Aceita ambos os tipos
  
  // Clients actions
  | { type: 'SET_CLIENTS_LOADING'; payload: boolean }
  | { type: 'SET_CLIENTS_SUCCESS'; payload: Client[] }
  | { type: 'SET_CLIENTS_ERROR'; payload: string }
  | { type: 'ADD_CLIENT'; payload: Client }
  | { type: 'UPDATE_CLIENT'; payload: Client }
  | { type: 'DELETE_CLIENT'; payload: string | number } // ✅ Aceita ambos os tipos
  
  // General actions
  | { type: 'CLEAR_ERRORS' };

// Estado inicial
const initialState: AdminState = {
  users: [],
  clients: [],
  isLoadingUsers: false,
  isLoadingClients: false,
  usersError: null,
  clientsError: null,
  lastUpdated: {
    users: null,
    clients: null,
  },
};

// Reducer
function adminReducer(state: AdminState, action: AdminAction): AdminState {
  switch (action.type) {
    // Users
    case 'SET_USERS_LOADING':
      return { ...state, isLoadingUsers: action.payload, usersError: null };
    
    case 'SET_USERS_SUCCESS':
      return {
        ...state,
        users: action.payload,
        isLoadingUsers: false,
        usersError: null,
        lastUpdated: { ...state.lastUpdated, users: new Date() },
      };
    
    case 'SET_USERS_ERROR':
      return { ...state, usersError: action.payload, isLoadingUsers: false };
    
    case 'ADD_USER':
      return {
        ...state,
        users: [action.payload, ...state.users],
        lastUpdated: { ...state.lastUpdated, users: new Date() },
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        users: state.users.map(user => 
          user.id === action.payload.id ? action.payload : user
        ),
        lastUpdated: { ...state.lastUpdated, users: new Date() },
      };
    
    case 'DELETE_USER':
      return {
        ...state,
        // ✅ Conversão para string para comparação consistente
        users: state.users.filter(user => user.id.toString() !== action.payload.toString()),
        lastUpdated: { ...state.lastUpdated, users: new Date() },
      };

    // Clients
    case 'SET_CLIENTS_LOADING':
      return { ...state, isLoadingClients: action.payload, clientsError: null };
    
    case 'SET_CLIENTS_SUCCESS':
      return {
        ...state,
        clients: action.payload,
        isLoadingClients: false,
        clientsError: null,
        lastUpdated: { ...state.lastUpdated, clients: new Date() },
      };
    
    case 'SET_CLIENTS_ERROR':
      return { ...state, clientsError: action.payload, isLoadingClients: false };
    
    case 'ADD_CLIENT':
      return {
        ...state,
        clients: [action.payload, ...state.clients],
        lastUpdated: { ...state.lastUpdated, clients: new Date() },
      };
    
    case 'UPDATE_CLIENT':
      return {
        ...state,
        clients: state.clients.map(client => 
          client.id === action.payload.id ? action.payload : client
        ),
        lastUpdated: { ...state.lastUpdated, clients: new Date() },
      };
    
    case 'DELETE_CLIENT':
      return {
        ...state,
        // ✅ Conversão para string para comparação consistente
        clients: state.clients.filter(client => client.id.toString() !== action.payload.toString()),
        lastUpdated: { ...state.lastUpdated, clients: new Date() },
      };

    // General
    case 'CLEAR_ERRORS':
      return { ...state, usersError: null, clientsError: null };
    
    default:
      return state;
  }
}

// Interface do contexto
interface AdminContextType {
  state: AdminState;
  
  // Users methods
  loadUsers: (filters?: any, forceRefresh?: boolean) => Promise<void>;
  createUser: (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { password: string }) => Promise<User>; // ✅ Inclui password
  updateUser: (userId: string | number, userData: Partial<User>) => Promise<User>; // ✅ Aceita ambos
  deleteUser: (userId: string | number) => Promise<void>; // ✅ Aceita ambos
  
  // Clients methods
  loadClients: (filters?: any, forceRefresh?: boolean) => Promise<void>;
  createClient: (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Client>;
  updateClient: (clientId: string | number, clientData: Partial<Client>) => Promise<Client>; // ✅ Aceita ambos
  deleteClient: (clientId: string | number) => Promise<void>; // ✅ Aceita ambos
  
  // Utility methods
  clearErrors: () => void;
  getFilteredUsers: (filters: any) => User[];
  getFilteredClients: (filters: any) => Client[];
}

// Criar o contexto
const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Provider props
interface AdminProviderProps {
  children: ReactNode;
}

// Provider component
export const AdminProvider: React.FC<AdminProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(adminReducer, initialState);

  // Cache duration (5 minutes)
  const CACHE_DURATION = 5 * 60 * 1000;

  // Check if data needs refresh
  const needsRefresh = (lastUpdated: Date | null): boolean => {
    if (!lastUpdated) return true;
    return Date.now() - lastUpdated.getTime() > CACHE_DURATION;
  };

  // Users methods
  const loadUsers = async (filters: any = {}, forceRefresh = false) => {
    if (!forceRefresh && !needsRefresh(state.lastUpdated.users) && state.users.length > 0) {
      return; // Use cached data
    }

    dispatch({ type: 'SET_USERS_LOADING', payload: true });
    
    try {
      const users = await usersAPI.getAll(filters);
      dispatch({ type: 'SET_USERS_SUCCESS', payload: users });
    } catch (error: any) {
      dispatch({ type: 'SET_USERS_ERROR', payload: error.message || 'Erro ao carregar usuários' });
      throw error;
    }
  };

  // ✅ Usar authAPI.register para criar usuários
  const createUser = async (userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'> & { password: string }): Promise<User> => {
    try {
      const response = await authAPI.register({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role
      });
      
      const newUser = response.user;
      dispatch({ type: 'ADD_USER', payload: newUser });
      return newUser;
    } catch (error: any) {
      dispatch({ type: 'SET_USERS_ERROR', payload: error.message || 'Erro ao criar usuário' });
      throw error;
    }
  };

  const updateUser = async (userId: string | number, userData: Partial<User>): Promise<User> => {
    try {
      // ✅ Converte para string se necessário
      const userIdString = userId.toString();
      const updatedUser = await usersAPI.update(userIdString, userData);
      dispatch({ type: 'UPDATE_USER', payload: updatedUser });
      return updatedUser;
    } catch (error: any) {
      dispatch({ type: 'SET_USERS_ERROR', payload: error.message || 'Erro ao atualizar usuário' });
      throw error;
    }
  };

  const deleteUser = async (userId: string | number): Promise<void> => {
    try {
      // ✅ Converte para string se necessário
      const userIdString = userId.toString();
      await usersAPI.delete(userIdString);
      dispatch({ type: 'DELETE_USER', payload: userId });
    } catch (error: any) {
      dispatch({ type: 'SET_USERS_ERROR', payload: error.message || 'Erro ao excluir usuário' });
      throw error;
    }
  };

  // Clients methods
  const loadClients = async (filters: any = {}, forceRefresh = false) => {
    if (!forceRefresh && !needsRefresh(state.lastUpdated.clients) && state.clients.length > 0) {
      return; // Use cached data
    }

    dispatch({ type: 'SET_CLIENTS_LOADING', payload: true });
    
    try {
      const clients = await clientsAPI.getAll(filters);
      dispatch({ type: 'SET_CLIENTS_SUCCESS', payload: clients });
    } catch (error: any) {
      dispatch({ type: 'SET_CLIENTS_ERROR', payload: error.message || 'Erro ao carregar clientes' });
      throw error;
    }
  };

  // ✅ Usar authAPI.register ao invés de clientsAPI.create
  const createClient = async (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>): Promise<Client> => {
    try {      
      const newClient = await clientsAPI.create(clientData);
      dispatch({ type: 'ADD_CLIENT', payload: newClient });
      return newClient;
    } catch (error: any) {
      dispatch({ type: 'SET_CLIENTS_ERROR', payload: error.message || 'Erro ao criar cliente' });
      throw error;
    }
  };

  const updateClient = async (clientId: string | number, clientData: Partial<Client>): Promise<Client> => {
    try {
      // ✅ Converte para string se necessário
      const clientIdString = clientId.toString();
      const updatedClient = await clientsAPI.update(clientIdString, clientData);
      dispatch({ type: 'UPDATE_CLIENT', payload: updatedClient });
      return updatedClient;
    } catch (error: any) {
      dispatch({ type: 'SET_CLIENTS_ERROR', payload: error.message || 'Erro ao atualizar cliente' });
      throw error;
    }
  };

  const deleteClient = async (clientId: string | number): Promise<void> => {
    try {
      // ✅ Converte para string se necessário
      const clientIdString = clientId.toString();
      await clientsAPI.delete(clientIdString);
      dispatch({ type: 'DELETE_CLIENT', payload: clientId });
    } catch (error: any) {
      dispatch({ type: 'SET_CLIENTS_ERROR', payload: error.message || 'Erro ao excluir cliente' });
      throw error;
    }
  };

  // Utility methods
  const clearErrors = () => {
    dispatch({ type: 'CLEAR_ERRORS' });
  };

  const getFilteredUsers = (filters: any): User[] => {
    let filtered = [...state.users];

    if (filters.name) {
      filtered = filtered.filter(user => 
        user.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    if (filters.email) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(filters.email.toLowerCase())
      );
    }

    if (filters.role) {
      filtered = filtered.filter(user => user.role === filters.role);
    }

    // ✅ Sorting com verificação de undefined
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        const aValue = a[filters.sortBy as keyof User];
        const bValue = b[filters.sortBy as keyof User];
        
        // Verifica se os valores existem
        if (aValue === undefined && bValue === undefined) return 0;
        if (aValue === undefined) return 1;
        if (bValue === undefined) return -1;
        
        if (filters.order === 'desc') {
          return bValue > aValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });
    }

    return filtered;
  };

  const getFilteredClients = (filters: any): Client[] => {
    let filtered = [...state.clients];

    if (filters.nomeNaFachada) {
      filtered = filtered.filter(client => 
        client.nomeNaFachada.toLowerCase().includes(filters.nomeNaFachada.toLowerCase())
      );
    }

    if (filters.cnpj) {
      filtered = filtered.filter(client => 
        client.cnpj.includes(filters.cnpj)
      );
    }

    if (filters.status) {
      filtered = filtered.filter(client => client.status === filters.status);
    }

    if (filters.cidade) {
      filtered = filtered.filter(client => 
        client.cidade.toLowerCase().includes(filters.cidade.toLowerCase())
      );
    }

    // ✅ Sorting com verificação de undefined
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        const aValue = a[filters.sortBy as keyof Client];
        const bValue = b[filters.sortBy as keyof Client];
        
        // Verifica se os valores existem
        if (aValue === undefined && bValue === undefined) return 0;
        if (aValue === undefined) return 1;
        if (bValue === undefined) return -1;
        
        if (filters.order === 'desc') {
          return bValue > aValue ? 1 : -1;
        }
        return aValue > bValue ? 1 : -1;
      });
    }

    return filtered;
  };

  // Load initial data when component mounts
  useEffect(() => {
    // Load with empty filters to get all data initially
    loadUsers({}, false).catch(console.error);
    loadClients({}, false).catch(console.error);
  }, []);

  const contextValue: AdminContextType = {
    state,
    loadUsers,
    createUser,
    updateUser,
    deleteUser,
    loadClients,
    createClient,
    updateClient,
    deleteClient,
    clearErrors,
    getFilteredUsers,
    getFilteredClients,
  };

  return (
    <AdminContext.Provider value={contextValue}>
      {children}
    </AdminContext.Provider>
  );
};

// Hook personalizado para usar o contexto
export const useAdmin = (): AdminContextType => {
  const context = useContext(AdminContext);
  
  if (!context) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  
  return context;
};