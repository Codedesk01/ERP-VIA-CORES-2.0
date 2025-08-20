$(document).ready(function() {

    // --- DADOS SIMULADOS ---
    // Em um ambiente real, estes dados viriam de um backend/API.
    const mockData = {
        pedidos: [
            { id: 1, sku: 'PCRV029', produto: 'Camiseta Personalizada Vermelha', quantidade: 2, dataEnvio: '2025-08-25', tipoEnvio: 'correios', etapa: 'fila', usuarioId: null, arteAprovada: true, estoqueOk: true },
            { id: 2, sku: 'PCAZ031', produto: 'Camiseta Personalizada Azul', quantidade: 1, dataEnvio: '2025-08-22', tipoEnvio: 'motoboy', etapa: 'fila', usuarioId: null, arteAprovada: true, estoqueOk: false },
            { id: 3, sku: 'PCPR033', produto: 'Camiseta Personalizada Preta', quantidade: 3, dataEnvio: '2025-08-26', tipoEnvio: 'correios', etapa: 'producao', usuarioId: 1, arteAprovada: true, estoqueOk: true },
            { id: 4, sku: 'PCBR035', produto: 'Camiseta Personalizada Branca', quantidade: 1, dataEnvio: '2025-08-24', tipoEnvio: 'correios', etapa: 'costura', usuarioId: 2, arteAprovada: true, estoqueOk: true },
            { id: 5, sku: 'PCVD037', produto: 'Camiseta Personalizada Verde', quantidade: 2, dataEnvio: '2025-08-23', tipoEnvio: 'motoboy', etapa: 'expedicao', usuarioId: 3, arteAprovada: true, estoqueOk: true },
            { id: 6, sku: 'PCRS039', produto: 'Camiseta Personalizada Rosa', quantidade: 1, dataEnvio: '2025-08-21', tipoEnvio: 'correios', etapa: 'concluido', usuarioId: 1, arteAprovada: true, estoqueOk: true },
        ],
        usuarios: [
            { id: 1, nome: 'João Silva', avatar: 'https://via.placeholder.com/60/3b82f6/ffffff?text=JS', permissoes: ['producao', 'costura', 'concluido'] },
            { id: 2, nome: 'Maria Santos', avatar: 'https://via.placeholder.com/60/f97316/ffffff?text=MS', permissoes: ['costura', 'expedicao'] },
            { id: 3, nome: 'Carlos Oliveira', avatar: 'https://via.placeholder.com/60/8b5cf6/ffffff?text=CO', permissoes: ['expedicao', 'concluido'] },
        ],
        historico: [
            { data: '2025-08-20T10:00:00Z', pedidoId: 6, sku: 'PCRS039', etapa: 'Concluído', status: 'Finalizado', usuarioId: 1, detalhes: 'Pedido finalizado e embalado.' },
            { data: '2025-08-19T15:30:00Z', pedidoId: 5, sku: 'PCVD037', etapa: 'Expedição', status: 'Aguardando Coleta', usuarioId: 3, detalhes: 'Aguardando motoboy.' },
            { data: '2025-08-19T11:00:00Z', pedidoId: 4, sku: 'PCBR035', etapa: 'Costura', status: 'Em andamento', usuarioId: 2, detalhes: 'Iniciou a costura.' },
        ],
        relatorios: [
            { data: '2025-08-18T14:30:00Z', arte: 'logo_viacores.pdf', pedido: 'PED12346', usuario: 'Designer2', impressora: 'Canon G3110 #02', status: 'Impressa' },
            { data: '2025-08-19T10:00:00Z', arte: 'promo_natal.png', pedido: 'PED12345', usuario: 'Designer1', impressora: 'Epson L3150 #01', status: 'Aprovada' },
        ],
        logs: [
            { data: '2025-08-20T10:00:00Z', usuario: 'João Silva', acao: 'Move Card', detalhes: 'Moveu pedido #6 para Concluído', ip: '192.168.1.10' },
            { data: '2025-08-19T15:30:00Z', usuario: 'Admin', acao: 'Edita Permissão', detalhes: 'Alterou permissões de Maria Santos', ip: '192.168.1.1' },
        ],
        etapas: [
            { id: 'fila', nome: 'Fila de Pedidos' },
            { id: 'producao', nome: 'Em Produção' },
            { id: 'costura', nome: 'Costura' },
            { id: 'expedicao', nome: 'Expedição' },
            { id: 'concluido', nome: 'Concluído' },
        ]
    };

    // --- INICIALIZAÇÃO ---
    function initializeApp( ) {
        setupNavigation();
        setupSidebar();
        renderAllSections();
        setupEventListeners();
    }

    function setupNavigation() {
        $('.sidebar-nav .nav-link').on('click', function(e) {
            e.preventDefault();
            const section = $(this).data('section');
            $('.content-section').removeClass('active');
            $(`#${section}-section`).addClass('active');
            $('.sidebar-nav .nav-link').removeClass('active');
            $(this).addClass('active');
        });
    }
    
    function setupSidebar() {
        $('#sidebarToggle').on('click', () => $('#sidebar').toggleClass('collapsed'));
    }

    function setupEventListeners() {
        $(document).on('click', '.kanban-card', function() {
            const pedidoId = $(this).data('id');
            openPedidoModal(pedidoId);
        });
        $(document).on('click', '.user-card .btn', function() {
            const userId = $(this).closest('.user-card').data('id');
            openUserModal(userId);
        });
    }

    // --- RENDERIZAÇÃO DAS SEÇÕES ---
    function renderAllSections() {
        renderDashboard();
        renderKanbanBoard();
        renderHistoricoTable();
        renderUserCards();
        renderRelatoriosTable();
        renderLogsTable();
    }

    function renderDashboard() {
        $('#metric-fila').text(mockData.pedidos.filter(p => p.etapa !== 'concluido').length);
        $('#metric-concluidos').text(mockData.pedidos.filter(p => p.etapa === 'concluido').length);
        $('#metric-pendencias').text(mockData.pedidos.filter(p => !p.estoqueOk || !p.arteAprovada).length);
        $('#metric-produtividade').text('92%'); // Valor simulado

        renderCharts();
    }

    function renderCharts() {
        const progressoCtx = document.getElementById('progressoChart').getContext('2d');
        new Chart(progressoCtx, {
            type: 'bar',
            data: {
                labels: ['D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'Ontem', 'Hoje'],
                datasets: [
                    { label: 'Produzidos', data: [10, 12, 8, 15, 13, 18, 20], backgroundColor: '#3b82f6' },
                    { label: 'Concluídos', data: [8, 10, 7, 13, 11, 15, 18], backgroundColor: '#10b981' }
                ]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { x: { stacked: true }, y: { stacked: true } } }
        });

        const etapasCtx = document.getElementById('etapasChart').getContext('2d');
        const etapasData = mockData.etapas.map(etapa => mockData.pedidos.filter(p => p.etapa === etapa.id).length);
        new Chart(etapasCtx, {
            type: 'pie',
            data: {
                labels: mockData.etapas.map(e => e.nome),
                datasets: [{ data: etapasData, backgroundColor: ['#64748b', '#3b82f6', '#f97316', '#8b5cf6', '#10b981'] }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    function renderKanbanBoard() {
        const board = $('.kanban-board');
        board.empty();
        mockData.etapas.forEach(etapa => {
            const column = $(`
                <div class="kanban-column" data-etapa="${etapa.id}">
                    <div class="kanban-column-header">
                        <span>${etapa.nome}</span>
                        <span class="badge bg-secondary rounded-pill" id="count-${etapa.id}">0</span>
                    </div>
                    <div class="kanban-column-body" id="kanban-body-${etapa.id}"></div>
                </div>
            `);
            board.append(column);
        });

        mockData.pedidos.forEach(pedido => {
            const user = mockData.usuarios.find(u => u.id === pedido.usuarioId);
            const card = $(`
                <div class="kanban-card" data-id="${pedido.id}" style="border-left-color: ${getBorderColor(pedido.etapa)}">
                    <div class="kanban-card-header">
                        <span class="kanban-card-sku">${pedido.sku} <sup>^${pedido.quantidade}</sup></span>
                        <span class="kanban-card-data ${pedido.tipoEnvio}">${formatDate(pedido.dataEnvio)}</span>
                    </div>
                    <div class="kanban-card-produto">${pedido.produto}</div>
                    <div class="kanban-card-footer">
                        ${user ? `<div class="kanban-card-user d-flex align-items-center"><img src="${user.avatar}" alt="${user.nome}"><span>${user.nome}</span></div>` : '<span>Não atribuído</span>'}
                        <i class="fas fa-grip-vertical"></i>
                    </div>
                </div>
            `);
            $(`#kanban-body-${pedido.etapa}`).append(card);
        });

        updateKanbanCounts();
        initializeSortable();
    }

    function updateKanbanCounts() {
        mockData.etapas.forEach(etapa => {
            const count = $(`#kanban-body-${etapa.id} .kanban-card`).length;
            $(`#count-${etapa.id}`).text(count);
        });
    }

    function initializeSortable() {
        $('.kanban-column-body').each(function() {
            new Sortable(this, {
                group: 'kanban',
                animation: 150,
                ghostClass: 'is-dragging',
                onEnd: function (evt) {
                    const pedidoId = $(evt.item).data('id');
                    const novaEtapa = $(evt.to).closest('.kanban-column').data('etapa');
                    const pedido = mockData.pedidos.find(p => p.id === pedidoId);
                    if (pedido) {
                        pedido.etapa = novaEtapa;
                        addLog('Movimentação', `Moveu pedido #${pedidoId} para a etapa "${novaEtapa}"`);
                        updateKanbanCounts();
                    }
                }
            });
        });
    }

    function renderTable(tableId, data, columns) {
        if ($.fn.DataTable.isDataTable(`#${tableId}`)) {
            $(`#${tableId}`).DataTable().clear().rows.add(data).draw();
        } else {
            $(`#${tableId}`).DataTable({
                data: data,
                columns: columns,
                responsive: true,
                order: [[0, 'desc']],
                language: { url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/pt-BR.json' }
            });
        }
    }

    function renderHistoricoTable() {
        const columns = [
            { data: 'data', render: data => new Date(data).toLocaleString('pt-BR') },
            { data: 'pedidoId', render: id => `#${id}` },
            { data: 'sku' },
            { data: 'etapa' },
            { data: 'status' },
            { data: 'usuarioId', render: id => mockData.usuarios.find(u => u.id === id)?.nome || 'Sistema' },
            { data: 'detalhes' }
        ];
        renderTable('historicoTable', mockData.historico, columns);
    }

    function renderUserCards() {
        const container = $('#user-cards-container');
        container.empty();
        mockData.usuarios.forEach(user => {
            const card = `
                <div class="col-xl-4 col-md-6 mb-4">
                    <div class="card user-card h-100" data-id="${user.id}">
                        <div class="card-body">
                            <div class="user-card-header">
                                <img src="${user.avatar}" class="rounded-circle" alt="${user.nome}">
                                <div>
                                    <h5 class="card-title mb-0">${user.nome}</h5>
                                    <p class="card-text text-muted">ID: ${user.id}</p>
                                </div>
                            </div>
                            <hr>
                            <h6>Permissões</h6>
                            <div class="user-card-permissions">
                                ${user.permissoes.map(p => `<span class="badge bg-primary">${p}</span>`).join('')}
                            </div>
                        </div>
                        <div class="card-footer bg-white border-0 text-end">
                            <button class="btn btn-sm btn-outline-primary">Gerenciar Permissões</button>
                        </div>
                    </div>
                </div>
            `;
            container.append(card);
        });
    }

    function renderRelatoriosTable() {
        const columns = [
            { data: 'data', render: data => new Date(data).toLocaleString('pt-BR') },
            { data: 'arte' },
            { data: 'pedido' },
            { data: 'usuario' },
            { data: 'impressora' },
            { data: 'status' }
        ];
        renderTable('relatoriosTable', mockData.relatorios, columns);
    }

    function renderLogsTable() {
        const columns = [
            { data: 'data', render: data => new Date(data).toLocaleString('pt-BR') },
            { data: 'usuario' },
            { data: 'acao' },
            { data: 'detalhes' },
            { data: 'ip' }
        ];
        renderTable('logsTable', mockData.logs, columns);
    }

    // --- MODAIS E AÇÕES ---
    function openPedidoModal(pedidoId) {
        const pedido = mockData.pedidos.find(p => p.id === pedidoId);
        if (!pedido) return;

        $('#pedidoModalTitle').text(`Pedido #${pedido.id} - ${pedido.sku}`);
        const body = `
            <p><strong>Produto:</strong> ${pedido.produto}</p>
            <p><strong>Quantidade:</strong> ${pedido.quantidade}</p>
            <p><strong>Data de Envio:</strong> ${formatDate(pedido.dataEnvio)}</p>
            <p><strong>Tipo de Envio:</strong> <span class="${pedido.tipoEnvio}">${pedido.tipoEnvio}</span></p>
            <p><strong>Status do Estoque:</strong> ${pedido.estoqueOk ? '<span class="text-success">OK</span>' : '<span class="text-danger">Pendente</span>'}</p>
        `;
        $('#pedidoModalBody').html(body);
        
        $('#check-estoque').prop('checked', pedido.estoqueOk);
        $('#check-arte').prop('checked', pedido.arteAprovada);

        $('#cancelarPedidoBtn').off().on('click', () => cancelarPedido(pedidoId));
        $('#avancarPedidoBtn').off().on('click', () => avancarPedido(pedidoId));

        $('#pedidoModal').modal('show');
    }

    function cancelarPedido(pedidoId) {
        if (confirm(`Tem certeza que deseja cancelar o pedido #${pedidoId}?`)) {
            const index = mockData.pedidos.findIndex(p => p.id === pedidoId);
            if (index > -1) {
                mockData.pedidos.splice(index, 1);
                addLog('Cancelamento', `Cancelou o pedido #${pedidoId}`);
                renderKanbanBoard();
                $('#pedidoModal').modal('hide');
                showAlert(`Pedido #${pedidoId} cancelado.`, 'danger');
            }
        }
    }

    function avancarPedido(pedidoId) {
        const pedido = mockData.pedidos.find(p => p.id === pedidoId);
        if (pedido) {
            const currentIndex = mockData.etapas.findIndex(e => e.id === pedido.etapa);
            if (currentIndex < mockData.etapas.length - 1) {
                pedido.etapa = mockData.etapas[currentIndex + 1].id;
                addLog('Avanço de Etapa', `Avançou pedido #${pedidoId} para ${pedido.etapa}`);
                renderKanbanBoard();
                $('#pedidoModal').modal('hide');
                showAlert(`Pedido #${pedidoId} avançou para ${pedido.etapa}.`, 'success');
            } else {
                showAlert('Pedido já está na última etapa.', 'info');
            }
        }
    }

    function openUserModal(userId) {
        const user = mockData.usuarios.find(u => u.id === userId);
        if (!user) return;

        $('#userModalTitle').text(`Permissões de ${user.nome}`);
        let permissionsHtml = '';
        mockData.etapas.forEach(etapa => {
            if (etapa.id !== 'concluido') { // Exemplo de lógica
                const hasPermission = user.permissoes.includes(etapa.id);
                permissionsHtml += `
                    <div class="form-check form-switch mb-2">
                        <input class="form-check-input" type="checkbox" id="perm-${etapa.id}" ${hasPermission ? 'checked' : ''}>
                        <label class="form-check-label" for="perm-${etapa.id}">${etapa.nome}</label>
                    </div>
                `;
            }
        });
        $('#userModalBody').html(permissionsHtml);
        $('#userModal').modal('show');
    }

    // --- FUNÇÕES UTILITÁRIAS ---
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long' });
    }

    function getBorderColor(etapa) {
        const colors = { fila: '#64748b', producao: '#3b82f6', costura: '#f97316', expedicao: '#8b5cf6', concluido: '#10b981' };
        return colors[etapa] || '#64748b';
    }

    function addLog(acao, detalhes) {
        mockData.logs.unshift({
            data: new Date().toISOString(),
            usuario: 'Admin', // Simulado
            acao: acao,
            detalhes: detalhes,
            ip: '192.168.1.1'
        });
        renderLogsTable();
    }

    function showAlert(message, type = 'info') {
        const alertClass = { success: 'alert-success', danger: 'alert-danger', info: 'alert-info' }[type] || 'alert-secondary';
        const alertHtml = `<div class="alert ${alertClass} alert-dismissible fade show position-fixed" style="top: 20px; right: 20px; z-index: 9999;">${message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
        $('body').append(alertHtml);
        setTimeout(() => $('.alert').last().fadeOut(500, function() { $(this).remove(); }), 5000);
    }

    // Inicia a aplicação
    initializeApp();
});
