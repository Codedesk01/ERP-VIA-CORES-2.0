// Admin Panel JavaScript
$(document).ready(function() {
    
    // Initialize the application
    initializeApp();
    
    function initializeApp() {
        setupNavigation();
        setupSidebar();
        initializeDashboard();
        initializeUsersTable();
        initializeModulesSection();
        initializeLogsTable();
        setupModals();
        setupEventListeners();
    }
    
    // Navigation Setup
    function setupNavigation() {
        $('.sidebar-nav .nav-link').on('click', function(e) {
            e.preventDefault();
            
            const section = $(this).data('section');
            
            // Update active nav item
            $('.sidebar-nav .nav-link').removeClass('active');
            $(this).addClass('active');
            
            // Show corresponding section
            $('.content-section').removeClass('active');
            $(`#${section}-section`).addClass('active');
            
            // Load section-specific data
            loadSectionData(section);
        });
    }
    
    // Sidebar Toggle
    function setupSidebar() {
        $('#sidebarToggle').on('click', function() {
            $('#sidebar').toggleClass('collapsed');
        });
        
        // Mobile sidebar
        if (window.innerWidth <= 768) {
            $('#sidebarToggle').on('click', function() {
                $('#sidebar').toggleClass('show');
            });
        }
    }
    
    // Dashboard Initialization
    function initializeDashboard() {
        createProductionChart();
        createModulesChart();
        updateStatsCards();
        loadRecentActivity();
        setupPeriodFilters();
    }
    
    // Production Chart
    function createProductionChart() {
        const ctx = document.getElementById('productionChart').getContext('2d');
        
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(79, 70, 229, 0.8)');
        gradient.addColorStop(1, 'rgba(79, 70, 229, 0.1)');
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul'],
                datasets: [{
                    label: 'João Silva',
                    data: [65, 78, 90, 81, 95, 88, 92],
                    borderColor: '#4f46e5',
                    backgroundColor: gradient,
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#4f46e5',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }, {
                    label: 'Maria Santos',
                    data: [45, 62, 75, 68, 82, 79, 85],
                    borderColor: '#10b981',
                    backgroundColor: 'rgba(16, 185, 129, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }, {
                    label: 'Carlos Oliveira',
                    data: [35, 48, 65, 59, 72, 69, 78],
                    borderColor: '#f59e0b',
                    backgroundColor: 'rgba(245, 158, 11, 0.1)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.4,
                    pointBackgroundColor: '#f59e0b',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            usePointStyle: true,
                            padding: 20,
                            font: {
                                size: 12,
                                weight: '500'
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                elements: {
                    point: {
                        hoverRadius: 8
                    }
                }
            }
        });
    }
    
    // Modules Distribution Chart
    function createModulesChart() {
        const ctx = document.getElementById('modulesChart').getContext('2d');
        
        new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Produção', 'Estoque', 'Relatórios', 'Movimentação'],
                datasets: [{
                    data: [35, 25, 20, 20],
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
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true,
                            font: {
                                size: 12,
                                weight: '500'
                            }
                        }
                    }
                },
                cutout: '60%'
            }
        });
    }
    
    // Update Stats Cards with Animation
    function updateStatsCards() {
        animateCounter('#active-users', 1247);
        animateCounter('#completed-tasks', 8542);
        
        // Update time display
        $('#avg-time').text('2h 34m');
        $('#productivity').text('94.2%');
    }
    
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
            element.text(Math.floor(current).toLocaleString());
        }, 16);
    }
    
    // Load Recent Activity
    function loadRecentActivity() {
        const activities = [
            {
                icon: 'fas fa-check',
                iconClass: 'bg-success',
                title: 'João Silva completou 15 itens de costura',
                time: 'há 5 minutos'
            },
            {
                icon: 'fas fa-user-plus',
                iconClass: 'bg-primary',
                title: 'Novo usuário Maria Santos foi adicionado',
                time: 'há 12 minutos'
            },
            {
                icon: 'fas fa-exclamation-triangle',
                iconClass: 'bg-warning',
                title: 'Alerta: Estoque baixo no módulo de produção',
                time: 'há 25 minutos'
            },
            {
                icon: 'fas fa-edit',
                iconClass: 'bg-info',
                title: 'Configurações do módulo de relatórios atualizadas',
                time: 'há 1 hora'
            },
            {
                icon: 'fas fa-sign-out-alt',
                iconClass: 'bg-secondary',
                title: 'Carlos Oliveira fez logout do sistema',
                time: 'há 2 horas'
            }
        ];
        
        const timeline = $('.activity-timeline');
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
    
    // Period Filters
    function setupPeriodFilters() {
        $('[data-period]').on('click', function() {
            $('[data-period]').removeClass('active');
            $(this).addClass('active');
            
            const period = $(this).data('period');
            updateDashboardData(period);
        });
    }
    
    function updateDashboardData(period) {
        // Simulate data update based on period
        console.log(`Updating dashboard data for period: ${period}`);
        // Here you would typically make an API call to get updated data
    }
    
    // Users Table Initialization
    function initializeUsersTable() {
        const usersData = [
            {
                id: 1,
                name: 'João Silva',
                email: 'joao.silva@empresa.com',
                role: 'Operador',
                modules: ['Produção', 'Relatórios'],
                status: 'Ativo',
                lastAccess: '2024-01-15 14:30'
            },
            {
                id: 2,
                name: 'Maria Santos',
                email: 'maria.santos@empresa.com',
                role: 'Gerente',
                modules: ['Produção', 'Estoque', 'Relatórios', 'Movimentação'],
                status: 'Ativo',
                lastAccess: '2024-01-15 13:45'
            },
            {
                id: 3,
                name: 'Carlos Oliveira',
                email: 'carlos.oliveira@empresa.com',
                role: 'Operador',
                modules: ['Estoque'],
                status: 'Inativo',
                lastAccess: '2024-01-14 16:20'
            },
            {
                id: 4,
                name: 'Ana Costa',
                email: 'ana.costa@empresa.com',
                role: 'Visualizador',
                modules: ['Relatórios'],
                status: 'Ativo',
                lastAccess: '2024-01-15 12:15'
            },
            {
                id: 5,
                name: 'Pedro Almeida',
                email: 'pedro.almeida@empresa.com',
                role: 'Administrador',
                modules: ['Produção', 'Estoque', 'Relatórios', 'Movimentação'],
                status: 'Ativo',
                lastAccess: '2024-01-15 15:00'
            }
        ];
        
        $('#usersTable').DataTable({
            data: usersData,
            columns: [
                { data: 'id' },
                { data: 'name' },
                { data: 'email' },
                { data: 'role' },
                { 
                    data: 'modules',
                    render: function(data) {
                        return data.map(module => `<span class="badge bg-primary me-1">${module}</span>`).join('');
                    }
                },
                { 
                    data: 'status',
                    render: function(data) {
                        const statusClass = data === 'Ativo' ? 'status-active' : 'status-inactive';
                        return `<span class="status-badge ${statusClass}">${data}</span>`;
                    }
                },
                { data: 'lastAccess' },
                {
                    data: null,
                    render: function(data, type, row) {
                        return `
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-primary" onclick="editUser(${row.id})">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-outline-danger" onclick="deleteUser(${row.id})">
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
            dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>rtip'
        });
    }
    
    // Modules Section
    function initializeModulesSection() {
        loadAvailableModules();
        loadPermissionsMatrix();
    }
    
    function loadAvailableModules() {
        const modules = [
            {
                id: 'production',
                name: 'Produção',
                description: 'Controle de produção e costura',
                icon: 'fas fa-industry',
                active: true
            },
            {
                id: 'inventory',
                name: 'Estoque',
                description: 'Gestão de estoque e materiais',
                icon: 'fas fa-boxes',
                active: true
            },
            {
                id: 'reports',
                name: 'Relatórios',
                description: 'Relatórios e análises',
                icon: 'fas fa-chart-bar',
                active: true
            },
            {
                id: 'movement',
                name: 'Movimentação',
                description: 'Controle de movimentação',
                icon: 'fas fa-truck',
                active: false
            }
        ];
        
        const modulesList = $('.module-list');
        modulesList.empty();
        
        modules.forEach(module => {
            const item = $(`
                <div class="module-item ${module.active ? 'active' : ''}" data-module="${module.id}">
                    <div class="d-flex align-items-center">
                        <div class="me-3">
                            <i class="${module.icon} fa-2x text-primary"></i>
                        </div>
                        <div class="flex-grow-1">
                            <h6 class="mb-1">${module.name}</h6>
                            <p class="text-muted mb-0 small">${module.description}</p>
                        </div>
                        <div class="form-check form-switch">
                            <input class="form-check-input" type="checkbox" ${module.active ? 'checked' : ''}>
                        </div>
                    </div>
                </div>
            `);
            modulesList.append(item);
        });
    }
    
    function loadPermissionsMatrix() {
        const permissions = [
            { user: 'João Silva', production: true, inventory: false, reports: true, movement: false },
            { user: 'Maria Santos', production: true, inventory: true, reports: true, movement: true },
            { user: 'Carlos Oliveira', production: false, inventory: true, reports: false, movement: false },
            { user: 'Ana Costa', production: false, inventory: false, reports: true, movement: false },
            { user: 'Pedro Almeida', production: true, inventory: true, reports: true, movement: true }
        ];
        
        const matrix = $('.permissions-matrix');
        matrix.empty();
        
        permissions.forEach(perm => {
            const row = $(`
                <div class="permission-row">
                    <div class="fw-medium">${perm.user}</div>
                    <div class="d-flex gap-2">
                        <span class="badge ${perm.production ? 'bg-success' : 'bg-secondary'}">Produção</span>
                        <span class="badge ${perm.inventory ? 'bg-success' : 'bg-secondary'}">Estoque</span>
                        <span class="badge ${perm.reports ? 'bg-success' : 'bg-secondary'}">Relatórios</span>
                        <span class="badge ${perm.movement ? 'bg-success' : 'bg-secondary'}">Movimentação</span>
                    </div>
                </div>
            `);
            matrix.append(row);
        });
    }
    
    // Logs Table
    function initializeLogsTable() {
        const logsData = [
            {
                timestamp: '2024-01-15 15:30:25',
                user: 'João Silva',
                action: 'Login',
                module: 'Sistema',
                details: 'Login realizado com sucesso',
                ip: '192.168.1.100',
                status: 'Sucesso'
            },
            {
                timestamp: '2024-01-15 15:25:10',
                user: 'Maria Santos',
                action: 'Criar Item',
                module: 'Produção',
                details: 'Criado item de costura #12345',
                ip: '192.168.1.101',
                status: 'Sucesso'
            },
            {
                timestamp: '2024-01-15 15:20:45',
                user: 'Carlos Oliveira',
                action: 'Visualizar Relatório',
                module: 'Relatórios',
                details: 'Acesso negado - sem permissão',
                ip: '192.168.1.102',
                status: 'Erro'
            },
            {
                timestamp: '2024-01-15 15:15:30',
                user: 'Ana Costa',
                action: 'Exportar Dados',
                module: 'Relatórios',
                details: 'Exportação de relatório mensal',
                ip: '192.168.1.103',
                status: 'Sucesso'
            },
            {
                timestamp: '2024-01-15 15:10:15',
                user: 'Pedro Almeida',
                action: 'Atualizar Usuário',
                module: 'Usuários',
                details: 'Permissões do usuário João Silva atualizadas',
                ip: '192.168.1.104',
                status: 'Sucesso'
            }
        ];
        
        $('#logsTable').DataTable({
            data: logsData,
            columns: [
                { data: 'timestamp' },
                { data: 'user' },
                { data: 'action' },
                { data: 'module' },
                { data: 'details' },
                { data: 'ip' },
                { 
                    data: 'status',
                    render: function(data) {
                        const statusClass = data === 'Sucesso' ? 'status-active' : 'status-inactive';
                        return `<span class="status-badge ${statusClass}">${data}</span>`;
                    }
                }
            ],
            order: [[0, 'desc']],
            responsive: true,
            pageLength: 15,
            language: {
                url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/pt-BR.json'
            },
            dom: '<"row"<"col-sm-12 col-md-6"l><"col-sm-12 col-md-6"f>>rtip'
        });
    }
    
    // Modal Setup
    function setupModals() {
        // User Modal
        $('#saveUser').on('click', function() {
            const formData = new FormData($('#userForm')[0]);
            const userData = Object.fromEntries(formData);
            
            // Get selected modules
            const modules = [];
            $('input[name="modules"]:checked').each(function() {
                modules.push($(this).val());
            });
            userData.modules = modules;
            
            console.log('Saving user:', userData);
            
            // Here you would make an API call to save the user
            $('#userModal').modal('hide');
            
            // Show success message
            showNotification('Usuário salvo com sucesso!', 'success');
        });
    }
    
    // Event Listeners
    function setupEventListeners() {
        // Log filter
        $('#logFilter').on('change', function() {
            const filter = $(this).val();
            console.log('Filtering logs by:', filter);
            // Here you would filter the logs table
        });
        
        // Export logs
        $('#exportLogs').on('click', function() {
            console.log('Exporting logs...');
            showNotification('Logs exportados com sucesso!', 'success');
        });
        
        // Module toggles
        $(document).on('change', '.module-item .form-check-input', function() {
            const moduleId = $(this).closest('.module-item').data('module');
            const isActive = $(this).is(':checked');
            
            console.log(`Module ${moduleId} ${isActive ? 'activated' : 'deactivated'}`);
            
            $(this).closest('.module-item').toggleClass('active', isActive);
        });
    }
    
    // Load section-specific data
    function loadSectionData(section) {
        switch(section) {
            case 'dashboard':
                updateStatsCards();
                break;
            case 'users':
                // Refresh users table if needed
                break;
            case 'modules':
                loadPermissionsMatrix();
                break;
            case 'logs':
                // Refresh logs if needed
                break;
        }
    }
    
    // Utility Functions
    function showNotification(message, type = 'info') {
        const alertClass = `alert-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'}`;
        const notification = $(`
            <div class="alert ${alertClass} alert-dismissible fade show position-fixed" 
                 style="top: 20px; right: 20px; z-index: 9999; min-width: 300px;">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `);
        
        $('body').append(notification);
        
        setTimeout(() => {
            notification.alert('close');
        }, 5000);
    }
    
    // Global Functions for button actions
    window.editUser = function(userId) {
        console.log('Editing user:', userId);
        $('#userModal').modal('show');
        // Here you would load user data into the form
    };
    
    window.deleteUser = function(userId) {
        if (confirm('Tem certeza que deseja excluir este usuário?')) {
            console.log('Deleting user:', userId);
            showNotification('Usuário excluído com sucesso!', 'success');
            // Here you would make an API call to delete the user
        }
    };
    
    // Real-time updates simulation
    setInterval(() => {
        // Simulate real-time data updates
        const randomUser = Math.floor(Math.random() * 1000) + 1000;
        const randomTasks = Math.floor(Math.random() * 100) + 8500;
        
        $('#active-users').text(randomUser.toLocaleString());
        $('#completed-tasks').text(randomTasks.toLocaleString());
    }, 30000); // Update every 30 seconds
    
});

// Additional utility functions and animations
function initializeAnimations() {
    // Add scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate__animated', 'animate__fadeInUp');
            }
        });
    }, observerOptions);
    
    // Observe all cards
    document.querySelectorAll('.card').forEach(card => {
        observer.observe(card);
    });
}

