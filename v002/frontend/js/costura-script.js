$(document).ready(function() {

    // --- DADOS SIMULADOS ---
    const mockData = {
        pedidosCostura: [
            { id: 3, sku: 'PCPR033', tipo: 'PC', checks: [], usuarioId: null },
            { id: 4, sku: 'PCBR035', tipo: 'PC', checks: ['manga', 'gola'], usuarioId: 1 },
            { id: 7, sku: 'PVAR001', tipo: 'PV', checks: [], usuarioId: null },
            { id: 8, sku: 'PVAR002', tipo: 'PV', checks: [], usuarioId: null },
            { id: 9, sku: 'PCAM005', tipo: 'PC', checks: ['manga'], usuarioId: 2 },
            { id: 10, sku: 'PVAR003', tipo: 'PV', checks: ['gola', 'bainha', 'etiqueta'], usuarioId: 1 },
        ],
        usuarios: [
            { id: 1, nome: 'Ana Lima', avatar: 'https://via.placeholder.com/40/f97316/ffffff?text=AL', visibilidade: ['PC', 'PV'] },
            { id: 2, nome: 'Bruno Costa', avatar: 'https://via.placeholder.com/40/10b981/ffffff?text=BC', visibilidade: ['PC'] },
            { id: 3, nome: 'Carla Dias', avatar: 'https://via.placeholder.com/40/3b82f6/ffffff?text=CD', visibilidade: ['PV'] },
        ],
        etapasChecklist: [
            { id: 'manga', nome: 'Costura da Manga' },
            { id: 'gola', nome: 'Aplicação da Gola' },
            { id: 'bainha', nome: 'Fechamento da Bainha' },
            { id: 'etiqueta', nome: 'Aplicação da Etiqueta' },
        ],
        historicoChecks: [
            { data: '2025-08-20T10:00:00Z', usuarioId: 1, pedidoId: 10, sku: 'PVAR003', etapa: 'Aplicação da Etiqueta' },
            { data: '2025-08-20T09:45:00Z', usuarioId: 2, pedidoId: 9, sku: 'PCAM005', etapa: 'Costura da Manga' },
            { data: '2025-08-19T16:30:00Z', usuarioId: 1, pedidoId: 4, sku: 'PCBR035', etapa: 'Aplicação da Gola' },
        ],
        logs: [
            { data: '2025-08-20T10:00:00Z', usuario: 'Ana Lima', acao: 'Check', detalhes: 'Marcou "Aplicação da Etiqueta" para PVAR003', ip: '192.168.1.20' },
            { data: '2025-08-19T15:00:00Z', usuario: 'Admin', acao: 'Controle', detalhes: 'Alterou visibilidade de Bruno Costa para "PC"', ip: '192.168.1.1' },
        ]
    };

    // Simula o usuário logado (troque para testar a visibilidade )
    const usuarioLogadoId = 1; // 1: Ana (vê tudo), 2: Bruno (vê PC), 3: Carla (vê PV)
    const usuarioLogado = mockData.usuarios.find(u => u.id === usuarioLogadoId);


    // --- INICIALIZAÇÃO ---
    function initializeApp() {
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
        $(document).on('click', '.costura-card', function() {
            const pedidoId = $(this).data('id');
            openChecklistModal(pedidoId);
        });
        $(document).on('change', '.user-control-card input[type="checkbox"]', function() {
            const userId = $(this).closest('.user-control-card').data('id');
            const tipo = $(this).val();
            const isChecked = $(this).is(':checked');
            updateUserVisibility(userId, tipo, isChecked);
        });
    }

    // --- RENDERIZAÇÃO DAS SEÇÕES ---
    function renderAllSections() {
        renderDashboard();
        renderFilaCostura();
        renderUserControls();
        renderRelatoriosTable();
        renderLogsTable();
    }

    function renderDashboard() {
        const pedidosVisiveis = mockData.pedidosCostura.filter(p => usuarioLogado.visibilidade.includes(p.tipo));
        const totalChecksHoje = mockData.historicoChecks.filter(h => new Date(h.data).toDateString() === new Date().toDateString()).length;

        $('#metric-fila').text(pedidosVisiveis.filter(p => p.checks.length < mockData.etapasChecklist.length).length);
        $('#metric-checks').text(totalChecksHoje);
        $('#metric-usuarios').text(mockData.usuarios.length);
        $('#metric-eficiencia').text('88%'); // Valor simulado

        renderCharts();
    }

    function renderCharts() {
        const checksUsuarioCtx = document.getElementById('checksUsuarioChart').getContext('2d');
        const checksPorUsuario = mockData.usuarios.map(user => 
            mockData.historicoChecks.filter(h => h.usuarioId === user.id && new Date(h.data).toDateString() === new Date().toDateString()).length
        );
        new Chart(checksUsuarioCtx, {
            type: 'bar',
            data: {
                labels: mockData.usuarios.map(u => u.nome),
                datasets: [{ label: 'Checks Hoje', data: checksPorUsuario, backgroundColor: '#f97316' }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

        const tipoPecaCtx = document.getElementById('tipoPecaChart').getContext('2d');
        const pecasPC = mockData.pedidosCostura.filter(p => p.tipo === 'PC').length;
        const pecasPV = mockData.pedidosCostura.filter(p => p.tipo === 'PV').length;
        new Chart(tipoPecaCtx, {
            type: 'pie',
            data: {
                labels: ['Peças PC', 'Peças PV'],
                datasets: [{ data: [pecasPC, pecasPV], backgroundColor: ['#3b82f6', '#10b981'] }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    function renderFilaCostura() {
        const container = $('#costura-fila-container');
        container.empty();
        const pedidosVisiveis = mockData.pedidosCostura.filter(p => usuarioLogado.visibilidade.includes(p.tipo));

        if (pedidosVisiveis.length === 0) {
            container.html('<div class="alert alert-info">Nenhum item na sua fila de costura no momento.</div>');
            return;
        }

        pedidosVisiveis.forEach(pedido => {
            const totalEtapas = mockData.etapasChecklist.length;
            const concluidas = pedido.checks.length;
            const isChecked = concluidas === totalEtapas;
            const statusText = isChecked ? 'Concluído' : `${concluidas}/${totalEtapas} etapas`;

            const card = `
                <div class="col-xl-2 col-lg-3 col-md-4 col-sm-6 mb-4">
                    <div class="costura-card ${isChecked ? 'checked' : ''}" data-id="${pedido.id}">
                        <div class="costura-card-sku">${pedido.sku}</div>
                        <div class="costura-card-status">${statusText}</div>
                    </div>
                </div>
            `;
            container.append(card);
        });
    }

    function renderUserControls() {
        const container = $('#user-control-container');
        container.empty();
        mockData.usuarios.forEach(user => {
            const control = `
                <div class="col-md-6 mb-4">
                    <div class="card user-control-card" data-id="${user.id}">
                        <div class="card-header">
                            <img src="${user.avatar}" class="rounded-circle" alt="${user.nome}">
                            <h6 class="mb-0">${user.nome}</h6>
                        </div>
                        <div class="card-body">
                            <p class="mb-2 small text-muted">Permitir visualização de:</p>
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" value="PC" id="pc-${user.id}" ${user.visibilidade.includes('PC') ? 'checked' : ''}>
                                <label class="form-check-label" for="pc-${user.id}">Peças PC (Polo/Camiseta)</label>
                            </div>
                            <div class="form-check form-switch">
                                <input class="form-check-input" type="checkbox" value="PV" id="pv-${user.id}" ${user.visibilidade.includes('PV') ? 'checked' : ''}>
                                <label class="form-check-label" for="pv-${user.id}">Peças PV (Poliéster/Viscose)</label>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.append(control);
        });
    }

    function renderRelatoriosTable() {
        const columns = [
            { data: 'data', render: data => new Date(data).toLocaleString('pt-BR') },
            { data: 'usuarioId', render: id => mockData.usuarios.find(u => u.id === id)?.nome || 'N/A' },
            { data: 'pedidoId', render: id => `#${id}` },
            { data: 'sku' },
            { data: 'etapa' },
            { render: () => `${Math.floor(Math.random() * 10) + 2} min` } // Tempo gasto simulado
        ];
        renderTable('relatoriosTable', mockData.historicoChecks, columns);
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

    function renderTable(tableId, data, columns) {
        if ($.fn.DataTable.isDataTable(`#${tableId}`)) {
            $(`#${tableId}`).DataTable().clear().rows.add(data).draw();
        } else {
            $(`#${tableId}`).DataTable({
                data: data, columns: columns, responsive: true, order: [[0, 'desc']],
                language: { url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/pt-BR.json' }
            });
        }
    }

    // --- MODAIS E AÇÕES ---
    function openChecklistModal(pedidoId) {
        const pedido = mockData.pedidosCostura.find(p => p.id === pedidoId);
        if (!pedido) return;

        $('#checklistModalTitle').text(`Checklist do Pedido: ${pedido.sku}`);
        const container = $('#checklist-container');
        container.empty();

        mockData.etapasChecklist.forEach(etapa => {
            const isChecked = pedido.checks.includes(etapa.id);
            const checkHtml = `
                <div class="form-check">
                    <input class="form-check-input" type="checkbox" value="${etapa.id}" id="check-${etapa.id}" ${isChecked ? 'checked' : ''}>
                    <label class="form-check-label" for="check-${etapa.id}">${etapa.nome}</label>
                </div>
            `;
            container.append(checkHtml);
        });

        $('#saveChecklistBtn').off().on('click', () => saveChecklist(pedidoId));
        $('#checklistModal').modal('show');
    }

    function saveChecklist(pedidoId) {
        const pedido = mockData.pedidosCostura.find(p => p.id === pedidoId);
        const originalChecks = [...pedido.checks];
        
        pedido.checks = [];
        $('#checklist-container .form-check-input:checked').each(function() {
            const etapaId = $(this).val();
            pedido.checks.push(etapaId);

            // Adiciona ao histórico apenas se for um check novo
            if (!originalChecks.includes(etapaId)) {
                const etapaNome = mockData.etapasChecklist.find(e => e.id === etapaId).nome;
                mockData.historicoChecks.unshift({
                    data: new Date().toISOString(),
                    usuarioId: usuarioLogadoId,
                    pedidoId: pedido.id,
                    sku: pedido.sku,
                    etapa: etapaNome
                });
                addLog('Check', `Marcou "${etapaNome}" para ${pedido.sku}`);
            }
        });

        renderFilaCostura();
        renderDashboard();
        renderRelatoriosTable();
        $('#checklistModal').modal('hide');
        showAlert('Checklist atualizado com sucesso!', 'success');
    }

    function updateUserVisibility(userId, tipo, isChecked) {
        const user = mockData.usuarios.find(u => u.id === userId);
        if (!user) return;

        const index = user.visibilidade.indexOf(tipo);
        if (isChecked && index === -1) {
            user.visibilidade.push(tipo);
        } else if (!isChecked && index > -1) {
            user.visibilidade.splice(index, 1);
        }
        
        addLog('Controle', `Alterou visibilidade de ${user.nome} para "${user.visibilidade.join(', ')}"`);
        showAlert(`Visibilidade de ${user.nome} atualizada.`, 'info');
        
        // Se o admin alterou a visibilidade do usuário que está logado, atualiza a fila dele em tempo real
        if (usuarioLogadoId === userId) {
            renderFilaCostura();
        }
    }

    // --- FUNÇÕES UTILITÁRIAS ---
    function addLog(acao, detalhes) {
        mockData.logs.unshift({
            data: new Date().toISOString(),
            usuario: usuarioLogado.nome,
            acao: acao,
            detalhes: detalhes,
            ip: '192.168.1.25' // IP simulado
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
