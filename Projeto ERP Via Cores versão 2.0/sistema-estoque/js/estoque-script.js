// Sistema de Gestão de Estoque - JavaScript
$(document).ready(function() {
    
    // Inicializar aplicação
    initializeApp();
    
    function initializeApp() {
        setupNavigation();
        setupSidebar();
        initializeDashboard();
        initializeItemsSection();
        initializeMovementsSection();
        initializeReportsSection();
        initializeOrdersSection();
        initializeLogsSection();
        setupModals();
        setupEventListeners();
        loadInitialData();
    }
    
    // Dados simulados do sistema
    let stockData = {
        items: [
            {
                id: 1,
                code: 'TEC001',
                name: 'Tecido Algodão Azul',
                category: 'tecidos',
                unit: 'm',
                quantity: 150.5,
                minStock: 20,
                price: 25.90,
                shelf: 'A1',
                position: '001',
                description: 'Tecido 100% algodão, cor azul marinho',
                status: 'disponivel',
                lastMovement: '2024-01-15 14:30'
            },
            {
                id: 2,
                code: 'AVI001',
                name: 'Botão Plástico Branco 15mm',
                category: 'aviamentos',
                unit: 'un',
                quantity: 500,
                minStock: 100,
                price: 0.15,
                shelf: 'B1',
                position: '025',
                description: 'Botão plástico branco, diâmetro 15mm',
                status: 'disponivel',
                lastMovement: '2024-01-15 10:15'
            },
            {
                id: 3,
                code: 'FER001',
                name: 'Tesoura Profissional 25cm',
                category: 'ferramentas',
                unit: 'un',
                quantity: 5,
                minStock: 10,
                price: 89.90,
                shelf: 'C1',
                position: '010',
                description: 'Tesoura profissional para costura, 25cm',
                status: 'baixo',
                lastMovement: '2024-01-14 16:45'
            },
            {
                id: 4,
                code: 'TEC002',
                name: 'Tecido Poliéster Vermelho',
                category: 'tecidos',
                unit: 'm',
                quantity: 0,
                minStock: 15,
                price: 18.50,
                shelf: 'A2',
                position: '005',
                description: 'Tecido poliéster vermelho',
                status: 'esgotado',
                lastMovement: '2024-01-13 09:20'
            }
        ],
        movements: [
            {
                id: 1,
                date: '2024-01-15 14:30',
                type: 'entrada',
                itemId: 1,
                itemName: 'Tecido Algodão Azul',
                quantity: 50,
                reason: 'compra',
                user: 'João Silva',
                observations: 'Compra fornecedor ABC Tecidos',
                ip: '192.168.1.100'
            },
            {
                id: 2,
                date: '2024-01-15 10:15',
                type: 'saida',
                itemId: 2,
                itemName: 'Botão Plástico Branco 15mm',
                quantity: 100,
                reason: 'producao',
                user: 'Maria Santos',
                observations: 'Produção lote 2024-001',
                ip: '192.168.1.101'
            },
            {
                id: 3,
                date: '2024-01-14 16:45',
                type: 'ajuste',
                itemId: 3,
                itemName: 'Tesoura Profissional 25cm',
                quantity: -2,
                reason: 'inventario',
                user: 'Administrador',
                observations: 'Ajuste após inventário físico',
                ip: '192.168.1.102'
            }
        ],
        orders: [
            {
                id: 'PED001',
                client: 'Confecção ABC',
                items: [
                    { itemId: 1, itemName: 'Tecido Algodão Azul', quantity: 25 },
                    { itemId: 2, itemName: 'Botão Plástico Branco 15mm', quantity: 200 }
                ],
                stockStatus: 'disponivel',
                orderDate: '2024-01-15 09:00',
                autoDeduct: true,
                status: 'processado'
            },
            {
                id: 'PED002',
                client: 'Ateliê XYZ',
                items: [
                    { itemId: 4, itemName: 'Tecido Poliéster Vermelho', quantity: 10 }
                ],
                stockStatus: 'sem_estoque',
                orderDate: '2024-01-15 11:30',
                autoDeduct: false,
                status: 'pendente'
            }
        ],
        logs: [
            {
                id: 1,
                date: '2024-01-15 14:30',
                level: 'info',
                user: 'João Silva',
                action: 'cadastro',
                module: 'Estoque',
                description: 'Novo item cadastrado: Tecido Algodão Azul',
                ip: '192.168.1.100'
            },
            {
                id: 2,
                date: '2024-01-15 10:15',
                level: 'success',
                user: 'Maria Santos',
                action: 'movimentacao',
                module: 'Estoque',
                description: 'Saída registrada: 100 unidades de Botão Plástico Branco 15mm',
                ip: '192.168.1.101'
            },
            {
                id: 3,
                date: '2024-01-14 16:45',
                level: 'warning',
                user: 'Administrador',
                action: 'ajuste',
                module: 'Estoque',
                description: 'Ajuste de estoque: Tesoura Profissional 25cm',
                ip: '192.168.1.102'
            }
        ]
    };
    
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
        createStockMovementChart();
        createCategoriesChart();
        loadStockActivity();
        setupPeriodFilters();
    }
    
    // Atualizar cards de estatísticas
    function updateStatsCards() {
        const totalItems = stockData.items.length;
        const lowStockItems = stockData.items.filter(item => item.status === 'baixo' || item.status === 'esgotado').length;
        const todayEntries = stockData.movements.filter(mov => 
            mov.type === 'entrada' && isToday(mov.date)
        ).length;
        const todayExits = stockData.movements.filter(mov => 
            mov.type === 'saida' && isToday(mov.date)
        ).length;
        
        animateCounter('#total-items', totalItems);
        animateCounter('#low-stock', lowStockItems);
        animateCounter('#entries-today', todayEntries);
        animateCounter('#exits-today', todayExits);
    }
    
    // Gráfico de movimentação de estoque
    function createStockMovementChart() {
        const ctx = document.getElementById('stockMovementChart').getContext('2d');
        
        const last7Days = getLast7Days();
        const entriesData = last7Days.map(date => {
            return stockData.movements.filter(mov => 
                mov.type === 'entrada' && isSameDay(mov.date, date)
            ).length;
        });
        const exitsData = last7Days.map(date => {
            return stockData.movements.filter(mov => 
                mov.type === 'saida' && isSameDay(mov.date, date)
            ).length;
        });
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: last7Days.map(date => formatDateShort(date)),
                datasets: [{
                    label: 'Entradas',
                    data: entriesData,
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }, {
                    label: 'Saídas',
                    data: exitsData,
                    borderColor: '#ef4444',
                    backgroundColor: 'rgba(239, 68, 68, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
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
    
    // Gráfico de categorias
    function createCategoriesChart() {
        const ctx = document.getElementById('categoriesChart').getContext('2d');
        
        const categories = {};
        stockData.items.forEach(item => {
            categories[item.category] = (categories[item.category] || 0) + 1;
        });
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: Object.keys(categories).map(cat => capitalizeFirst(cat)),
                datasets: [{
                    data: Object.values(categories),
                    backgroundColor: [
                        '#4f46e5',
                        '#10b981',
                        '#f59e0b',
                        '#ef4444'
                    ],
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
    
    // Carregar atividade do estoque
    function loadStockActivity() {
        const activities = stockData.movements.slice(0, 5).map(movement => {
            let iconClass, bgClass;
            switch(movement.type) {
                case 'entrada':
                    iconClass = 'fas fa-arrow-up';
                    bgClass = 'bg-success';
                    break;
                case 'saida':
                    iconClass = 'fas fa-arrow-down';
                    bgClass = 'bg-danger';
                    break;
                case 'ajuste':
                    iconClass = 'fas fa-edit';
                    bgClass = 'bg-warning';
                    break;
            }
            
            return {
                icon: iconClass,
                iconClass: bgClass,
                title: `${capitalizeFirst(movement.type)}: ${movement.itemName}`,
                time: formatTimeAgo(movement.date)
            };
        });
        
        const timeline = $('#stock-activity');
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
    
    // Inicializar seção de itens
    function initializeItemsSection() {
        initializeItemsTable();
        setupItemFilters();
        loadItemsForSelects();
    }
    
    // Inicializar tabela de itens
    function initializeItemsTable() {
        $('#itemsTable').DataTable({
            data: stockData.items,
            columns: [
                { data: 'code' },
                { data: 'name' },
                { 
                    data: 'category',
                    render: function(data) {
                        return capitalizeFirst(data);
                    }
                },
                { 
                    data: 'quantity',
                    render: function(data, type, row) {
                        return `${data} ${row.unit}`;
                    }
                },
                { 
                    data: null,
                    render: function(data, type, row) {
                        return `${row.shelf}-${row.position}`;
                    }
                },
                { 
                    data: 'status',
                    render: function(data) {
                        const statusMap = {
                            'disponivel': '<span class="status-badge status-active">Disponível</span>',
                            'baixo': '<span class="status-badge status-pending">Estoque Baixo</span>',
                            'esgotado': '<span class="status-badge status-inactive">Esgotado</span>'
                        };
                        return statusMap[data] || data;
                    }
                },
                { data: 'lastMovement' },
                {
                    data: null,
                    render: function(data, type, row) {
                        return `
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-primary" onclick="editItem(${row.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-outline-info" onclick="viewItemHistory(${row.id})">
                                    <i class="fas fa-history"></i>
                                </button>
                                <button class="btn btn-outline-danger" onclick="deleteItem(${row.id})">
                                    <i class="fas fa-trash"></i>
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
    
    // Configurar filtros de itens
    function setupItemFilters() {
        $('#filterCategory, #filterStatus, #filterLocation').on('change', function() {
            filterItemsTable();
        });
        
        $('#searchItems').on('keyup', function() {
            filterItemsTable();
        });
    }
    
    // Filtrar tabela de itens
    function filterItemsTable() {
        const table = $('#itemsTable').DataTable();
        
        const category = $('#filterCategory').val();
        const status = $('#filterStatus').val();
        const location = $('#filterLocation').val();
        const search = $('#searchItems').val();
        
        // Aplicar filtros
        table.columns(2).search(category);
        table.columns(5).search(status);
        table.columns(4).search(location);
        table.search(search);
        
        table.draw();
    }
    
    // Carregar itens para selects
    function loadItemsForSelects() {
        const itemOptions = stockData.items.map(item => 
            `<option value="${item.id}">${item.code} - ${item.name}</option>`
        ).join('');
        
        $('#entradaItem, #saidaItem, #ajusteItem').html('<option value="">Selecione o item...</option>' + itemOptions);
    }
    
    // Inicializar seção de movimentações
    function initializeMovementsSection() {
        initializeMovementsTable();
        setupMovementFilters();
    }
    
    // Inicializar tabela de movimentações
    function initializeMovementsTable() {
        $('#movementsTable').DataTable({
            data: stockData.movements,
            columns: [
                { data: 'date' },
                { 
                    data: 'type',
                    render: function(data) {
                        const typeMap = {
                            'entrada': '<span class="badge bg-success">Entrada</span>',
                            'saida': '<span class="badge bg-danger">Saída</span>',
                            'ajuste': '<span class="badge bg-warning">Ajuste</span>'
                        };
                        return typeMap[data] || data;
                    }
                },
                { data: 'itemName' },
                { data: 'quantity' },
                { 
                    data: 'reason',
                    render: function(data) {
                        return capitalizeFirst(data);
                    }
                },
                { data: 'user' },
                { data: 'observations' },
                {
                    data: null,
                    render: function(data, type, row) {
                        return `
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-info" onclick="viewMovementDetails(${row.id})">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn btn-outline-danger" onclick="reverseMovement(${row.id})">
                                    <i class="fas fa-undo"></i>
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
            order: [[0, 'desc']]
        });
    }
    
    // Configurar filtros de movimentações
    function setupMovementFilters() {
        $('#applyMovementFilters').on('click', function() {
            filterMovementsTable();
        });
    }
    
    // Filtrar tabela de movimentações
    function filterMovementsTable() {
        const table = $('#movementsTable').DataTable();
        
        const type = $('#filterMovementType').val();
        const dateStart = $('#filterDateStart').val();
        const dateEnd = $('#filterDateEnd').val();
        const item = $('#filterMovementItem').val();
        const user = $('#filterUser').val();
        
        // Aplicar filtros (implementação simplificada)
        table.columns(1).search(type);
        table.columns(2).search(item);
        table.columns(5).search(user);
        
        table.draw();
    }
    
    // Inicializar seção de relatórios
    function initializeReportsSection() {
        setupReportCards();
    }
    
    // Configurar cards de relatórios
    function setupReportCards() {
        $('.report-card').on('click', function() {
            const reportType = $(this).data('report');
            generateReport(reportType);
        });
        
        $('#generateCustomReport').on('click', function() {
            showCustomReportModal();
        });
    }
    
    // Gerar relatório
    function generateReport(type) {
        const reportContent = $('#reportContent');
        
        switch(type) {
            case 'inventory':
                generateInventoryReport(reportContent);
                break;
            case 'movements':
                generateMovementsReport(reportContent);
                break;
            case 'low-stock':
                generateLowStockReport(reportContent);
                break;
            case 'valuation':
                generateValuationReport(reportContent);
                break;
        }
    }
    
    // Relatório de inventário
    function generateInventoryReport(container) {
        const totalItems = stockData.items.length;
        const totalValue = stockData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        
        const html = `
            <div class="row">
                <div class="col-md-6">
                    <h5>Resumo do Inventário</h5>
                    <table class="table table-sm">
                        <tr><td>Total de Itens:</td><td><strong>${totalItems}</strong></td></tr>
                        <tr><td>Valor Total:</td><td><strong>R$ ${totalValue.toFixed(2)}</strong></td></tr>
                        <tr><td>Itens com Estoque Baixo:</td><td><strong>${stockData.items.filter(i => i.status === 'baixo').length}</strong></td></tr>
                        <tr><td>Itens Esgotados:</td><td><strong>${stockData.items.filter(i => i.status === 'esgotado').length}</strong></td></tr>
                    </table>
                </div>
                <div class="col-md-6">
                    <h5>Por Categoria</h5>
                    <div id="inventoryChart" style="height: 200px;"></div>
                </div>
            </div>
        `;
        
        container.html(html);
    }
    
    // Relatório de estoque baixo
    function generateLowStockReport(container) {
        const lowStockItems = stockData.items.filter(item => 
            item.status === 'baixo' || item.status === 'esgotado'
        );
        
        let html = '<h5>Itens com Estoque Baixo</h5>';
        
        if (lowStockItems.length === 0) {
            html += '<p class="text-muted">Nenhum item com estoque baixo encontrado.</p>';
        } else {
            html += `
                <table class="table table-striped">
                    <thead>
                        <tr>
                            <th>Código</th>
                            <th>Nome</th>
                            <th>Quantidade Atual</th>
                            <th>Estoque Mínimo</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
            `;
            
            lowStockItems.forEach(item => {
                html += `
                    <tr>
                        <td>${item.code}</td>
                        <td>${item.name}</td>
                        <td>${item.quantity} ${item.unit}</td>
                        <td>${item.minStock} ${item.unit}</td>
                        <td><span class="status-badge ${item.status === 'esgotado' ? 'status-inactive' : 'status-pending'}">${item.status === 'esgotado' ? 'Esgotado' : 'Estoque Baixo'}</span></td>
                    </tr>
                `;
            });
            
            html += '</tbody></table>';
        }
        
        container.html(html);
    }
    
    // Inicializar seção de pedidos
    function initializeOrdersSection() {
        initializeOrdersTable();
        updateOrdersStats();
    }
    
    // Inicializar tabela de pedidos
    function initializeOrdersTable() {
        $('#ordersTable').DataTable({
            data: stockData.orders,
            columns: [
                { data: 'id' },
                { data: 'client' },
                { 
                    data: 'items',
                    render: function(data) {
                        return data.map(item => `${item.itemName} (${item.quantity})`).join('<br>');
                    }
                },
                { 
                    data: 'stockStatus',
                    render: function(data) {
                        const statusMap = {
                            'disponivel': '<span class="status-badge status-active">Disponível</span>',
                            'parcial': '<span class="status-badge status-pending">Parcial</span>',
                            'sem_estoque': '<span class="status-badge status-inactive">Sem Estoque</span>'
                        };
                        return statusMap[data] || data;
                    }
                },
                { data: 'orderDate' },
                { 
                    data: 'autoDeduct',
                    render: function(data) {
                        return data ? '<i class="fas fa-check text-success"></i>' : '<i class="fas fa-times text-danger"></i>';
                    }
                },
                {
                    data: null,
                    render: function(data, type, row) {
                        return `
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-primary" onclick="processOrder('${row.id}')">
                                    <i class="fas fa-play"></i>
                                </button>
                                <button class="btn btn-outline-info" onclick="viewOrderDetails('${row.id}')">
                                    <i class="fas fa-eye"></i>
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
            }
        });
    }
    
    // Atualizar estatísticas de pedidos
    function updateOrdersStats() {
        const processedOrders = stockData.orders.filter(order => order.status === 'processado').length;
        const pendingOrders = stockData.orders.filter(order => order.status === 'pendente').length;
        const noStockOrders = stockData.orders.filter(order => order.stockStatus === 'sem_estoque').length;
        
        $('#processed-orders').text(processedOrders);
        $('#pending-orders').text(pendingOrders);
        $('#no-stock-orders').text(noStockOrders);
    }
    
    // Inicializar seção de logs
    function initializeLogsSection() {
        initializeLogsTable();
        setupLogFilters();
    }
    
    // Inicializar tabela de logs
    function initializeLogsTable() {
        $('#logsTable').DataTable({
            data: stockData.logs,
            columns: [
                { data: 'date' },
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
                { 
                    data: 'action',
                    render: function(data) {
                        return capitalizeFirst(data);
                    }
                },
                { data: 'module' },
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
    
    // Configurar filtros de logs
    function setupLogFilters() {
        $('#applyLogFilters').on('click', function() {
            filterLogsTable();
        });
    }
    
    // Filtrar tabela de logs
    function filterLogsTable() {
        const table = $('#logsTable').DataTable();
        
        const level = $('#filterLogLevel').val();
        const action = $('#filterLogAction').val();
        const user = $('#filterLogUser').val();
        
        table.columns(1).search(level);
        table.columns(3).search(action);
        table.columns(2).search(user);
        
        table.draw();
    }
    
    // Configurar modais
    function setupModals() {
        // Modal de item
        $('#saveItemBtn').on('click', saveItem);
        
        // Modal de entrada
        $('#saveEntradaBtn').on('click', saveEntrada);
        
        // Modal de saída
        $('#saveSaidaBtn').on('click', saveSaida);
        $('#saidaItem').on('change', updateAvailableQuantity);
        
        // Modal de ajuste
        $('#saveAjusteBtn').on('click', saveAjuste);
        $('#ajusteItem').on('change', updateCurrentQuantity);
    }
    
    // Salvar item
    function saveItem() {
        const itemData = {
            code: $('#itemCode').val(),
            name: $('#itemName').val(),
            category: $('#itemCategory').val(),
            unit: $('#itemUnit').val(),
            quantity: parseFloat($('#itemQuantity').val()) || 0,
            minStock: parseFloat($('#itemMinStock').val()) || 0,
            price: parseFloat($('#itemPrice').val()) || 0,
            shelf: $('#itemShelf').val(),
            position: $('#itemPosition').val(),
            description: $('#itemDescription').val()
        };
        
        // Validação básica
        if (!itemData.code || !itemData.name || !itemData.category || !itemData.unit || !itemData.shelf) {
            showAlert('Por favor, preencha todos os campos obrigatórios.', 'warning');
            return;
        }
        
        // Verificar se código já existe
        if (stockData.items.find(item => item.code === itemData.code)) {
            showAlert('Código do item já existe.', 'error');
            return;
        }
        
        // Adicionar item
        const newItem = {
            id: stockData.items.length + 1,
            ...itemData,
            status: itemData.quantity > itemData.minStock ? 'disponivel' : (itemData.quantity === 0 ? 'esgotado' : 'baixo'),
            lastMovement: new Date().toISOString().slice(0, 19).replace('T', ' ')
        };
        
        stockData.items.push(newItem);
        
        // Atualizar tabela
        $('#itemsTable').DataTable().row.add(newItem).draw();
        
        // Registrar log
        addLog('info', 'cadastro', `Novo item cadastrado: ${itemData.name}`);
        
        // Fechar modal e limpar formulário
        $('#itemModal').modal('hide');
        $('#itemForm')[0].reset();
        
        showAlert('Item cadastrado com sucesso!', 'success');
        
        // Atualizar selects
        loadItemsForSelects();
    }
    
    // Salvar entrada
    function saveEntrada() {
        const entradaData = {
            itemId: parseInt($('#entradaItem').val()),
            quantity: parseFloat($('#entradaQuantity').val()),
            reason: $('#entradaMotivo').val(),
            observations: $('#entradaObservacoes').val()
        };
        
        if (!entradaData.itemId || !entradaData.quantity || !entradaData.reason) {
            showAlert('Por favor, preencha todos os campos obrigatórios.', 'warning');
            return;
        }
        
        // Encontrar item
        const item = stockData.items.find(i => i.id === entradaData.itemId);
        if (!item) {
            showAlert('Item não encontrado.', 'error');
            return;
        }
        
        // Atualizar quantidade
        item.quantity += entradaData.quantity;
        item.lastMovement = new Date().toISOString().slice(0, 19).replace('T', ' ');
        
        // Atualizar status
        if (item.quantity > item.minStock) {
            item.status = 'disponivel';
        } else if (item.quantity === 0) {
            item.status = 'esgotado';
        } else {
            item.status = 'baixo';
        }
        
        // Registrar movimentação
        const movement = {
            id: stockData.movements.length + 1,
            date: item.lastMovement,
            type: 'entrada',
            itemId: item.id,
            itemName: item.name,
            quantity: entradaData.quantity,
            reason: entradaData.reason,
            user: 'Usuário Atual',
            observations: entradaData.observations,
            ip: '192.168.1.100'
        };
        
        stockData.movements.unshift(movement);
        
        // Registrar log
        addLog('success', 'movimentacao', `Entrada registrada: ${entradaData.quantity} ${item.unit} de ${item.name}`);
        
        // Atualizar tabelas
        $('#itemsTable').DataTable().clear().rows.add(stockData.items).draw();
        $('#movementsTable').DataTable().clear().rows.add(stockData.movements).draw();
        
        // Fechar modal
        $('#entradaModal').modal('hide');
        $('#entradaForm')[0].reset();
        
        showAlert('Entrada registrada com sucesso!', 'success');
        
        // Atualizar dashboard
        updateStatsCards();
    }
    
    // Salvar saída
    function saveSaida() {
        const saidaData = {
            itemId: parseInt($('#saidaItem').val()),
            quantity: parseFloat($('#saidaQuantity').val()),
            reason: $('#saidaMotivo').val(),
            observations: $('#saidaObservacoes').val()
        };
        
        if (!saidaData.itemId || !saidaData.quantity || !saidaData.reason) {
            showAlert('Por favor, preencha todos os campos obrigatórios.', 'warning');
            return;
        }
        
        // Encontrar item
        const item = stockData.items.find(i => i.id === saidaData.itemId);
        if (!item) {
            showAlert('Item não encontrado.', 'error');
            return;
        }
        
        // Verificar quantidade disponível
        if (saidaData.quantity > item.quantity) {
            showAlert('Quantidade insuficiente em estoque.', 'error');
            return;
        }
        
        // Atualizar quantidade
        item.quantity -= saidaData.quantity;
        item.lastMovement = new Date().toISOString().slice(0, 19).replace('T', ' ');
        
        // Atualizar status
        if (item.quantity === 0) {
            item.status = 'esgotado';
        } else if (item.quantity <= item.minStock) {
            item.status = 'baixo';
        } else {
            item.status = 'disponivel';
        }
        
        // Registrar movimentação
        const movement = {
            id: stockData.movements.length + 1,
            date: item.lastMovement,
            type: 'saida',
            itemId: item.id,
            itemName: item.name,
            quantity: saidaData.quantity,
            reason: saidaData.reason,
            user: 'Usuário Atual',
            observations: saidaData.observations,
            ip: '192.168.1.100'
        };
        
        stockData.movements.unshift(movement);
        
        // Registrar log
        addLog('success', 'movimentacao', `Saída registrada: ${saidaData.quantity} ${item.unit} de ${item.name}`);
        
        // Atualizar tabelas
        $('#itemsTable').DataTable().clear().rows.add(stockData.items).draw();
        $('#movementsTable').DataTable().clear().rows.add(stockData.movements).draw();
        
        // Fechar modal
        $('#saidaModal').modal('hide');
        $('#saidaForm')[0].reset();
        
        showAlert('Saída registrada com sucesso!', 'success');
        
        // Atualizar dashboard
        updateStatsCards();
    }
    
    // Salvar ajuste
    function saveAjuste() {
        const ajusteData = {
            itemId: parseInt($('#ajusteItem').val()),
            newQuantity: parseFloat($('#newQuantity').val()),
            reason: $('#ajusteMotivo').val(),
            observations: $('#ajusteObservacoes').val()
        };
        
        if (!ajusteData.itemId || ajusteData.newQuantity === undefined || !ajusteData.reason || !ajusteData.observations) {
            showAlert('Por favor, preencha todos os campos obrigatórios.', 'warning');
            return;
        }
        
        // Encontrar item
        const item = stockData.items.find(i => i.id === ajusteData.itemId);
        if (!item) {
            showAlert('Item não encontrado.', 'error');
            return;
        }
        
        const oldQuantity = item.quantity;
        const difference = ajusteData.newQuantity - oldQuantity;
        
        // Atualizar quantidade
        item.quantity = ajusteData.newQuantity;
        item.lastMovement = new Date().toISOString().slice(0, 19).replace('T', ' ');
        
        // Atualizar status
        if (item.quantity === 0) {
            item.status = 'esgotado';
        } else if (item.quantity <= item.minStock) {
            item.status = 'baixo';
        } else {
            item.status = 'disponivel';
        }
        
        // Registrar movimentação
        const movement = {
            id: stockData.movements.length + 1,
            date: item.lastMovement,
            type: 'ajuste',
            itemId: item.id,
            itemName: item.name,
            quantity: difference,
            reason: ajusteData.reason,
            user: 'Usuário Atual',
            observations: ajusteData.observations,
            ip: '192.168.1.100'
        };
        
        stockData.movements.unshift(movement);
        
        // Registrar log
        addLog('warning', 'ajuste', `Ajuste de estoque: ${item.name} - ${oldQuantity} para ${ajusteData.newQuantity} ${item.unit}`);
        
        // Atualizar tabelas
        $('#itemsTable').DataTable().clear().rows.add(stockData.items).draw();
        $('#movementsTable').DataTable().clear().rows.add(stockData.movements).draw();
        
        // Fechar modal
        $('#ajusteModal').modal('hide');
        $('#ajusteForm')[0].reset();
        
        showAlert('Ajuste registrado com sucesso!', 'success');
        
        // Atualizar dashboard
        updateStatsCards();
    }
    
    // Atualizar quantidade disponível
    function updateAvailableQuantity() {
        const itemId = parseInt($('#saidaItem').val());
        const item = stockData.items.find(i => i.id === itemId);
        
        if (item) {
            $('#availableQuantity').text(`${item.quantity} ${item.unit}`);
        } else {
            $('#availableQuantity').text('0');
        }
    }
    
    // Atualizar quantidade atual
    function updateCurrentQuantity() {
        const itemId = parseInt($('#ajusteItem').val());
        const item = stockData.items.find(i => i.id === itemId);
        
        if (item) {
            $('#currentQuantity').val(item.quantity);
        } else {
            $('#currentQuantity').val('');
        }
    }
    
    // Configurar event listeners
    function setupEventListeners() {
        // Filtros de período
        setupPeriodFilters();
        
        // Sincronização de pedidos
        $('#syncOrdersBtn').on('click', syncOrders);
        
        // Limpar logs
        $('#clearLogsBtn').on('click', clearLogs);
        
        // Exportar logs
        $('#exportLogsBtn').on('click', exportLogs);
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
        // Simular atualização baseada no período
        console.log(`Atualizando dashboard para período: ${period}`);
        updateStatsCards();
        loadStockActivity();
    }
    
    // Sincronizar pedidos
    function syncOrders() {
        showAlert('Sincronizando pedidos...', 'info');
        
        // Simular sincronização
        setTimeout(() => {
            showAlert('Pedidos sincronizados com sucesso!', 'success');
            updateOrdersStats();
        }, 2000);
    }
    
    // Limpar logs
    function clearLogs() {
        if (confirm('Tem certeza que deseja limpar todos os logs? Esta ação não pode ser desfeita.')) {
            stockData.logs = [];
            $('#logsTable').DataTable().clear().draw();
            showAlert('Logs limpos com sucesso!', 'success');
        }
    }
    
    // Exportar logs
    function exportLogs() {
        const csvContent = "data:text/csv;charset=utf-8," 
            + "Data/Hora,Nível,Usuário,Ação,Módulo,Descrição,IP\n"
            + stockData.logs.map(log => 
                `"${log.date}","${log.level}","${log.user}","${log.action}","${log.module}","${log.description}","${log.ip}"`
            ).join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `logs_estoque_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showAlert('Logs exportados com sucesso!', 'success');
    }
    
    // Carregar dados iniciais
    function loadInitialData() {
        // Simular carregamento de dados
        console.log('Dados iniciais carregados');
    }
    
    // Carregar dados específicos da seção
    function loadSectionData(section) {
        switch(section) {
            case 'dashboard':
                updateStatsCards();
                loadStockActivity();
                break;
            case 'itens':
                // Dados já carregados na inicialização
                break;
            case 'movimentacoes':
                // Dados já carregados na inicialização
                break;
            case 'relatorios':
                // Limpar área de relatórios
                $('#reportContent').html(`
                    <div class="text-center text-muted">
                        <i class="fas fa-chart-bar fa-3x mb-3"></i>
                        <p>Selecione um relatório acima para visualizar os dados</p>
                    </div>
                `);
                break;
            case 'pedidos':
                updateOrdersStats();
                break;
            case 'logs':
                // Dados já carregados na inicialização
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
    
    function isToday(dateString) {
        const today = new Date();
        const date = new Date(dateString);
        return date.toDateString() === today.toDateString();
    }
    
    function isSameDay(dateString1, dateString2) {
        const date1 = new Date(dateString1);
        const date2 = new Date(dateString2);
        return date1.toDateString() === date2.toDateString();
    }
    
    function getLast7Days() {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            days.push(date);
        }
        return days;
    }
    
    function formatDateShort(date) {
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
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
    
    function addLog(level, action, description) {
        const log = {
            id: stockData.logs.length + 1,
            date: new Date().toISOString().slice(0, 19).replace('T', ' '),
            level: level,
            user: 'Usuário Atual',
            action: action,
            module: 'Estoque',
            description: description,
            ip: '192.168.1.100'
        };
        
        stockData.logs.unshift(log);
        
        // Atualizar tabela de logs se estiver visível
        if ($('#logs-section').hasClass('active')) {
            $('#logsTable').DataTable().clear().rows.add(stockData.logs).draw();
        }
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
    
    // Funções globais para os botões das tabelas
    window.editItem = function(id) {
        const item = stockData.items.find(i => i.id === id);
        if (item) {
            // Preencher modal com dados do item
            $('#itemCode').val(item.code);
            $('#itemName').val(item.name);
            $('#itemCategory').val(item.category);
            $('#itemUnit').val(item.unit);
            $('#itemQuantity').val(item.quantity);
            $('#itemMinStock').val(item.minStock);
            $('#itemPrice').val(item.price);
            $('#itemShelf').val(item.shelf);
            $('#itemPosition').val(item.position);
            $('#itemDescription').val(item.description);
            
            $('#itemModalTitle').text('Editar Item');
            $('#itemModal').modal('show');
        }
    };
    
    window.deleteItem = function(id) {
        if (confirm('Tem certeza que deseja excluir este item?')) {
            const index = stockData.items.findIndex(i => i.id === id);
            if (index !== -1) {
                const item = stockData.items[index];
                stockData.items.splice(index, 1);
                $('#itemsTable').DataTable().clear().rows.add(stockData.items).draw();
                addLog('warning', 'exclusao', `Item excluído: ${item.name}`);
                showAlert('Item excluído com sucesso!', 'success');
                loadItemsForSelects();
            }
        }
    };
    
    window.viewItemHistory = function(id) {
        const item = stockData.items.find(i => i.id === id);
        const movements = stockData.movements.filter(m => m.itemId === id);
        
        if (item) {
            showAlert(`Histórico do item ${item.name}: ${movements.length} movimentações`, 'info');
        }
    };
    
    window.viewMovementDetails = function(id) {
        const movement = stockData.movements.find(m => m.id === id);
        if (movement) {
            showAlert(`Detalhes: ${movement.type} de ${movement.quantity} ${movement.itemName}`, 'info');
        }
    };
    
    window.reverseMovement = function(id) {
        if (confirm('Tem certeza que deseja estornar esta movimentação?')) {
            showAlert('Funcionalidade de estorno em desenvolvimento', 'warning');
        }
    };
    
    window.processOrder = function(id) {
        const order = stockData.orders.find(o => o.id === id);
        if (order) {
            if (order.stockStatus === 'disponivel') {
                order.status = 'processado';
                $('#ordersTable').DataTable().clear().rows.add(stockData.orders).draw();
                addLog('success', 'pedido', `Pedido processado: ${id}`);
                showAlert('Pedido processado com sucesso!', 'success');
                updateOrdersStats();
            } else {
                showAlert('Não é possível processar pedido sem estoque disponível', 'warning');
            }
        }
    };
    
    window.viewOrderDetails = function(id) {
        const order = stockData.orders.find(o => o.id === id);
        if (order) {
            const itemsList = order.items.map(item => `${item.itemName}: ${item.quantity}`).join('\n');
            showAlert(`Pedido ${id}\nCliente: ${order.client}\nItens:\n${itemsList}`, 'info');
        }
    };
    
});

