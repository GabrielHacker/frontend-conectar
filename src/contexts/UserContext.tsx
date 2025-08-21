import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { User, Client } from '../services/api';

// Tipos do estado
interface UserState {
  // Dados do usuário
  currentUser: User | null;
  
  // Clientes
  clients: Client[];
  selectedClient: Client | null;
  clientsLoading: boolean;
  clientsError: string | null;
  
  // Filtros e busca
  filters: {
    nomeNaFachada: string;
    cnpj: string;
    status: string;
    conectarPlus: string;
  };
  
  // UI States
  showFilters: boolean;
  
  // Estados gerais
  loading: boolean;
  error: string | null;
}

// Ações disponíveis
type UserAction =
  // Usuário
  | { type: 'SET_USER'; payload: User }
  | { type: 'UPDATE_USER'; payload: Partial<User> }
  | { type: 'CLEAR_USER' }
  
  // Clientes
  | { type: 'SET_CLIENTS_LOADING'; payload: boolean }
  | { type: 'SET_CLIENTS'; payload: Client[] }
  | { type: 'ADD_CLIENT'; payload: Client }
  | { type: 'UPDATE_CLIENT'; payload: Client }
  | { type: 'REMOVE_CLIENT'; payload: string }
  | { type: 'SET_SELECTED_CLIENT'; payload: Client | null }
  | { type: 'SET_CLIENTS_ERROR'; payload: string | null }
  
  // Filtros
  | { type: 'SET_FILTERS'; payload: Partial<UserState['filters']> }
  | { type: 'CLEAR_FILTERS' }
  | { type: 'TOGGLE_FILTERS_VISIBILITY' }
  
  // Estados gerais
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'CLEAR_ERROR' };

// Estado inicial
const initialState: UserState = {
  currentUser: null,
  clients: [],
  selectedClient: null,
  clientsLoading: false,
  clientsError: null,
  filters: {
    nomeNaFachada: '',
    cnpj: '',
    status: '',
    conectarPlus: '',
  },
  showFilters: true,
  loading: false,
  error: null,
};

// Reducer
const userReducer = (state: UserState, action: UserAction): UserState => {
  switch (action.type) {
    // Usuário
    case 'SET_USER':
      return {
        ...state,
        currentUser: action.payload,
        error: null,
      };
    
    case 'UPDATE_USER':
      return {
        ...state,
        currentUser: state.currentUser ? { ...state.currentUser, ...action.payload } : null,
      };
    
    case 'CLEAR_USER':
      return {
        ...initialState,
      };
    
    // Clientes
    case 'SET_CLIENTS_LOADING':
      return {
        ...state,
        clientsLoading: action.payload,
      };
    
    case 'SET_CLIENTS':
      return {
        ...state,
        clients: action.payload,
        clientsLoading: false,
        clientsError: null,
      };
    
    case 'ADD_CLIENT':
      return {
        ...state,
        clients: [...state.clients, action.payload],
        clientsError: null,
      };
    
    case 'UPDATE_CLIENT':
      return {
        ...state,
        clients: state.clients.map(client => 
          client.id === action.payload.id ? action.payload : client
        ),
        selectedClient: state.selectedClient?.id === action.payload.id 
          ? action.payload 
          : state.selectedClient,
        clientsError: null,
      };
    
    case 'REMOVE_CLIENT':
      return {
        ...state,
        clients: state.clients.filter(client => client.id !== action.payload),
        selectedClient: state.selectedClient?.id === action.payload ? null : state.selectedClient,
        clientsError: null,
      };
    
    case 'SET_SELECTED_CLIENT':
      return {
        ...state,
        selectedClient: action.payload,
      };
    
    case 'SET_CLIENTS_ERROR':
      return {
        ...state,
        clientsError: action.payload,
        clientsLoading: false,
      };
    
    // Filtros
    case 'SET_FILTERS':
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };
    
    case 'CLEAR_FILTERS':
      return {
        ...state,
        filters: initialState.filters,
      };
    
    case 'TOGGLE_FILTERS_VISIBILITY':
      return {
        ...state,
        showFilters: !state.showFilters,
      };
    
    // Estados gerais
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload,
      };
    
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false,
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
        clientsError: null,
      };
    
    default:
      return state;
  }
};

// Contexto
interface UserContextType {
  state: UserState;
  dispatch: React.Dispatch<UserAction>;
  
  // Actions helpers
  setUser: (user: User) => void;
  updateUser: (userData: Partial<User>) => void;
  clearUser: () => void;
  
  setClientsLoading: (loading: boolean) => void;
  setClients: (clients: Client[]) => void;
  addClient: (client: Client) => void;
  updateClient: (client: Client) => void;
  removeClient: (clientId: string) => void;
  setSelectedClient: (client: Client | null) => void;
  setClientsError: (error: string | null) => void;
  
  setFilters: (filters: Partial<UserState['filters']>) => void;
  clearFilters: () => void;
  toggleFiltersVisibility: () => void;
  
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// Provider
interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(userReducer, initialState);
  
  // Action helpers
  const setUser = (user: User) => dispatch({ type: 'SET_USER', payload: user });
  const updateUser = (userData: Partial<User>) => dispatch({ type: 'UPDATE_USER', payload: userData });
  const clearUser = () => dispatch({ type: 'CLEAR_USER' });
  
  const setClientsLoading = (loading: boolean) => dispatch({ type: 'SET_CLIENTS_LOADING', payload: loading });
  const setClients = (clients: Client[]) => dispatch({ type: 'SET_CLIENTS', payload: clients });
  const addClient = (client: Client) => dispatch({ type: 'ADD_CLIENT', payload: client });
  const updateClient = (client: Client) => dispatch({ type: 'UPDATE_CLIENT', payload: client });
  const removeClient = (clientId: string) => dispatch({ type: 'REMOVE_CLIENT', payload: clientId });
  const setSelectedClient = (client: Client | null) => dispatch({ type: 'SET_SELECTED_CLIENT', payload: client });
  const setClientsError = (error: string | null) => dispatch({ type: 'SET_CLIENTS_ERROR', payload: error });
  
  const setFilters = (filters: Partial<UserState['filters']>) => dispatch({ type: 'SET_FILTERS', payload: filters });
  const clearFilters = () => dispatch({ type: 'CLEAR_FILTERS' });
  const toggleFiltersVisibility = () => dispatch({ type: 'TOGGLE_FILTERS_VISIBILITY' });
  
  const setLoading = (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading });
  const setError = (error: string | null) => dispatch({ type: 'SET_ERROR', payload: error });
  const clearError = () => dispatch({ type: 'CLEAR_ERROR' });
  
  const value: UserContextType = {
    state,
    dispatch,
    
    setUser,
    updateUser,
    clearUser,
    
    setClientsLoading,
    setClients,
    addClient,
    updateClient,
    removeClient,
    setSelectedClient,
    setClientsError,
    
    setFilters,
    clearFilters,
    toggleFiltersVisibility,
    
    setLoading,
    setError,
    clearError,
  };
  
  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

// Hook personalizado
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};