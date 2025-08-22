# Sistema de Gerenciamento - Versão de Teste

Este é um sistema completo de gerenciamento desenvolvido em HTML, CSS e JavaScript puro para teste e demonstração. O sistema implementa controle de acesso baseado em permissões e múltiplos módulos integrados.

## 🚀 Funcionalidades Principais

### Sistema de Autenticação
- Login/logout com diferentes perfis de usuário
- Controle de sessão com timeout automático
- Logs detalhados de todas as ações
- Proteção contra tentativas de login excessivas

### Sistema de Permissões
- **Admin Master**: Acesso completo a todos os módulos
- **Admin Produção**: Acesso aos módulos de produção, costura, expedição e relatórios
- **Usuário Estoque**: Acesso apenas ao módulo de estoque
- **Usuário Pedidos**: Acesso aos módulos de pedidos e banco de imagens
- **Usuário Costura**: Acesso apenas ao módulo de costura

### Módulos Disponíveis

#### 1. Dashboard
- Visão geral do sistema com estatísticas em tempo real
- Cards adaptativos baseados nas permissões do usuário
- Atividade recente (apenas para administradores)

#### 2. Gestão de Usuários (Admin Master)
- CRUD completo de usuários
- Configuração de permissões por usuário
- Histórico de acessos

#### 3. Estoque
- Cadastro e controle de itens
- Sistema de posicionamento (prateleiras)
- Controle de movimentações (entrada, saída, ajuste)
- Alertas de estoque baixo
- Integração com módulo de pedidos

#### 4. Pedidos
- Importação de pedidos em massa
- Integração com múltiplos marketplaces:
  - Shopee
  - Mercado Livre
  - Magalu
  - Shein
  - Site próprio
  - WhatsApp
- Verificação automática de estoque
- Sistema de status e progresso

#### 5. Banco de Imagens
- Sincronização com pedidos dos marketplaces
- Busca por SKU
- Seleção de impressora (IMP1, IMP2, IMP3, Lona)
- Organização automática de pastas temporárias
- Controle de qual máquina está processando

#### 6. Produção
- Fila de produção com datas de entrega
- Destaque para entregas urgentes (motoboy)
- Histórico de progresso com filtros
- Sistema de check para envio à costura

#### 7. Costura
- Fila específica de costura
- Controle de usuários por tipo de produto (PV, PC, etc.)
- Relatórios de eficiência por usuário
- Sistema de check para envio à expedição

#### 8. Expedição
- Conferência em 3 etapas
- Histórico de envios
- Códigos de rastreamento
- Relatórios detalhados

#### 9. Relatórios
- Relatórios detalhados de todos os módulos
- Exportação de dados
- Análises de performance

#### 10. Logs do Sistema (Admin Master)
- Registro detalhado de todas as ações
- Filtros por tipo de ação e período
- Informações de IP e user agent

## 🔧 Como Usar

### 1. Iniciando o Sistema
```bash
# Navegue até a pasta do projeto
cd sistema-gerenciamento

# Inicie um servidor HTTP local
python3 -m http.server 8080

# Ou use qualquer outro servidor web de sua preferência
```

### 2. Acessando o Sistema
1. Abra o navegador e acesse: `http://localhost:8080/` ou `http://localhost:8080/index.html`
2. Use uma das contas de teste disponíveis na tela de login
3. Após o login, você será redirecionado para `usuario.html` com os módulos específicos do seu perfil

### 3. Contas de Teste Disponíveis

| Usuário | Senha | Perfil | Permissões |
|---------|-------|---------|------------|
| admin | admin123 | Admin Master | Todos os módulos |
| producao | prod123 | Admin Produção | Produção, Costura, Expedição, Relatórios |
| estoque | est123 | Usuário Estoque | Estoque |
| pedidos | ped123 | Usuário Pedidos | Pedidos, Banco de Imagens |
| costura | cos123 | Usuário Costura | Costura |

### 4. Testando Permissões
- Use o seletor "Perfil de Teste" na barra lateral para alternar entre diferentes perfis
- Observe como a interface se adapta mostrando apenas os módulos permitidos
- Teste a navegação entre os módulos disponíveis

## 🎨 Características Técnicas

### Frontend
- **HTML5**: Estrutura semântica e acessível
- **CSS3**: Design responsivo com variáveis CSS e flexbox/grid
- **JavaScript ES6+**: Programação orientada a objetos e modular

### Arquitetura
- **Padrão MVC**: Separação clara entre dados, apresentação e lógica
- **Sistema de Módulos**: Carregamento dinâmico de conteúdo
- **Sistema de Permissões**: Controle granular de acesso
- **Dados Simulados**: Sistema completo de dados de exemplo

### Responsividade
- Design adaptável para desktop, tablet e mobile
- Menu lateral colapsável
- Tabelas com scroll horizontal
- Cards responsivos

### Segurança (Simulada)
- Controle de sessão
- Logs de auditoria
- Proteção contra força bruta
- Timeout de sessão

## 📁 Estrutura do Projeto

```
sistema-gerenciamento/
├── index.html              # Página de login (página inicial)
├── usuario.html            # Página principal do sistema (após login)
├── css/
│   ├── style.css           # Estilos principais
│   └── components.css      # Estilos de componentes
├── js/
│   ├── auth.js            # Sistema de autenticação
│   ├── permissions.js     # Sistema de permissões
│   ├── modules.js         # Sistema de módulos
│   └── script.js          # Script principal
├── data/
│   └── sample-data.js     # Dados de exemplo
└── README.md              # Esta documentação
```

## 🔄 Fluxo de Trabalho Simulado

1. **Pedidos**: Importação de pedidos dos marketplaces
2. **Estoque**: Verificação automática de disponibilidade
3. **Banco de Imagens**: Preparação das artes para impressão
4. **Produção**: Processamento dos itens
5. **Costura**: Finalização dos produtos
6. **Expedição**: Conferência e envio

## 📊 Dados de Exemplo

O sistema inclui dados realistas para demonstração:
- 4 produtos em estoque com diferentes status
- 3 pedidos de diferentes marketplaces
- Movimentações de estoque
- Usuários com diferentes perfis
- Logs de sistema

## 🚀 Próximos Passos para Produção

Para transformar este sistema de teste em um sistema de produção:

1. **Backend**: Implementar API REST com Node.js, Python ou PHP
2. **Banco de Dados**: Integrar com MySQL, PostgreSQL ou MongoDB
3. **Autenticação**: Implementar JWT ou OAuth
4. **Integração**: Conectar com APIs dos marketplaces
5. **Deploy**: Configurar servidor de produção
6. **Monitoramento**: Implementar logs e métricas reais

## 📝 Notas Importantes

- Este é um sistema de **TESTE** apenas
- Todos os dados são simulados
- Não usar em ambiente de produção sem as devidas adaptações
- O sistema foi desenvolvido para demonstrar funcionalidades e interface

## 🎯 Objetivos Alcançados

✅ Interface adaptável baseada em permissões  
✅ Sistema de autenticação funcional  
✅ Múltiplos módulos integrados  
✅ Design responsivo e moderno  
✅ Dados realistas para demonstração  
✅ Navegação intuitiva  
✅ Logs e auditoria  
✅ Sistema de controle de acesso  

---

**Desenvolvido para teste e demonstração de funcionalidades**

