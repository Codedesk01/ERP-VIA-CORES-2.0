// Sistema de Módulos
class ModuleSystem {
    constructor() {
        this.currentModule = 'dashboard';
        this.modules = {
            dashboard: {
                title: 'Dashboard',
                breadcrumb: ['Início', 'Dashboard'],
                content: this.getDashboardContent
            },
            usuarios: {
                title: 'Gestão de Usuários',
                breadcrumb: ['Início', 'Gestão de Usuários'],
                content: this.getUsersContent
            },
            estoque: {
                title: 'Estoque',
                breadcrumb: ['Início', 'Estoque'],
                content: this.getEstoqueContent
            },
            pedidos: {
                title: 'Pedidos',
                breadcrumb: ['Início', 'Pedidos'],
                content: this.getPedidosContent
            },
            'banco-imagens': {
                title: 'Banco de Imagens',
                breadcrumb: ['Início', 'Banco de Imagens'],
                content: this.getBancoImagensContent
            },
            producao: {
                title: 'Produção',
                breadcrumb: ['Início', 'Produção'],
                content: this.getProducaoContent
            },
            costura: {
                title: 'Costura',
                breadcrumb: ['Início', 'Costura'],
                content: this.getCosturaContent
            },
            expedicao: {
                title: 'Expedição',
                breadcrumb: ['Início', 'Expedição'],
                content: this.getExpedicaoContent
            },
            relatorios: {
                title: 'Relatórios',
                breadcrumb: ['Início', 'Relatórios'],
                content: this.getRelatoriosContent
            },
            logs: {
                title: 'Logs do Sistema',
                breadcrumb: ['Início', 'Logs do Sistema'],
                content: this.getLogsContent
            }
        };
    }

    // Carrega um módulo
    loadModule(moduleId) {
        const module = this.modules[moduleId];
        if (!module) {
            console.error(`Módulo ${moduleId} não encontrado`);
            return;
        }

        // Verifica permissões
        if (moduleId !== 'dashboard' && window.permissionSystem && !window.permissionSystem.hasPermission(moduleId)) {
            this.showAccessDenied();
            return;
        }

        this.currentModule = moduleId;
        
        // Atualiza título e breadcrumb
        this.updatePageHeader(module.title, module.breadcrumb);
        
        // Atualiza navegação ativa
        this.updateActiveNav(moduleId);
        
        // Carrega conteúdo
        this.loadContent(module.content);
        
        // Log da ação
        if (window.authSystem) {
            window.authSystem.logAction('module_access', `Acessou módulo: ${module.title}`);
        }
    }

    // Atualiza cabeçalho da página
    updatePageHeader(title, breadcrumb) {
        const pageTitle = document.getElementById('pageTitle');
        const breadcrumbEl = document.getElementById('breadcrumb');
        
        if (pageTitle) pageTitle.textContent = title;
        if (breadcrumbEl) {
            breadcrumbEl.innerHTML = breadcrumb.map((item, index) => {
                const isLast = index === breadcrumb.length - 1;
                return `<span${isLast ? ' class="active"' : ''}>${item}</span>`;
            }).join(' > ');
        }
    }

