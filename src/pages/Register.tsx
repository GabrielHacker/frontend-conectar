import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft } from 'lucide-react';
import logo from '../assets/logo.png'; // Ajuste o caminho conforme sua estrutura

interface RegisterProps {
  onRegister: (userData: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  onBackToLogin: () => void;
  error?: string | null;
}

const Register: React.FC<RegisterProps> = ({ onRegister, onBackToLogin, error }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});

  const validateForm = () => {
    const errors: {[key: string]: string} = {};

    // Validar nome
    if (!formData.name.trim()) {
      errors.name = 'Nome é obrigatório';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Nome deve ter pelo menos 2 caracteres';
    }

    // Validar email
    if (!formData.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido';
    }

    // Validar senha
    if (!formData.password) {
      errors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres';
    }

    // Validar confirmação de senha
    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Senhas não coincidem';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (isLoading) return;

    setLocalError('');
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      await onRegister({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
      });
    } catch (error: any) {
      setLocalError(error.message || 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Limpar erro de validação do campo quando usuário começar a digitar
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
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
              height: '140px', 
              width: 'auto',
              margin: '0 auto',
              display: 'block',
              maxWidth: '100%'
            }}
          />
        </div>

        {/* Register Card */}
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
          {/* Header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '24px',
          }}>
            <button
              onClick={onBackToLogin}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                color: '#6b7280',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = '#f3f4f6';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <ArrowLeft style={{ width: '20px', height: '20px' }} />
            </button>
            <h2 style={{
              margin: '0',
              marginLeft: '12px',
              fontSize: '24px',
              fontWeight: '700',
              color: '#1f2937',
            }}>
              Criar nova conta
            </h2>
          </div>

          {/* Error Message */}
          {displayError && (
            <div style={{
              marginBottom: '16px',
              padding: '12px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fca5a5',
              color: '#b91c1c',
              borderRadius: '4px',
              fontSize: '14px',
            }}>
              {displayError}
            </div>
          )}

          {/* Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Name Field */}
            <div>
              <label 
                htmlFor="name" 
                style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  color: '#374151',
                  fontWeight: '500',
                  marginBottom: '6px',
                  userSelect: 'none'
                }}
              >
                Nome completo *
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${validationErrors.name ? '#ef4444' : '#e5e7eb'}`,
                  borderRadius: '6px',
                  backgroundColor: '#f9fafb',
                  outline: 'none',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="Digite seu nome completo"
                disabled={isLoading}
              />
              {validationErrors.name && (
                <div style={{
                  color: '#ef4444',
                  fontSize: '12px',
                  marginTop: '4px',
                }}>
                  {validationErrors.name}
                </div>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label 
                htmlFor="email" 
                style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  color: '#374151',
                  fontWeight: '500',
                  marginBottom: '6px',
                  userSelect: 'none'
                }}
              >
                Email *
              </label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: `1px solid ${validationErrors.email ? '#ef4444' : '#e5e7eb'}`,
                  borderRadius: '6px',
                  backgroundColor: '#f9fafb',
                  outline: 'none',
                  fontSize: '14px',
                  boxSizing: 'border-box'
                }}
                placeholder="Digite seu email"
                disabled={isLoading}
              />
              {validationErrors.email && (
                <div style={{
                  color: '#ef4444',
                  fontSize: '12px',
                  marginTop: '4px',
                }}>
                  {validationErrors.email}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label 
                htmlFor="password" 
                style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  color: '#374151',
                  fontWeight: '500',
                  marginBottom: '6px',
                  userSelect: 'none'
                }}
              >
                Senha *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 48px 12px 12px',
                    border: `1px solid ${validationErrors.password ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '6px',
                    backgroundColor: '#f9fafb',
                    outline: 'none',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Mínimo 6 caracteres"
                  disabled={isLoading}
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
              {validationErrors.password && (
                <div style={{
                  color: '#ef4444',
                  fontSize: '12px',
                  marginTop: '4px',
                }}>
                  {validationErrors.password}
                </div>
              )}
            </div>

            {/* Confirm Password Field */}
            <div>
              <label 
                htmlFor="confirmPassword" 
                style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  color: '#374151',
                  fontWeight: '500',
                  marginBottom: '6px',
                  userSelect: 'none'
                }}
              >
                Confirmar senha *
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 48px 12px 12px',
                    border: `1px solid ${validationErrors.confirmPassword ? '#ef4444' : '#e5e7eb'}`,
                    borderRadius: '6px',
                    backgroundColor: '#f9fafb',
                    outline: 'none',
                    fontSize: '14px',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Digite a senha novamente"
                  disabled={isLoading}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSubmit();
                    }
                  }}
                />
                <div
                  onClick={(e) => {
                    e.preventDefault();
                    setShowConfirmPassword(!showConfirmPassword);
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
                  {showConfirmPassword ? (
                    <EyeOff style={{ width: '18px', height: '18px', color: '#065f46' }} />
                  ) : (
                    <Eye style={{ width: '18px', height: '18px', color: '#065f46' }} />
                  )}
                </div>
              </div>
              {validationErrors.confirmPassword && (
                <div style={{
                  color: '#ef4444',
                  fontSize: '12px',
                  marginTop: '4px',
                }}>
                  {validationErrors.confirmPassword}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div
              onClick={handleSubmit}
              style={{
                width: '100%',
                backgroundColor: '#1bb17a',
                color: 'white',
                fontWeight: '500',
                padding: '14px 16px',
                borderRadius: '6px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                textAlign: 'center',
                marginTop: '8px',
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
              {isLoading ? 'Criando conta...' : 'Criar conta'}
            </div>
          </div>

          {/* Terms */}
          <div style={{
            marginTop: '20px',
            padding: '12px',
            backgroundColor: '#f8fafc',
            borderRadius: '6px',
            fontSize: '12px',
            color: '#64748b',
            textAlign: 'center',
            lineHeight: '1.5',
          }}>
            Ao criar uma conta, você concorda com nossos{' '}
            <span style={{ color: '#10b981', fontWeight: '500' }}>
              Termos de Uso
            </span>{' '}
            e{' '}
            <span style={{ color: '#10b981', fontWeight: '500' }}>
              Política de Privacidade
            </span>
          </div>

          {/* Back to Login */}
          <div style={{
            marginTop: '20px',
            textAlign: 'center',
            fontSize: '14px',
            color: '#6b7280',
          }}>
            Já tem uma conta?{' '}
            <span
              onClick={onBackToLogin}
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
              Fazer login
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;