import React, { useState, useEffect } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import logo from '../assets/logo.png'; // Ajuste o caminho conforme sua estrutura

interface LoginProps {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegisterClick: () => void; // Nova prop para navegar para cadastro
  error?: string | null;
}

const Login: React.FC<LoginProps> = ({ onLogin, onRegisterClick, error }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');

  // Initialize Google OAuth
  useEffect(() => {
    const initializeGoogleAuth = () => {
      if (window.google) {
        window.google.accounts.id.initialize({
          client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID || 'your-google-client-id',
          callback: handleGoogleResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
      }
    };

    // Load Google script if not already loaded
    if (!window.google) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.onload = initializeGoogleAuth;
      document.head.appendChild(script);
    } else {
      initializeGoogleAuth();
    }
  }, []);

  // Clear local error when global error changes
  useEffect(() => {
    if (!error) {
      setLocalError('');
    }
  }, [error]);

  const handleGoogleResponse = async (response: any) => {
    try {
      setIsLoading(true);
      setLocalError('');

      // Send token to the correct backend route
      const result = await fetch('https://conectarback.discloud.app/auth/google/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          credential: response.credential,
        }),
      });

      if (!result.ok) {
        const errorData = await result.json();
        throw new Error(errorData.message || 'Erro na resposta do servidor');
      }

      const data = await result.json();

      if (data.access_token) {
        // Save token and user data
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Trigger login in parent component
        window.location.reload(); // Simple way to refresh auth state
      } else {
        throw new Error('Token de acesso não recebido');
      }
    } catch (error: any) {
      console.error('Google login error:', error);
      setLocalError(error.message || 'Erro ao fazer login com Google');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (window.google) {
      window.google.accounts.id.prompt();
    } else {
      setLocalError('Google OAuth não está disponível');
    }
  };

  const handleRegularSubmit = async () => {
    if (!email || !password || isLoading) return;
    
    setIsLoading(true);
    setLocalError('');
        
    try {
      await onLogin(email, password);
    } catch (error: any) {
      setLocalError(error.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const displayError = error || localError;

  return (
    <div style={{
      backgroundColor: '#10b981', 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '20px'
    }}>
      <div style={{ 
        width: '100%', 
        maxWidth: '480px',
        minWidth: '280px' 
      }}>
        {/* Logo */}
        <div style={{ 
          textAlign: 'center', 
          userSelect: 'none'
        }}>
          <img 
            src={logo} 
            alt="Conectar Logo"
            style={{ 
              height: '180px', 
              width: 'auto',
              margin: '0 auto',
              display: 'block',
              maxWidth: '100%'
            }}
          />
        </div>

        {/* Login Card */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
          padding: '24px 32px', 
          width: '100%',
          maxWidth: '480px',
          margin: '0 auto',
          boxSizing: 'border-box'
        }}>
          {/* Error Message */}
          {displayError && (
            <div style={{
              marginBottom: '16px',
              padding: '12px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fca5a5',
              color: '#b91c1c',
              borderRadius: '4px'
            }}>
              {displayError}
            </div>
          )}

          {/* Google Login Button */}
          <div
            onClick={handleGoogleLogin}
            style={{
              width: '100%',
              backgroundColor: 'white',
              color: '#374151',
              fontWeight: '500',
              padding: '12px 16px',
              borderRadius: '6px',
              border: '1px solid #d1d5db',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              textAlign: 'center',
              marginBottom: '20px',
              transition: 'all 0.2s',
              userSelect: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              opacity: isLoading ? 0.6 : 1,
            }}
            onMouseOver={(e) => {
              if (!isLoading) {
                e.currentTarget.style.backgroundColor = '#f9fafb';
                e.currentTarget.style.borderColor = '#9ca3af';
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = 'white';
              e.currentTarget.style.borderColor = '#d1d5db';
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar com Google
          </div>

          {/* Divider */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '20px',
          }}>
            <div style={{
              flex: 1,
              height: '1px',
              backgroundColor: '#e5e7eb',
            }}></div>
            <span style={{
              padding: '0 16px',
              fontSize: '14px',
              color: '#6b7280',
              backgroundColor: 'white',
            }}>
              ou
            </span>
            <div style={{
              flex: 1,
              height: '1px',
              backgroundColor: '#e5e7eb',
            }}></div>
          </div>

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Email Field */}
            <div>
              <label 
                htmlFor="email" 
                style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  color: '#6b7280', 
                  marginBottom: '6px',
                  userSelect: 'none'
                }}
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '1px solid #e5e7eb',
                  borderRadius: '6px',
                  backgroundColor: '#f9fafb',
                  outline: 'none',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder=""
                disabled={isLoading}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleRegularSubmit();
                  }
                }}
              />
            </div>

            {/* Password Field */}
            <div>
              <label 
                htmlFor="password" 
                style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  color: '#6b7280', 
                  marginBottom: '6px',
                  userSelect: 'none'
                }}
              >
                Senha
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 48px 12px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    backgroundColor: '#f9fafb',
                    outline: 'none',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="••••••"
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleRegularSubmit();
                    }
                  }}
                />
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    setShowPassword(!showPassword);
                  }}
                  style={{
                    position: 'absolute',
                    top: '0',
                    right: '0',
                    height: '100%',
                    width: '48px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    backgroundColor: '#86efac',
                    borderTopRightRadius: '6px',
                    borderBottomRightRadius: '6px',
                    userSelect: 'none'
                  }}
                >
                  {showPassword ? (
                    <EyeOff style={{ width: '18px', height: '18px', color: '#065f46' }} />
                  ) : (
                    <Eye style={{ width: '18px', height: '18px', color: '#065f46' }} />
                  )}
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div
              onClick={handleRegularSubmit}
              style={{
                width: '100%',
                backgroundColor: '#1bb17a',
                color: 'white',
                fontWeight: '500',
                padding: '12px 16px',
                borderRadius: '6px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                textAlign: 'center',
                marginTop: '16px',
                transition: 'background-color 0.2s',
                userSelect: 'none',
                opacity: isLoading ? 0.6 : 1,
              }}
              onMouseOver={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.backgroundColor = '#059669';
                }
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = '#1bb17a';
              }}
            >
              {isLoading ? 'Entrando...' : 'Entrar'}
            </div>
          </div>

          {/* Register Link */}
          <div style={{
            marginTop: '20px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#6b7280',
          }}>
            Não tem uma conta?{' '}
            <span
              onClick={onRegisterClick}
              style={{
                color: '#10b981',
                cursor: 'pointer',
                fontWeight: '500',
                textDecoration: 'underline',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.color = '#059669';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.color = '#10b981';
              }}
            >
              Criar conta gratuita
            </span>
          </div>

        </div>
      </div>
    </div>
  );
};

// Extend Window interface for TypeScript
declare global {
  interface Window {
    google: any;
  }
}

export default Login;