    // Atualiza navegação ativa
    updateActiveNav(moduleId) {
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-module') === moduleId) {
                link.classList.add('active');
            }
        });
    }

    // Carrega conteúdo
    loadContent(contentFunction) {
        const contentBody = document.getElementById('contentBody');
        if (contentBody) {
            contentBody.innerHTML = '<div class="loading"><i class="fas fa-spinner fa-spin"></i><p>Carregando...</p></div>';
            
            setTimeout(() => {
                contentBody.innerHTML = contentFunction.call(this);
            }, 500);
        }
    }

    // Mostra acesso negado
    showAccessDenied() {
        const contentBody = document.getElementById('contentBody');
        if (contentBody) {
            contentBody.innerHTML = `
                <div class="text-center" style="padding: 3rem;">
                    <i class="fas fa-lock" style="font-size: 4rem; color: var(--danger-color); margin-bottom: 1rem;"></i>
                    <h3>Acesso Negado</h3>
                    <p>Você não tem permissão para acessar este módulo.</p>
                    <button class="btn btn-primary" onclick="moduleSystem.loadModule('dashboard')">
                        <i class="fas fa-home"></i> Voltar ao Dashboard
                    </button>
                </div>
            `;
        }
    }

    // Conteúdo do Dashboard
    getDashboardContent() {
        const user = window.permissionSystem?.getCurrentUser();
        const isAdmin = window.permissionSystem?.isAdmin();
        const stats = window.sampleData?.estatisticas || {};
        
        return `
            <div class="stats-grid">
                ${user?.permissions.includes('estoque') ? `
                <div class="stat-card">
                    <div class="stat-icon primary">
                        <i class="fas fa-boxes"></i>
                    </div>
                    <div class="stat-content">
                        <h3>${stats.estoque?.totalItens || 1234}</h3>
                        <p>Itens em Estoque</p>
                    </div>
                </div>
                ` : ''}
                
                ${user?.permissions.includes('pedidos') ? `
                <div class="stat-card">
                    <div class="stat-icon success">
                        <i class="fas fa-shopping-cart"></i>
                    </div>
                    <div class="stat-content">
                        <h3>${stats.pedidos?.pedidosHoje || 89}</h3>
                        <p>Pedidos Hoje</p>
                    </div>
                </div>
                ` : ''}
                
                ${user?.permissions.includes('producao') ? `
                <div class="stat-card">
                    <div class="stat-icon warning">
                        <i class="fas fa-industry"></i>
                    </div>
                    <div class="stat-content">
                        <h3>${stats.producao?.filaProducao || 45}</h3>
                        <p>Em Produção</p>
                    </div>
                </div>
                ` : ''}
                
                ${user?.permissions.includes('expedicao') ? `
                <div class="stat-card">
                    <div class="stat-icon info">
                        <i class="fas fa-shipping-fast"></i>
                    </div>
                    <div class="stat-content">
                        <h3>${stats.expedicao?.paraExpedicao || 23}</h3>
                        <p>Para Expedição</p>
                    </div>
                </div>
                ` : ''}
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Bem-vindo, ${user?.name || 'Usuário'}!</h3>
                </div>
                <div class="card-body">
                    <p>Você está logado como <strong>${user?.name || 'Usuário'}</strong>.</p>
                    <p>Suas permissões incluem acesso aos módulos: <strong>${window.permissionSystem?.getUserPermissions().join(', ') || 'Nenhum'}</strong></p>
                    ${isAdmin ? '<p><i class="fas fa-crown" style="color: gold;"></i> Você possui privilégios administrativos.</p>' : ''}
                </div>
            </div>

            ${isAdmin ? `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Atividade Recente</h3>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Hora</th>
                                    <th>Usuário</th>
                                    <th>Ação</th>
                                    <th>Módulo</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>14:30</td>
                                    <td>João Silva</td>
                                    <td>Baixa de estoque</td>
                                    <td>Estoque</td>
                                </tr>
                                <tr>
                                    <td>14:25</td>
                                    <td>Maria Santos</td>
                                    <td>Novo pedido</td>
                                    <td>Pedidos</td>
                                </tr>
                                <tr>
                                    <td>14:20</td>
                                    <td>Pedro Costa</td>
                                    <td>Check produção</td>
                                    <td>Produção</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            ` : ''}
        `;
    }

    // Conteúdo de Gestão de Usuários
    getUsersContent() {
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Gestão de Usuários</h3>
                    <button class="btn btn-primary">
                        <i class="fas fa-plus"></i> Novo Usuário
                    </button>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Email</th>
                                    <th>Perfil</th>
                                    <th>Status</th>
                                    <th>Último Acesso</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Admin Master</td>
                                    <td>admin@sistema.com</td>
                                    <td><span class="badge badge-primary">Admin Master</span></td>
                                    <td><span class="badge badge-success">Ativo</span></td>
                                    <td>Agora</td>
                                    <td>
                                        <button class="btn btn-sm btn-secondary">Editar</button>
                                        <button class="btn btn-sm btn-danger">Desativar</button>
                                    </td>
                                </tr>
                                <tr>
                                    <td>João Silva</td>
                                    <td>joao@sistema.com</td>
                                    <td><span class="badge badge-info">Usuário Estoque</span></td>
                                    <td><span class="badge badge-success">Ativo</span></td>
                                    <td>2 horas atrás</td>
                                    <td>
                                        <button class="btn btn-sm btn-secondary">Editar</button>
                                        <button class="btn btn-sm btn-danger">Desativar</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    // Conteúdo de Estoque
    getEstoqueContent() {
        const estoqueData = window.sampleData?.estoque || [];
        const stats = window.sampleData?.estatisticas?.estoque || {};
        
        return `
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon primary">
                        <i class="fas fa-cubes"></i>
                    </div>
                    <div class="stat-content">
                        <h3>${stats.totalItens || estoqueData.length}</h3>
                        <p>Total de Itens</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon warning">
                        <i class="fas fa-exclamation-triangle"></i>
                    </div>
                    <div class="stat-content">
                        <h3>${estoqueData.filter(item => item.status === 'baixo').length}</h3>
                        <p>Estoque Baixo</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon success">
                        <i class="fas fa-arrow-up"></i>
                    </div>
                    <div class="stat-content">
                        <h3>${stats.entradasHoje || 156}</h3>
                        <p>Entradas Hoje</p>
                    </div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon danger">
                        <i class="fas fa-arrow-down"></i>
                    </div>
                    <div class="stat-content">
                        <h3>${stats.saidasHoje || 89}</h3>
                        <p>Saídas Hoje</p>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Itens em Estoque</h3>
                    <div>
                        <button class="btn btn-primary">
                            <i class="fas fa-plus"></i> Novo Item
                        </button>
                        <button class="btn btn-success">
                            <i class="fas fa-download"></i> Exportar
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>SKU</th>
                                    <th>Descrição</th>
                                    <th>Posição</th>
                                    <th>Quantidade</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${estoqueData.map(item => `
                                    <tr>
                                        <td><strong>${item.sku}</strong></td>
                                        <td>${item.descricao}</td>
                                        <td>${item.posicao}</td>
                                        <td>${item.quantidade}</td>
                                        <td>${window.dataUtils?.getStatusBadge(item.status, item.status === 'disponivel' ? 'Disponível' : item.status === 'baixo' ? 'Baixo' : 'Indisponível')}</td>
                                        <td>
                                            <button class="btn btn-sm btn-primary">Ver</button>
                                            <button class="btn btn-sm btn-warning">Baixa</button>
                                        </td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    // Conteúdo de Pedidos
    getPedidosContent() {
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Pedidos por Marketplace</h3>
                    <button class="btn btn-primary">
                        <i class="fas fa-upload"></i> Importar Pedidos
                    </button>
                </div>
                <div class="card-body">
                    <div class="marketplace-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
                        <div class="marketplace-card" style="border: 2px solid #ff6b35; border-radius: 12px; padding: 1rem; background: #fff;">
                            <h4 style="color: #ff6b35; margin-bottom: 1rem;">
                                <i class="fab fa-shopify"></i> Shopee
                            </h4>
                            <div class="pedido-item" style="background: #f8f9fa; padding: 0.5rem; border-radius: 8px; margin-bottom: 0.5rem;">
                                <strong>PCRV029 ^2</strong>
                                <span style="float: right; color: green;">✓ Em estoque</span>
                            </div>
                            <div class="pedido-item" style="background: #f8f9fa; padding: 0.5rem; border-radius: 8px; margin-bottom: 0.5rem;">
                                <strong>KDDN001 ^1</strong>
                                <span style="float: right; color: orange;">⚠ Baixo estoque</span>
                            </div>
                        </div>
                        
                        <div class="marketplace-card" style="border: 2px solid #fff100; border-radius: 12px; padding: 1rem; background: #fff;">
                            <h4 style="color: #333; margin-bottom: 1rem;">
                                <i class="fas fa-store"></i> Mercado Livre
                            </h4>
                            <div class="pedido-item" style="background: #f8f9fa; padding: 0.5rem; border-radius: 8px; margin-bottom: 0.5rem;">
                                <strong>ABCD123 ^3</strong>
                                <span style="float: right; color: green;">✓ Em estoque</span>
                            </div>
                        </div>
                        
                        <div class="marketplace-card" style="border: 2px solid #0066cc; border-radius: 12px; padding: 1rem; background: #fff;">
                            <h4 style="color: #0066cc; margin-bottom: 1rem;">
                                <i class="fas fa-shopping-bag"></i> Magalu
                            </h4>
                            <div class="pedido-item" style="background: #f8f9fa; padding: 0.5rem; border-radius: 8px; margin-bottom: 0.5rem;">
                                <strong>XPTO456 ^1</strong>
                                <span style="float: right; color: green;">✓ Em estoque</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Status dos Pedidos</h3>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Pedido</th>
                                    <th>SKU</th>
                                    <th>Marketplace</th>
                                    <th>Quantidade</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>#12345</td>
                                    <td>PCRV029</td>
                                    <td>Shopee</td>
                                    <td>2</td>
                                    <td><span class="badge badge-warning">Aguardando</span></td>
                                    <td>
                                        <button class="btn btn-sm btn-success">✓ Confirmar</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    // Conteúdo de Banco de Imagens
    getBancoImagensContent() {
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Banco de Imagens</h3>
                    <div>
                        <input type="text" placeholder="Buscar por SKU..." class="form-control" style="width: 200px; display: inline-block;">
                        <button class="btn btn-primary">
                            <i class="fas fa-search"></i> Buscar
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="printer-selection" style="margin-bottom: 2rem;">
                        <h4>Selecionar Impressora:</h4>
                        <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                            <label><input type="radio" name="printer" value="imp1"> IMP1</label>
                            <label><input type="radio" name="printer" value="imp2"> IMP2</label>
                            <label><input type="radio" name="printer" value="imp3"> IMP3</label>
                            <label><input type="radio" name="printer" value="lona"> Lona</label>
                        </div>
                    </div>

                    <div class="images-grid" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
                        <div class="image-card" style="border: 1px solid #ddd; border-radius: 8px; padding: 1rem; text-align: center;">
                            <div style="width: 100%; height: 150px; background: #f0f0f0; border-radius: 4px; margin-bottom: 1rem; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-image" style="font-size: 2rem; color: #ccc;"></i>
                            </div>
                            <h5>PCRV029</h5>
                            <p>4 imagens encontradas</p>
                            <button class="btn btn-sm btn-primary">
                                <i class="fas fa-download"></i> Baixar Pasta
                            </button>
                        </div>
                        
                        <div class="image-card" style="border: 1px solid #ddd; border-radius: 8px; padding: 1rem; text-align: center;">
                            <div style="width: 100%; height: 150px; background: #f0f0f0; border-radius: 4px; margin-bottom: 1rem; display: flex; align-items: center; justify-content: center;">
                                <i class="fas fa-image" style="font-size: 2rem; color: #ccc;"></i>
                            </div>
                            <h5>KDDN001</h5>
                            <p>6 imagens encontradas</p>
                            <button class="btn btn-sm btn-primary">
                                <i class="fas fa-download"></i> Baixar Pasta
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Conteúdo de Produção
    getProducaoContent() {
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Fila de Produção</h3>
                </div>
                <div class="card-body">
                    <div class="production-queue" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem;">
                        <div class="production-item" style="border: 2px solid #28a745; border-radius: 12px; padding: 1rem; background: #f8f9fa;">
                            <h4>PCRV029 ^2</h4>
                            <p style="color: #28a745; font-weight: bold;">12 de outubro</p>
                            <p>Entrega normal</p>
                            <button class="btn btn-sm btn-success">✓ Finalizar</button>
                        </div>
                        
                        <div class="production-item" style="border: 2px solid #dc3545; border-radius: 12px; padding: 1rem; background: #f8f9fa;">
                            <h4>KDDN001 ^1</h4>
                            <p style="color: #dc3545; font-weight: bold;">11 de outubro</p>
                            <p><strong>MOTOBOY</strong></p>
                            <button class="btn btn-sm btn-success">✓ Finalizar</button>
                        </div>
                        
                        <div class="production-item" style="border: 2px solid #28a745; border-radius: 12px; padding: 1rem; background: #f8f9fa;">
                            <h4>ABCD123 ^3</h4>
                            <p style="color: #28a745; font-weight: bold;">13 de outubro</p>
                            <p>Entrega normal</p>
                            <button class="btn btn-sm btn-success">✓ Finalizar</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Histórico de Produção</h3>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>SKU</th>
                                    <th>Quantidade</th>
                                    <th>Data/Hora</th>
                                    <th>Usuário</th>
                                    <th>Status</th>
                                    <th>Ações</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>XPTO789</td>
                                    <td>2</td>
                                    <td>10/10/2024 14:30</td>
                                    <td>João Silva</td>
                                    <td><span class="badge badge-success">Finalizado</span></td>
                                    <td>
                                        <button class="btn btn-sm btn-warning">Reverter</button>
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    // Conteúdo de Costura
    getCosturaContent() {
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Fila de Costura</h3>
                    <div>
                        <select class="form-control" style="width: 200px; display: inline-block;">
                            <option>Todos os usuários</option>
                            <option>Usuário PV</option>
                            <option>Usuário PC</option>
                        </select>
                    </div>
                </div>
                <div class="card-body">
                    <div class="costura-queue" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1rem;">
                        <div class="costura-item" style="border: 2px solid #007bff; border-radius: 12px; padding: 1rem; background: #f8f9fa; text-align: center;">
                            <h4>PCRV029</h4>
                            <button class="btn btn-success">✓ Finalizar</button>
                        </div>
                        
                        <div class="costura-item" style="border: 2px solid #007bff; border-radius: 12px; padding: 1rem; background: #f8f9fa; text-align: center;">
                            <h4>KDDN001</h4>
                            <button class="btn btn-success">✓ Finalizar</button>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Relatório de Eficiência</h3>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Usuário</th>
                                    <th>Checks Hoje</th>
                                    <th>Total Semanal</th>
                                    <th>Eficiência</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Maria Santos</td>
                                    <td>23</td>
                                    <td>156</td>
                                    <td><span class="badge badge-success">95%</span></td>
                                </tr>
                                <tr>
                                    <td>Ana Costa</td>
                                    <td>18</td>
                                    <td>134</td>
                                    <td><span class="badge badge-warning">87%</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    // Conteúdo de Expedição
    getExpedicaoContent() {
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Fila de Expedição</h3>
                </div>
                <div class="card-body">
                    <div class="expedicao-queue">
                        <div class="expedicao-item" style="border: 1px solid #ddd; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <h4>Pedido #12345 - PCRV029</h4>
                                    <p>Cliente: João Silva</p>
                                    <p>Endereço: Rua das Flores, 123</p>
                                </div>
                                <div>
                                    <button class="btn btn-primary">1ª Conferência</button>
                                </div>
                            </div>
                        </div>
                        
                        <div class="expedicao-item" style="border: 1px solid #ddd; border-radius: 8px; padding: 1rem; margin-bottom: 1rem;">
                            <div style="display: flex; justify-content: space-between; align-items: center;">
                                <div>
                                    <h4>Pedido #12346 - KDDN001</h4>
                                    <p>Cliente: Maria Santos</p>
                                    <p>Endereço: Av. Principal, 456</p>
                                </div>
                                <div>
                                    <button class="btn btn-warning">2ª Conferência</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Histórico de Envios</h3>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Pedido</th>
                                    <th>SKU</th>
                                    <th>Cliente</th>
                                    <th>Data Envio</th>
                                    <th>Status</th>
                                    <th>Rastreamento</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>#12344</td>
                                    <td>XPTO789</td>
                                    <td>Pedro Costa</td>
                                    <td>09/10/2024</td>
                                    <td><span class="badge badge-success">Entregue</span></td>
                                    <td>BR123456789</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    // Conteúdo de Relatórios
    getRelatoriosContent() {
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Relatórios do Sistema</h3>
                </div>
                <div class="card-body">
                    <div class="reports-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
                        <div class="report-card" style="border: 1px solid #ddd; border-radius: 8px; padding: 1.5rem;">
                            <h4><i class="fas fa-boxes"></i> Relatório de Estoque</h4>
                            <p>Movimentações, posições e quantidades detalhadas</p>
                            <button class="btn btn-primary">
                                <i class="fas fa-download"></i> Gerar Relatório
                            </button>
                        </div>
                        
                        <div class="report-card" style="border: 1px solid #ddd; border-radius: 8px; padding: 1.5rem;">
                            <h4><i class="fas fa-shopping-cart"></i> Relatório de Pedidos</h4>
                            <p>Análise de pedidos por marketplace e período</p>
                            <button class="btn btn-primary">
                                <i class="fas fa-download"></i> Gerar Relatório
                            </button>
                        </div>
                        
                        <div class="report-card" style="border: 1px solid #ddd; border-radius: 8px; padding: 1.5rem;">
                            <h4><i class="fas fa-industry"></i> Relatório de Produção</h4>
                            <p>Eficiência e tempo de produção por item</p>
                            <button class="btn btn-primary">
                                <i class="fas fa-download"></i> Gerar Relatório
                            </button>
                        </div>
                        
                        <div class="report-card" style="border: 1px solid #ddd; border-radius: 8px; padding: 1.5rem;">
                            <h4><i class="fas fa-cut"></i> Relatório de Costura</h4>
                            <p>Performance e eficiência dos usuários</p>
                            <button class="btn btn-primary">
                                <i class="fas fa-download"></i> Gerar Relatório
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Conteúdo de Logs
    getLogsContent() {
        const logs = window.authSystem?.getLogs(50) || [];
        
        return `
            <div class="card">
                <div class="card-header">
                    <h3 class="card-title">Logs do Sistema</h3>
                    <div>
                        <select class="form-control" style="width: 150px; display: inline-block;">
                            <option>Todas as ações</option>
                            <option>Login/Logout</option>
                            <option>Acesso a módulos</option>
                            <option>Alterações</option>
                        </select>
                        <button class="btn btn-secondary">
                            <i class="fas fa-filter"></i> Filtrar
                        </button>
                    </div>
                </div>
                <div class="card-body">
                    <div class="table-container">
                        <table class="table">
                            <thead>
                                <tr>
                                    <th>Data/Hora</th>
                                    <th>Ação</th>
                                    <th>Descrição</th>
                                    <th>IP</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${logs.map(log => `
                                    <tr>
                                        <td>${new Date(log.timestamp).toLocaleString('pt-BR')}</td>
                                        <td><span class="badge badge-info">${log.action}</span></td>
                                        <td>${log.description}</td>
                                        <td>${log.ip}</td>
                                    </tr>
                                `).join('')}
                                ${logs.length === 0 ? '<tr><td colspan="4" class="text-center">Nenhum log encontrado</td></tr>' : ''}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        `;
    }

    // Inicializa o sistema
    init() {
        // Event listeners para navegação
        document.addEventListener('click', (e) => {
            const navLink = e.target.closest('.nav-link');
            if (navLink) {
                e.preventDefault();
                const moduleId = navLink.getAttribute('data-module');
                if (moduleId) {
                    this.loadModule(moduleId);
                }
            }
        });

        // Carrega módulo inicial
        this.loadModule('dashboard');
    }
}

// Instância global do sistema de módulos
window.moduleSystem = new ModuleSystem();

