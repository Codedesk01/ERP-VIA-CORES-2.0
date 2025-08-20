// Sistema de Gestão de Pedidos - JavaScript
$(document).ready(function() {
    
    // Inicializar aplicação
    initializePedidosApp();
    
    function initializePedidosApp() {
        setupNavigation();
        setupSidebar();
        initializeDashboard();
        initializePedidosSection();
        initializeMarketplacesSection();
        initializeImpressorasSection();
        initializeRelatoriosSection();
        initializeHistoricoSection();
        initializeLogsSection();
        setupModals();
        setupEventListeners();
        loadInitialData();
    }
    
    // Configuração de navegação
    function setupNavigation() {
        $('.sidebar-nav .nav-link').on('click', function(e) {
            e.preventDefault();
            
            const section = $(this).data('section');
            
            // Atualizar item ativo
            $('.sidebar-nav .nav-link').removeClass('active');
            $(this).addClass('active');
            
            // Mostrar seção correspondente
            $('.content-section').removeClass('active');
            $(`#${section}-section`).addClass('active');
            
            // Carregar dados específicos da seção
            loadSectionData(section);
        });
    }
    
    // Configuração da sidebar
    function setupSidebar() {
        $('#sidebarToggle').on('click', function() {
            $('#sidebar').toggleClass('collapsed');
        });
        
        // Sidebar mobile
        if (window.innerWidth <= 768) {
            $('#sidebarToggle').on('click', function() {
                $('#sidebar').toggleClass('show');
            });
        }
    }
    
    // Inicializar Dashboard
    function initializeDashboard() {
        updateStatsCards();
        createPedidosStatusChart();
        createMarketplaceChart();
        loadRecentActivity();
        loadImpressorasStatus();
        setupPeriodFilters();
    }
    
    // Atualizar cards de estatísticas
    function updateStatsCards() {
        const metricas = pedidosData.metricas;
        
        animateCounter('#total-pedidos', metricas.pedidosHoje);
        animateCounter('#pedidos-pendentes', metricas.pedidosPendentes);
        animateCounter('#pedidos-producao', metricas.pedidosProducao);
        
        $('#valor-total').text(`R$ ${metricas.valorTotalPedidos.toFixed(2).replace('.', ',')}`);
    }
    
    // Gráfico de pedidos por status
    function createPedidosStatusChart() {
        const ctx = document.getElementById('pedidosStatusChart').getContext('2d');
        
        const statusCount = {};
        pedidosData.marketplacePedidos.forEach(pedido => {
            statusCount[pedido.status] = (statusCount[pedido.status] || 0) + 1;
        });
        
        const labels = Object.keys(statusCount).map(status => 
            pedidosData.statusPedidos[status]?.label || status
        );
        const data = Object.values(statusCount);
        const colors = Object.keys(statusCount).map(status => 
            pedidosData.statusPedidos[status]?.cor || '#6c757d'
        );
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Pedidos',
                    data: data,
                    backgroundColor: colors,
                    borderColor: colors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                }
            }
        });
    }
    
    // Gráfico de marketplaces
    function createMarketplaceChart() {
        const ctx = document.getElementById('marketplaceChart').getContext('2d');
        
        const marketplaceCount = {};
        pedidosData.marketplacePedidos.forEach(pedido => {
            marketplaceCount[pedido.marketplace] = (marketplaceCount[pedido.marketplace] || 0) + 1;
        });
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(marketplaceCount).map(mp => 
                    mp === 'shopee' ? 'Shopee' : 'Mercado Livre'
                ),
                datasets: [{
                    data: Object.values(marketplaceCount),
                    backgroundColor: ['#ee4d2d', '#fff159'],
                    borderWidth: 0,
                    hoverOffset: 10
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
                cutout: '60%'
            }
        });
    }
    
    // Carregar atividade recente
    function loadRecentActivity() {
        const activities = pedidosData.historicoTransacoes.slice(0, 5).map(transacao => {
            let iconClass, bgClass;
            switch(transacao.acao) {
                case 'novo_pedido':
                    iconClass = 'fas fa-plus';
                    bgClass = 'bg-success';
                    break;
                case 'upload_arte':
                    iconClass = 'fas fa-palette';
                    bgClass = 'bg-info';
                    break;
                case 'baixa_estoque':
                    iconClass = 'fas fa-arrow-down';
                    bgClass = 'bg-warning';
                    break;
                case 'mudanca_status':
                    iconClass = 'fas fa-exchange-alt';
                    bgClass = 'bg-primary';
                    break;
                default:
                    iconClass = 'fas fa-info';
                    bgClass = 'bg-secondary';
            }
            
            return {
                icon: iconClass,
                iconClass: bgClass,
                title: transacao.detalhes,
                time: formatTimeAgo(transacao.data)
            };
        });
        
        const timeline = $('#recent-activity');
        timeline.empty();
        
        activities.forEach((activity, index) => {
            const item = $(`
                <div class="activity-item animate__animated animate__fadeInUp" style="animation-delay: ${index * 0.1}s">
                    <div class="activity-icon ${activity.iconClass}">
                        <i class="${activity.icon}"></i>
                    </div>
                    <div class="activity-content">
                        <div class="activity-title">${activity.title}</div>
                        <div class="activity-time text-muted">${activity.time}</div>
                    </div>
                </div>
            `);
            timeline.append(item);
        });
    }
    
    // Carregar status das impressoras
    function loadImpressorasStatus() {
        const container = $('#impressoras-status');
        container.empty();
        
        pedidosData.impressoras.forEach(impressora => {
            let statusClass, statusText;
            switch(impressora.status) {
                case 'disponivel':
                    statusClass = 'text-success';
                    statusText = 'Disponível';
                    break;
                case 'em_uso':
                    statusClass = 'text-warning';
                    statusText = 'Em Uso';
                    break;
                case 'manutencao':
                    statusClass = 'text-danger';
                    statusText = 'Manutenção';
                    break;
                default:
                    statusClass = 'text-secondary';
                    statusText = 'Offline';
            }
            
            const item = $(`
                <div class="d-flex justify-content-between align-items-center mb-2 p-2 border rounded">
                    <div>
                        <strong>${impressora.nome}</strong>
                        <div class="small text-muted">${impressora.localizacao}</div>
                    </div>
                    <div class="text-end">
                        <span class="badge ${statusClass.replace('text-', 'bg-')}">${statusText}</span>
                        <div class="small text-muted">Fila: ${impressora.filaImpressao}</div>
                    </div>
                </div>
            `);
            container.append(item);
        });
    }
    
    // Inicializar seção de pedidos
    function initializePedidosSection() {
        initializePedidosTable();
        setupPedidosFilters();
    }
    
    // Inicializar tabela de pedidos
    function initializePedidosTable() {
        $('#pedidosTable').DataTable({
            data: pedidosData.marketplacePedidos,
            columns: [
                { data: 'id' },
                { 
                    data: 'marketplace',
                    render: function(data) {
                        if (data === 'shopee') {
                            return '<span class="badge bg-shopee">Shopee</span>';
                        } else if (data === 'mercadolivre') {
                            return '<span class="badge bg-ml text-dark">Mercado Livre</span>';
                        }
                        return data;
                    }
                },
                { 
                    data: 'sku',
                    render: function(data, type, row) {
                        const estoqueIcon = row.temEstoque ? 
                            '<i class="fas fa-check text-success ms-1" title="Com estoque"></i>' : 
                            '<i class="fas fa-times text-danger ms-1" title="Sem estoque"></i>';
                        return `<strong>${data}</strong> ${estoqueIcon}`;
                    }
                },
                { data: 'cliente' },
                { 
                    data: 'produto',
                    render: function(data) {
                        return data.length > 30 ? data.substring(0, 30) + '...' : data;
                    }
                },
                { data: 'quantidade' },
                { 
                    data: 'valor',
                    render: function(data) {
                        return `R$ ${data.toFixed(2).replace('.', ',')}`;
                    }
                },
                { 
                    data: 'status',
                    render: function(data) {
                        const status = pedidosData.statusPedidos[data];
                        if (status) {
                            return `<span class="badge" style="background-color: ${status.cor}; color: white;">${status.label}</span>`;
                        }
                        return data;
                    }
                },
                { 
                    data: 'temEstoque',
                    render: function(data, type, row) {
                        if (data) {
                            return `<span class="text-success"><i class="fas fa-check"></i> ${row.posicaoEstoque}</span>`;
                        } else {
                            return '<span class="text-danger"><i class="fas fa-times"></i> Sem estoque</span>';
                        }
                    }
                },
                { 
                    data: 'dataRecebimento',
                    render: function(data) {
                        return new Date(data).toLocaleDateString('pt-BR');
                    }
                },
                {
                    data: null,
                    render: function(data, type, row) {
                        return `
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-primary" onclick="verDetalhesPedido('${row.id}')">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn btn-outline-success" onclick="uploadArte('${row.id}')">
                                    <i class="fas fa-palette"></i>
                                </button>
                                <button class="btn btn-outline-warning" onclick="alterarStatus('${row.id}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                            </div>
                        `;
                    }
                }
            ],
            responsive: true,
            pageLength: 10,
            language: {
                url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/pt-BR.json'
            },
            order: [[9, 'desc']]
        });
    }
    
    // Configurar filtros de pedidos
    function setupPedidosFilters() {
        $('#filterMarketplace, #filterStatus, #filterEstoque').on('change', function() {
            filtrarPedidos();
        });
        
        $('#searchPedidos').on('keyup', function() {
            filtrarPedidos();
        });
    }
    
    // Filtrar tabela de pedidos
    function filtrarPedidos() {
        const table = $('#pedidosTable').DataTable();
        
        const marketplace = $('#filterMarketplace').val();
        const status = $('#filterStatus').val();
        const estoque = $('#filterEstoque').val();
        const search = $('#searchPedidos').val();
        
        // Aplicar filtros
        table.columns(1).search(marketplace);
        table.columns(7).search(status);
        table.columns(8).search(estoque === 'true' ? 'check' : (estoque === 'false' ? 'times' : ''));
        table.search(search);
        
        table.draw();
    }
    
    // Inicializar seção de marketplaces
    function initializeMarketplacesSection() {
        loadMarketplaceStats();
        loadMarketplacePedidos();
    }
    
    // Carregar estatísticas dos marketplaces
    function loadMarketplaceStats() {
        const config = pedidosData.configMarketplaces;
        
        $('#shopee-pedidos').text(config.shopee.pedidosImportados);
        $('#ml-pedidos').text(config.mercadolivre.pedidosImportados);
    }
    
    // Carregar pedidos dos marketplaces em boxes
    function loadMarketplacePedidos() {
        const container = $('#marketplace-pedidos');
        container.empty();
        
        pedidosData.marketplacePedidos.forEach(pedido => {
            const estoqueInfo = pedido.temEstoque ? 
                `<i class="fas fa-check text-success"></i> ${pedido.quantidadeDisponivel}` : 
                '<i class="fas fa-times text-danger"></i> 0';
            
            const marketplaceClass = pedido.marketplace === 'shopee' ? 'border-shopee' : 'border-ml';
            const marketplaceIcon = pedido.marketplace === 'shopee' ? 'fab fa-shopify' : 'fas fa-shopping-bag';
            
            const box = $(`
                <div class="col-lg-4 col-md-6 mb-3">
                    <div class="card marketplace-pedido-box ${marketplaceClass}">
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                    <h6 class="mb-1">${pedido.sku}</h6>
                                    <small class="text-muted">${pedido.id}</small>
                                </div>
                                <div class="text-end">
                                    <i class="${marketplaceIcon} ${pedido.marketplace === 'shopee' ? 'text-shopee' : 'text-ml'}"></i>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between align-items-center">
                                <div>
                                    <small class="text-muted">Estoque:</small>
                                    <div>${estoqueInfo}</div>
                                </div>
                                <div class="text-end">
                                    <small class="text-muted">Qtd:</small>
                                    <div><strong>^${pedido.quantidade}</strong></div>
                                </div>
                            </div>
                            <hr class="my-2">
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="badge" style="background-color: ${pedidosData.statusPedidos[pedido.status]?.cor}; color: white;">
                                    ${pedidosData.statusPedidos[pedido.status]?.label}
                                </span>
                                <button class="btn btn-sm btn-outline-primary" onclick="verDetalhesPedido('${pedido.id}')">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `);
            container.append(box);
        });
    }
    
    // Inicializar seção de impressoras
    function initializeImpressorasSection() {
        loadImpressorasCards();
        initializeFilaImpressaoTable();
    }
    
    // Carregar cards das impressoras
    function loadImpressorasCards() {
        const container = $('#impressoras-cards');
        container.empty();
        
        pedidosData.impressoras.forEach(impressora => {
            let statusClass, statusText, statusIcon;
            switch(impressora.status) {
                case 'disponivel':
                    statusClass = 'text-success';
                    statusText = 'Disponível';
                    statusIcon = 'fas fa-check-circle';
                    break;
                case 'em_uso':
                    statusClass = 'text-warning';
                    statusText = 'Em Uso';
                    statusIcon = 'fas fa-clock';
                    break;
                case 'manutencao':
                    statusClass = 'text-danger';
                    statusText = 'Manutenção';
                    statusIcon = 'fas fa-tools';
                    break;
                default:
                    statusClass = 'text-secondary';
                    statusText = 'Offline';
                    statusIcon = 'fas fa-power-off';
            }
            
            const card = $(`
                <div class="col-lg-4 col-md-6 mb-4">
                    <div class="card impressora-card">
                        <div class="card-header">
                            <div class="d-flex justify-content-between align-items-center">
                                <h6 class="mb-0">${impressora.nome}</h6>
                                <span class="${statusClass}">
                                    <i class="${statusIcon}"></i> ${statusText}
                                </span>
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <small class="text-muted">Localização:</small>
                                <div>${impressora.localizacao}</div>
                            </div>
                            <div class="mb-3">
                                <small class="text-muted">Fila de Impressão:</small>
                                <div><strong>${impressora.filaImpressao}</strong> trabalhos</div>
                            </div>
                            <div class="mb-3">
                                <small class="text-muted">Níveis de Tinta:</small>
                                <div class="row">
                                    <div class="col-6">
                                        <div class="d-flex justify-content-between">
                                            <span>Preto:</span>
                                            <span>${impressora.nivelTinta.preto}%</span>
                                        </div>
                                        <div class="progress mb-1" style="height: 4px;">
                                            <div class="progress-bar bg-dark" style="width: ${impressora.nivelTinta.preto}%"></div>
                                        </div>
                                    </div>
                                    <div class="col-6">
                                        <div class="d-flex justify-content-between">
                                            <span>Cores:</span>
                                            <span>${Math.min(impressora.nivelTinta.ciano, impressora.nivelTinta.magenta, impressora.nivelTinta.amarelo)}%</span>
                                        </div>
                                        <div class="progress mb-1" style="height: 4px;">
                                            <div class="progress-bar bg-primary" style="width: ${Math.min(impressora.nivelTinta.ciano, impressora.nivelTinta.magenta, impressora.nivelTinta.amarelo)}%"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="d-flex justify-content-between">
                                <button class="btn btn-sm btn-outline-primary" onclick="configurarImpressora('${impressora.id}')">
                                    <i class="fas fa-cog"></i> Config
                                </button>
                                <button class="btn btn-sm btn-outline-success" onclick="testarImpressora('${impressora.id}')">
                                    <i class="fas fa-print"></i> Testar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `);
            container.append(card);
        });
    }
    
    // Inicializar tabela de fila de impressão
    function initializeFilaImpressaoTable() {
        const filaData = pedidosData.marketplacePedidos
            .filter(p => p.arteUpload && p.impressora)
            .map((pedido, index) => ({
                posicao: index + 1,
                pedidoId: pedido.id,
                sku: pedido.sku,
                arte: pedido.arteUpload.arquivo,
                impressora: pedido.impressora,
                status: pedido.arteUpload.status
            }));
        
        $('#filaImpressaoTable').DataTable({
            data: filaData,
            columns: [
                { data: 'posicao' },
                { data: 'pedidoId' },
                { data: 'sku' },
                { data: 'arte' },
                { data: 'impressora' },
                { 
                    data: 'status',
                    render: function(data) {
                        const statusMap = {
                            'aprovada': '<span class="badge bg-success">Aprovada</span>',
                            'em_impressao': '<span class="badge bg-warning">Em Impressão</span>',
                            'impressa': '<span class="badge bg-info">Impressa</span>',
                            'finalizada': '<span class="badge bg-primary">Finalizada</span>'
                        };
                        return statusMap[data] || data;
                    }
                },
                {
                    data: null,
                    render: function(data, type, row) {
                        return `
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-primary" onclick="moverFilaImpressao(${row.posicao}, 'up')">
                                    <i class="fas fa-arrow-up"></i>
                                </button>
                                <button class="btn btn-outline-primary" onclick="moverFilaImpressao(${row.posicao}, 'down')">
                                    <i class="fas fa-arrow-down"></i>
                                </button>
                                <button class="btn btn-outline-danger" onclick="removerFilaImpressao(${row.posicao})">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        `;
                    }
                }
            ],
            responsive: true,
            pageLength: 10,
            language: {
                url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/pt-BR.json'
            },
            order: [[0, 'asc']]
        });
    }
    
    // Inicializar seção de relatórios
    function initializeRelatoriosSection() {
        setupReportCards();
    }
    
    // Configurar cards de relatórios
    function setupReportCards() {
        $('.report-card').on('click', function() {
            const reportType = $(this).data('report');
            generateReport(reportType);
        });
    }
    
    // Gerar relatório
    function generateReport(type) {
        const reportContent = $('#reportContent');
        $('#exportarRelatorio').show();
        
        switch(type) {
            case 'pedidos':
                generatePedidosReport(reportContent);
                break;
            case 'artes':
                generateArtesReport(reportContent);
                break;
            case 'impressao':
                generateImpressaoReport(reportContent);
                break;
            case 'producao':
                generateProducaoReport(reportContent);
                break;
        }
    }
    
    // Relatório de pedidos
    function generatePedidosReport(container) {
        const totalPedidos = pedidosData.marketplacePedidos.length;
        const valorTotal = pedidosData.marketplacePedidos.reduce((sum, p) => sum + p.valor, 0);
        const pedidosPorStatus = {};
        
        pedidosData.marketplacePedidos.forEach(pedido => {
            pedidosPorStatus[pedido.status] = (pedidosPorStatus[pedido.status] || 0) + 1;
        });
        
        let html = `
            <div class="row">
                <div class="col-md-6">
                    <h5>Resumo dos Pedidos</h5>
                    <table class="table table-sm">
                        <tr><td>Total de Pedidos:</td><td><strong>${totalPedidos}</strong></td></tr>
                        <tr><td>Valor Total:</td><td><strong>R$ ${valorTotal.toFixed(2).replace('.', ',')}</strong></td></tr>
                        <tr><td>Ticket Médio:</td><td><strong>R$ ${(valorTotal/totalPedidos).toFixed(2).replace('.', ',')}</strong></td></tr>
                    </table>
                </div>
                <div class="col-md-6">
                    <h5>Por Status</h5>
                    <table class="table table-sm">
        `;
        
        Object.entries(pedidosPorStatus).forEach(([status, count]) => {
            const statusInfo = pedidosData.statusPedidos[status];
            html += `<tr><td>${statusInfo?.label || status}:</td><td><strong>${count}</strong></td></tr>`;
        });
        
        html += `
                    </table>
                </div>
            </div>
        `;
        
        container.html(html);
    }
    
    // Relatório de artes
    function generateArtesReport(container) {
        const artes = pedidosData.relatoriosArtes;
        
        let html = `
            <h5>Relatório Detalhado de Upload de Artes</h5>
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Arquivo</th>
                        <th>Pedido</th>
                        <th>SKU</th>
                        <th>Data Upload</th>
                        <th>Usuário</th>
                        <th>Tamanho</th>
                        <th>Formato</th>
                        <th>Status</th>
                        <th>Observações</th>
                    </tr>
                </thead>
                <tbody>
        `;
        
        artes.forEach(arte => {
            html += `
                <tr>
                    <td>${arte.arquivo}</td>
                    <td>${arte.pedidoId}</td>
                    <td>${arte.sku}</td>
                    <td>${new Date(arte.dataUpload).toLocaleString('pt-BR')}</td>
                    <td>${arte.usuario}</td>
                    <td>${arte.tamanhoArquivo}</td>
                    <td>${arte.formato}</td>
                    <td><span class="badge bg-success">${arte.status}</span></td>
                    <td>${arte.observacoes}</td>
                </tr>
            `;
        });
        
        html += '</tbody></table>';
        container.html(html);
    }
    
    // Inicializar seção de histórico
    function initializeHistoricoSection() {
        initializeHistoricoTable();
        setupHistoricoFilters();
    }
    
    // Inicializar tabela de histórico
    function initializeHistoricoTable() {
        $('#historicoTable').DataTable({
            data: pedidosData.historicoTransacoes,
            columns: [
                { 
                    data: 'data',
                    render: function(data) {
                        return new Date(data).toLocaleString('pt-BR');
                    }
                },
                { data: 'pedidoId' },
                { 
                    data: 'acao',
                    render: function(data) {
                        return capitalizeFirst(data.replace('_', ' '));
                    }
                },
                { data: 'usuario' },
                { data: 'detalhes' },
                { 
                    data: 'status',
                    render: function(data) {
                        const statusMap = {
                            'sucesso': '<span class="badge bg-success">Sucesso</span>',
                            'erro': '<span class="badge bg-danger">Erro</span>',
                            'pendente': '<span class="badge bg-warning">Pendente</span>'
                        };
                        return statusMap[data] || data;
                    }
                }
            ],
            responsive: true,
            pageLength: 10,
            language: {
                url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/pt-BR.json'
            },
            order: [[0, 'desc']]
        });
    }
    
    // Configurar filtros de histórico
    function setupHistoricoFilters() {
        // Implementar filtros de histórico
    }
    
    // Inicializar seção de logs
    function initializeLogsSection() {
        // Usar os logs do sistema de estoque existente
        if (typeof stockData !== 'undefined' && stockData.logs) {
            initializeLogsTable(stockData.logs);
        }
    }
    
    // Inicializar tabela de logs
    function initializeLogsTable(logs) {
        $('#logsTable').DataTable({
            data: logs,
            columns: [
                { 
                    data: 'date',
                    render: function(data) {
                        return new Date(data).toLocaleString('pt-BR');
                    }
                },
                { 
                    data: 'level',
                    render: function(data) {
                        const levelMap = {
                            'info': '<span class="badge bg-info">Info</span>',
                            'success': '<span class="badge bg-success">Success</span>',
                            'warning': '<span class="badge bg-warning">Warning</span>',
                            'error': '<span class="badge bg-danger">Error</span>'
                        };
                        return levelMap[data] || data;
                    }
                },
                { data: 'user' },
                { data: 'module' },
                { 
                    data: 'action',
                    render: function(data) {
                        return capitalizeFirst(data);
                    }
                },
                { data: 'description' },
                { data: 'ip' }
            ],
            responsive: true,
            pageLength: 10,
            language: {
                url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/pt-BR.json'
            },
            order: [[0, 'desc']]
        });
    }
    
    // Configurar modais
    function setupModals() {
        // Modal de upload de arte
        $('#uploadArteModal').on('show.bs.modal', function(event) {
            const button = $(event.relatedTarget);
            const pedidoId = button.data('pedido-id');
            
            if (pedidoId) {
                const pedido = pedidosData.marketplacePedidos.find(p => p.id === pedidoId);
                if (pedido) {
                    $('#uploadPedidoId').val(pedido.id);
                    $('#uploadSku').val(pedido.sku);
                }
            }
        });
    }
    
    // Configurar event listeners
    function setupEventListeners() {
        // Filtros de período
        setupPeriodFilters();
    }
    
    // Configurar filtros de período
    function setupPeriodFilters() {
        $('[data-period]').on('click', function() {
            $('[data-period]').removeClass('active');
            $(this).addClass('active');
            
            const period = $(this).data('period');
            updateDashboardData(period);
        });
    }
    
    // Atualizar dados do dashboard
    function updateDashboardData(period) {
        console.log(`Atualizando dashboard para período: ${period}`);
        updateStatsCards();
        loadRecentActivity();
    }
    
    // Carregar dados iniciais
    function loadInitialData() {
        console.log('Dados iniciais do módulo de pedidos carregados');
    }
    
    // Carregar dados específicos da seção
    function loadSectionData(section) {
        switch(section) {
            case 'dashboard':
                updateStatsCards();
                loadRecentActivity();
                loadImpressorasStatus();
                break;
            case 'pedidos':
                // Dados já carregados na inicialização
                break;
            case 'marketplaces':
                loadMarketplaceStats();
                loadMarketplacePedidos();
                break;
            case 'impressoras':
                loadImpressorasCards();
                break;
            case 'relatorios':
                $('#reportContent').html(`
                    <div class="text-center text-muted py-5">
                        <i class="fas fa-chart-bar fa-3x mb-3"></i>
                        <p>Selecione um relatório acima para visualizar os dados</p>
                    </div>
                `);
                $('#exportarRelatorio').hide();
                break;
        }
    }
    
    // Funções auxiliares
    function animateCounter(selector, target) {
        const element = $(selector);
        const duration = 2000;
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;
        
        const timer = setInterval(() => {
            current += increment;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.text(Math.floor(current));
        }, 16);
    }
    
    function formatTimeAgo(dateString) {
        const now = new Date();
        const date = new Date(dateString);
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        
        if (diffMins < 60) {
            return `há ${diffMins} minutos`;
        } else if (diffHours < 24) {
            return `há ${diffHours} horas`;
        } else {
            return `há ${diffDays} dias`;
        }
    }
    
    function capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
    
    function showAlert(message, type) {
        const alertClass = {
            'success': 'alert-success',
            'error': 'alert-danger',
            'warning': 'alert-warning',
            'info': 'alert-info'
        }[type] || 'alert-info';
        
        const alert = $(`
            <div class="alert ${alertClass} alert-dismissible fade show position-fixed" 
                 style="top: 20px; right: 20px; z-index: 9999; min-width: 300px;">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `);
        
        $('body').append(alert);
        
        // Auto-remover após 5 segundos
        setTimeout(() => {
            alert.alert('close');
        }, 5000);
    }
    
    // Funções globais para os botões das interfaces
    
    // Sincronização de marketplaces
    window.sincronizarMarketplace = function(marketplace) {
        showAlert(`Sincronizando pedidos do ${marketplace === 'shopee' ? 'Shopee' : 'Mercado Livre'}...`, 'info');
        
        setTimeout(() => {
            showAlert('Pedidos sincronizados com sucesso!', 'success');
            loadMarketplaceStats();
            loadMarketplacePedidos();
        }, 2000);
    };
    
    window.sincronizarTodos = function() {
        showAlert('Sincronizando todos os marketplaces...', 'info');
        
        setTimeout(() => {
            showAlert('Todos os marketplaces sincronizados com sucesso!', 'success');
            loadMarketplaceStats();
            loadMarketplacePedidos();
        }, 3000);
    };
    
    // Detalhes do pedido
    window.verDetalhesPedido = function(pedidoId) {
        const pedido = pedidosData.marketplacePedidos.find(p => p.id === pedidoId);
        if (pedido) {
            const content = `
                <div class="row">
                    <div class="col-md-6">
                        <h6>Informações do Pedido</h6>
                        <table class="table table-sm">
                            <tr><td>ID:</td><td><strong>${pedido.id}</strong></td></tr>
                            <tr><td>Marketplace:</td><td><strong>${pedido.marketplace === 'shopee' ? 'Shopee' : 'Mercado Livre'}</strong></td></tr>
                            <tr><td>SKU:</td><td><strong>${pedido.sku}</strong></td></tr>
                            <tr><td>Cliente:</td><td><strong>${pedido.cliente}</strong></td></tr>
                            <tr><td>Produto:</td><td><strong>${pedido.produto}</strong></td></tr>
                            <tr><td>Quantidade:</td><td><strong>${pedido.quantidade}</strong></td></tr>
                            <tr><td>Valor:</td><td><strong>R$ ${pedido.valor.toFixed(2).replace('.', ',')}</strong></td></tr>
                        </table>
                    </div>
                    <div class="col-md-6">
                        <h6>Status e Estoque</h6>
                        <table class="table table-sm">
                            <tr><td>Status:</td><td><span class="badge" style="background-color: ${pedidosData.statusPedidos[pedido.status]?.cor}">${pedidosData.statusPedidos[pedido.status]?.label}</span></td></tr>
                            <tr><td>Tem Estoque:</td><td><strong>${pedido.temEstoque ? 'Sim' : 'Não'}</strong></td></tr>
                            <tr><td>Posição:</td><td><strong>${pedido.posicaoEstoque || 'N/A'}</strong></td></tr>
                            <tr><td>Qtd Disponível:</td><td><strong>${pedido.quantidadeDisponivel}</strong></td></tr>
                            <tr><td>Data Recebimento:</td><td><strong>${new Date(pedido.dataRecebimento).toLocaleString('pt-BR')}</strong></td></tr>
                        </table>
                    </div>
                </div>
                ${pedido.arteUpload ? `
                <div class="row mt-3">
                    <div class="col-12">
                        <h6>Arte Enviada</h6>
                        <table class="table table-sm">
                            <tr><td>Arquivo:</td><td><strong>${pedido.arteUpload.arquivo}</strong></td></tr>
                            <tr><td>Data Upload:</td><td><strong>${new Date(pedido.arteUpload.dataUpload).toLocaleString('pt-BR')}</strong></td></tr>
                            <tr><td>Usuário:</td><td><strong>${pedido.arteUpload.usuario}</strong></td></tr>
                            <tr><td>Status:</td><td><span class="badge bg-success">${pedido.arteUpload.status}</span></td></tr>
                        </table>
                    </div>
                </div>
                ` : ''}
                ${pedido.observacoes ? `
                <div class="row mt-3">
                    <div class="col-12">
                        <h6>Observações</h6>
                        <p>${pedido.observacoes}</p>
                    </div>
                </div>
                ` : ''}
            `;
            
            $('#pedidoModalContent').html(content);
            $('#pedidoModal').modal('show');
        }
    };
    
    // Upload de arte
    window.uploadArte = function(pedidoId) {
        $('#uploadPedidoId').val(pedidoId);
        const pedido = pedidosData.marketplacePedidos.find(p => p.id === pedidoId);
        if (pedido) {
            $('#uploadSku').val(pedido.sku);
        }
        $('#uploadArteModal').modal('show');
    };
    
    // Salvar upload de arte
    window.salvarUploadArte = function() {
        const pedidoId = $('#uploadPedidoId').val();
        const arquivo = $('#uploadArquivo')[0].files[0];
        const observacoes = $('#uploadObservacoes').val();
        
        if (!arquivo) {
            showAlert('Por favor, selecione um arquivo.', 'warning');
            return;
        }
        
        // Simular upload
        showAlert('Fazendo upload da arte...', 'info');
        
        setTimeout(() => {
            const pedido = pedidosData.marketplacePedidos.find(p => p.id === pedidoId);
            if (pedido) {
                pedido.arteUpload = {
                    arquivo: arquivo.name,
                    dataUpload: new Date().toISOString().slice(0, 19).replace('T', ' '),
                    usuario: 'Usuário Atual',
                    status: 'aprovada'
                };
                
                // Atualizar status do pedido
                if (pedido.status === 'aguardando_arte') {
                    atualizarStatusPedido(pedidoId, 'producao', 'Arte aprovada, enviado para produção');
                }
                
                // Registrar no histórico
                pedidosData.historicoTransacoes.unshift({
                    id: pedidosData.historicoTransacoes.length + 1,
                    data: new Date().toISOString().slice(0, 19).replace('T', ' '),
                    pedidoId: pedidoId,
                    acao: 'upload_arte',
                    usuario: 'Usuário Atual',
                    detalhes: `Upload da arte: ${arquivo.name}`,
                    status: 'sucesso'
                });
                
                // Atualizar tabelas
                $('#pedidosTable').DataTable().clear().rows.add(pedidosData.marketplacePedidos).draw();
                
                showAlert('Arte enviada com sucesso!', 'success');
                $('#uploadArteModal').modal('hide');
                $('#uploadArteForm')[0].reset();
            }
        }, 2000);
    };
    
    // Alterar status do pedido
    window.alterarStatus = function(pedidoId) {
        const pedido = pedidosData.marketplacePedidos.find(p => p.id === pedidoId);
        if (pedido) {
            const novoStatus = prompt('Novo status:', pedido.status);
            if (novoStatus && novoStatus !== pedido.status) {
                atualizarStatusPedido(pedidoId, novoStatus, 'Status alterado manualmente');
                $('#pedidosTable').DataTable().clear().rows.add(pedidosData.marketplacePedidos).draw();
                showAlert('Status alterado com sucesso!', 'success');
            }
        }
    };
    
    // Configurar marketplace
    window.configurarMarketplace = function(marketplace) {
        showAlert(`Abrindo configurações do ${marketplace === 'shopee' ? 'Shopee' : 'Mercado Livre'}...`, 'info');
    };
    
    // Configurar impressora
    window.configurarImpressora = function(impressoraId) {
        showAlert('Abrindo configurações da impressora...', 'info');
    };
    
    // Testar impressora
    window.testarImpressora = function(impressoraId) {
        showAlert('Enviando página de teste para impressão...', 'info');
        
        setTimeout(() => {
            showAlert('Página de teste enviada com sucesso!', 'success');
        }, 1500);
    };
    
    // Exportar relatório
    window.exportarRelatorio = function() {
        showAlert('Exportando relatório...', 'info');
        
        setTimeout(() => {
            showAlert('Relatório exportado com sucesso!', 'success');
        }, 1500);
    };
    
    // Exportar histórico
    window.exportarHistorico = function() {
        const csvContent = "data:text/csv;charset=utf-8," 
            + "Data/Hora,Pedido,Ação,Usuário,Detalhes,Status\n"
            + pedidosData.historicoTransacoes.map(h => 
                `"${h.data}","${h.pedidoId}","${h.acao}","${h.usuario}","${h.detalhes}","${h.status}"`
            ).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `historico_pedidos_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showAlert('Histórico exportado com sucesso!', 'success');
    };
    
    // Exportar logs
    window.exportarLogs = function() {
        showAlert('Exportando logs...', 'info');
        
        setTimeout(() => {
            showAlert('Logs exportados com sucesso!', 'success');
        }, 1500);
    };
    
    // Limpar logs
    window.limparLogs = function() {
        if (confirm('Tem certeza que deseja limpar todos os logs? Esta ação não pode ser desfeita.')) {
            showAlert('Logs limpos com sucesso!', 'success');
        }
    };
    
});

