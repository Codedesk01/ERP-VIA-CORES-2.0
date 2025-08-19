# Sistema de Gestão de Estoque

Sistema completo de gestão de estoque desenvolvido com HTML, CSS e JavaScript, baseado nos templates fornecidos.

## 📋 Funcionalidades

### 🏠 Dashboard
- Visão geral do estoque com métricas importantes
- Gráficos de movimentação dos últimos 7 dias
- Distribuição de produtos por categoria
- Timeline de atividades recentes
- Cards com estatísticas em tempo real

### 📦 Gestão de Itens
- **Cadastro de Itens**: Formulário completo com validação
  - Código, nome, categoria, unidade de medida
  - Quantidade inicial, estoque mínimo, valor unitário
  - Localização (prateleira e posição)
  - Descrição detalhada
- **Alinhamento**: Sistema de prateleiras e posições
- **Filtros Avançados**: Por categoria, status, localização
- **Busca**: Por nome ou código do item
- **Ações**: Editar, visualizar histórico, excluir

### 🔄 Movimentações
- **Entrada**: Registro de entradas no estoque
  - Motivos: compra, devolução, transferência, outros
- **Saída**: Registro de saídas do estoque
  - Motivos: venda, produção, devolução, perda, outros
  - Validação de quantidade disponível
- **Ajuste**: Correção de quantidades
  - Motivos: inventário, correção, perda, outros
  - Obrigatório informar observações
- **Filtros**: Por tipo, data, item, usuário
- **Histórico Completo**: Todas as movimentações registradas

### 📊 Relatórios
- **Inventário Geral**: Relatório completo de todos os itens
- **Movimentações**: Histórico detalhado de movimentações
- **Estoque Baixo**: Itens com estoque abaixo do mínimo
- **Valorização**: Valor total do estoque por categoria
- **Relatórios Personalizados**: Configuração customizada

### 🛒 Integração com Pedidos
- **Sincronização**: Integração automática com módulo de pedidos
- **Verificação de Estoque**: Status automático de disponibilidade
- **Baixa Automática**: Redução automática do estoque ao processar pedidos
- **Status de Pedidos**: Processados, pendentes, sem estoque
- **Processamento**: Ações para processar pedidos disponíveis

### 📝 Logs do Sistema
- **Registro Completo**: Todas as ações são logadas
- **Níveis**: Info, Success, Warning, Error
- **Filtros**: Por nível, ação, usuário, data
- **Exportação**: Download dos logs em CSV
- **Limpeza**: Opção para limpar logs antigos

## 🎨 Design e Interface

### Características Visuais
- **Design Moderno**: Interface limpa e profissional
- **Cores Temáticas**: Esquema de cores específico para estoque
  - Verde: Operações de entrada e disponibilidade
  - Vermelho: Operações de saída e alertas
  - Laranja: Ajustes e avisos
  - Azul: Informações e relatórios
- **Animações**: Transições suaves e micro-interações
- **Responsivo**: Adaptado para desktop, tablet e mobile

### Componentes
- **Sidebar Navegável**: Menu lateral com ícones e animações
- **Cards Estatísticos**: Métricas com animações de contador
- **Tabelas Interativas**: DataTables com filtros e paginação
- **Modais Funcionais**: Formulários em modais com validação
- **Gráficos**: Charts.js para visualização de dados
- **Badges de Status**: Indicadores visuais de status
- **Timeline**: Linha do tempo para atividades

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura semântica e acessível
- **CSS3**: Estilos modernos com gradientes e animações
- **JavaScript (ES6+)**: Lógica de negócio e interatividade
- **jQuery**: Manipulação do DOM e eventos
- **Bootstrap 5**: Framework CSS responsivo
- **DataTables**: Tabelas interativas com filtros
- **Chart.js**: Gráficos e visualizações
- **Font Awesome**: Ícones vetoriais
- **Animate.css**: Animações CSS

## 📁 Estrutura de Arquivos

```
sistema-estoque/
├── css/
│   ├── estoque-style.css      # Estilos específicos do estoque
│   ├── admin-style.css        # Estilos do template admin
│   └── login-style.css        # Estilos do template login
├── js/
│   ├── estoque-script.js      # JavaScript principal do estoque
│   ├── admin-script.js        # JavaScript do template admin
│   └── login-script.js        # JavaScript do template login
├── pages/                     # Páginas adicionais (futuro)
├── assets/
│   └── images/               # Imagens do sistema
├── estoque.html              # Página principal do módulo
├── admin.html                # Página admin original
├── login.html                # Página de login original
└── README.md                 # Esta documentação
```

## 🚀 Como Usar

### 1. Acesso ao Sistema
- Abra `login.html` no navegador
- Use as credenciais de demonstração ou acesse diretamente `estoque.html`

### 2. Navegação
- Use o menu lateral para navegar entre as seções
- Clique nos ícones para acessar diferentes funcionalidades

### 3. Cadastro de Itens
- Acesse "Itens" no menu lateral
- Clique em "Novo Item" para cadastrar
- Preencha todos os campos obrigatórios
- Defina a localização (prateleira e posição)

### 4. Movimentações
- Acesse "Movimentações" no menu lateral
- Use os botões "Entrada", "Saída" ou "Ajuste"
- Selecione o item e informe a quantidade
- Escolha o motivo e adicione observações

### 5. Relatórios
- Acesse "Relatórios" no menu lateral
- Clique nos cards para gerar relatórios rápidos
- Use "Relatório Personalizado" para configurações avançadas

### 6. Integração com Pedidos
- Acesse "Integração Pedidos" no menu lateral
- Visualize pedidos pendentes e processados
- Use "Sincronizar Pedidos" para atualizar dados
- Processe pedidos com estoque disponível

## 🔧 Configuração

### Dados Simulados
O sistema utiliza dados simulados em JavaScript para demonstração:
- 4 itens de exemplo com diferentes categorias
- Movimentações de entrada, saída e ajuste
- Pedidos com diferentes status
- Logs de sistema com diferentes níveis

### Personalização
- **Cores**: Modifique as variáveis CSS em `:root`
- **Categorias**: Adicione novas categorias nos selects
- **Prateleiras**: Configure novas localizações
- **Motivos**: Personalize motivos de movimentação

## 📱 Responsividade

O sistema é totalmente responsivo e se adapta a diferentes tamanhos de tela:
- **Desktop**: Layout completo com sidebar fixa
- **Tablet**: Sidebar colapsível, cards reorganizados
- **Mobile**: Menu hambúrguer, layout vertical

## 🔒 Segurança

- Validação de formulários no frontend
- Logs de todas as ações do usuário
- Controle de acesso por seções
- Prevenção de ações não autorizadas

## 🎯 Funcionalidades Futuras

- [ ] Integração com banco de dados real
- [ ] API REST para comunicação backend
- [ ] Autenticação e autorização
- [ ] Relatórios em PDF
- [ ] Código de barras
- [ ] Notificações push
- [ ] Backup automático
- [ ] Auditoria avançada

## 📞 Suporte

Para dúvidas ou sugestões sobre o sistema de estoque, consulte a documentação ou entre em contato com a equipe de desenvolvimento.

---

**Desenvolvido com base nos templates fornecidos**  
**© 2025 Via Cores LTDA - Todos os direitos reservados**

