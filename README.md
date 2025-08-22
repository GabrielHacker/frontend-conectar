# Conectar - Sistema de Gestão de Clientes

Um sistema completo de gestão de clientes desenvolvido com React, TypeScript e Node.js, focado em usabilidade, performance e escalabilidade.

## 🚀 Como Usar o Sistema

### Acesso Recomendado (Produção)

**🌐 Acesse diretamente**: https://conectar.discloud.app/

Esta é a forma recomendada de usar o Conectar, pois:
- ✅ Autenticação Google funciona completamente
- ✅ Todas as funcionalidades disponíveis
- ✅ Performance otimizada
- ✅ Certificado SSL ativo
- ✅ Backups automáticos

### Execução Local (Desenvolvimento)

⚠️ **Importante**: Ao executar localmente, a autenticação por Google **não funcionará** devido às configurações de domínio do OAuth.

```bash
# Clone o repositório
git clone [url-do-repositorio]

# Instale as dependências do backend
cd backend
npm install

# Instale as dependências do frontend
cd ../frontend
npm install

# Configure as variáveis de ambiente
# Copie .env.example para .env e configure

# Execute o backend (porta 3001)
cd ../backend
npm run dev

# Execute o frontend (porta 3000)
cd ../frontend
npm start
```

**Limitações da execução local**:
- 🚫 Login com Google indisponível

### Credenciais de Teste (Ambiente de Produção)

Para testar o sistema completo em https://conectar.discloud.app/, use:

**Usuário Admin**:
- Email: joao@conectar.com
- Senha: 123456

**Usuário Comum**:
- Email: ana@conectar.com  
- Senha: 123456

## 🎨 Filosofia de Design

### Por que este Design?

O design do Conectar foi cuidadosamente pensado para resolver problemas reais de gestão empresarial, priorizando:

#### 1. **Simplicidade Funcional**
- **Interface limpa e intuitiva**: Reduz a curva de aprendizado e aumenta a produtividade
- **Navegação consistente**: Padrões visuais familiares em toda a aplicação
- **Hierarquia visual clara**: Informações importantes destacadas, secundárias organizadas

#### 2. **Design Responsivo Mobile-First**
```typescript
// Exemplo da abordagem mobile-first nos componentes
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Layout adapta-se automaticamente ao tamanho da tela */}
</div>
```

**Justificativa**: Com mais de 60% dos usuários empresariais acessando sistemas via mobile, o design responsivo não é opcional.

#### 3. **Sistema de Cores Estratégico**

```css
/* Paleta principal baseada em verde */
--primary-green: #10b981;  /* Confiança e crescimento */
--primary-dark: #059669;   /* Profissionalismo */
--accent-light: #86efac;   /* Interações amigáveis */
```

**Por que verde?**
- 🌱 **Psicologia**: Transmite crescimento, estabilidade e confiança
- 💼 **Mercado**: Diferenciação de concorrentes que usam azul
- 👁️ **UX**: Menos cansativo visualmente para uso prolongado

#### 4. **Componentes Modulares e Reutilizáveis**

```typescript
// Estrutura de componentes pensada para escalabilidade
src/
├── components/           # Componentes reutilizáveis
│   ├── ClientForm.tsx   # Formulários complexos modulares
│   ├── EditUserModal.tsx # Modais padronizados
│   └── NotificationPanel.tsx # Sistemas de feedback
├── contexts/            # Gerenciamento de estado global
└── pages/              # Páginas específicas por role
```



##### Feedback Visual Imediato
- **Estados de sucesso**: Confirmações verdes discretas
- **Estados de erro**: Mensagens claras e acionáveis
- **Estados de loading**: Indicadores específicos do contexto

#### 6. **Navegação Contextual**

```typescript
// Sistema de abas adaptável por perfil de usuário
const AdminDashboard = () => (
  <div>
    <Tab>Usuários</Tab>    {/* Apenas para admins */}
    <Tab>Clientes</Tab>    {/* Para todos */}
  </div>
);

const UserDashboard = () => (
  <div>
    <Tab>Meus Clientes</Tab>  {/* Escopo limitado */}
    <Tab>Meu Perfil</Tab>     {/* Autogerenciamento */}
  </div>
);
```

**Benefícios**:
- Reduz confusão cognitiva
- Melhora segurança (usuários veem apenas o que podem acessar)
- Personaliza experiência por tipo de usuário

### Decisões Técnicas de Design

#### 1. **Tailwind CSS vs CSS-in-JS**
**Escolha**: Tailwind CSS

**Justificativa**:
```typescript
// Código mais limpo e manutenível
<button className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md">
  Salvar
</button>

// vs CSS-in-JS que seria verboso para casos simples
```

#### 2. **Formulários Complexos com Validação**
```typescript
// Validação em tempo real com feedback visual
const validateForm = (): boolean => {
  const newErrors: Record<string, string> = {};
  
  if (!formData.razaoSocial?.trim()) {
    newErrors.razaoSocial = 'Razão Social é obrigatória';
  }
  
  setErrors(newErrors);
  return Object.keys(newErrors).length === 0;
};
```

**Resultado**: Formulários que guiam o usuário ao invés de frustrá-lo.

#### 3. **Gestão de Estado Distribuída**
```typescript
// Contextos específicos por domínio
AuthContext    // Autenticação global
AdminContext   // Operações administrativas
UserContext    // Dados do usuário específico
```

**Vantagem**: Performance melhor que Redux para este caso de uso.

## 🛠️ Stack Tecnológica

### Frontend
- **React 18** com TypeScript
- **Tailwind CSS** para estilização
- **Context API** para gerenciamento de estado
- **React Router** para navegação
- **Axios** para requisições HTTP

### Infraestrutura
- **Discloud** para hospedagem
- **SQLITE** como banco de dados
- **SSL/HTTPS** para segurança

## 📱 Funcionalidades

### Para Usuários Comuns
- ✅ Gestão completa de clientes
- ✅ Interface responsiva mobile
- ✅ Filtros e busca avançada
- ✅ Perfil editável
- ✅ Login com Google

### Para Administradores
- ✅ Todas as funcionalidades de usuário
- ✅ Gestão de usuários do sistema
- ✅ Painel administrativo
- ✅ Controle de permissões
- ✅ Dashboard com métricas

## 🔐 Segurança

- 🛡️ Autenticação JWT + Google OAuth
- 🛡️ Validação de dados no frontend e backend
- 🛡️ Sanitização de inputs
- 🛡️ HTTPS obrigatório
- 🛡️ Controle de acesso baseado em roles

