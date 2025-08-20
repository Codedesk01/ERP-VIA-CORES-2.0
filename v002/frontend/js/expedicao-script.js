$(document).ready(function() {

    // --- DADOS SIMULADOS ---
    const mockData = {
        pedidosParaEnvio: [
            { id: 3, sku: 'PCPR033', quantidade: 3, nf: 'NF00123', transportadora: 'Correios' },
            { id: 4, sku: 'PCBR035', quantidade: 1, nf: 'NF00124', transportadora: 'Jadlog' },
            { id: 5, sku: 'PCVD037', quantidade: 2, nf: 'NF00125', transportadora: 'Motoboy' },
            { id: 6, sku: 'PCRS039', quantidade: 1, nf: 'NF00126', transportadora: 'Correios' },
        ],
        historicoEnvios: [
            { data: '2025-08-19T14:30:00Z', pedidoId: 1, sku: 'PCRV029', quantidade: 2, nf: 'NF00121', transportadora: 'Correios', usuario: 'Carlos', status: 'Enviado' },
            { data: '2025-08-19T15:00:00Z', pedidoId: 2, sku: 'PCAZ031', quantidade: 1, nf: 'NF00122', transportadora: 'Motoboy', usuario: 'Daniela', status: 'Enviado' },
        ],
        relatoriosProcessos: [
            { data: '2025-08-19T14:28:00Z', pedidoId: 1, usuario: 'Carlos', etapa: 'Conferência', duracao: '45s', resultado: 'Sucesso' },
            { data: '2025-08-19T14:59:00Z', pedidoId: 2, usuario: 'Daniela', etapa: 'Conferência', duracao: '38s', resultado: 'Sucesso' },
        ],
        usuarios: ['Carlos', 'Daniela', 'Eduardo']
    };

    let pedidoAtual = null;
    let etapaAtual = 0;
    let startTime = null;

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
        $(document).on('click', '#fila-conferencia .list-group-item', function() {
            const pedidoId = $(this).data('id');
            iniciarConferencia(pedidoId);
            $('#fila-conferencia .list-group-item').removeClass('active');
            $(this).addClass('active');
        });
    }

    // --- RENDERIZAÇÃO DAS SEÇÕES ---
    function renderAllSections() {
        renderDashboard();
        renderFilaConferencia();
        renderHistoricoTable();
        renderRelatoriosTable();
    }

    function renderDashboard() {
        const enviadosHoje = mockData.historicoEnvios.filter(h => new Date(h.data).toDateString() === new Date().toDateString()).length;
        $('#metric-aguardando').text(mockData.pedidosParaEnvio.length);
        $('#metric-enviados').text(enviadosHoje);
        $('#metric-erros').text(2); // Valor simulado
        $('#metric-tempo').text('42s'); // Valor simulado

        renderCharts();
    }

    function renderCharts() {
        const enviosHoraCtx = document.getElementById('enviosHoraChart').getContext('2d');
        new Chart(enviosHoraCtx, {
            type: 'line',
            data: {
                labels: ['09h', '10h', '11h', '12h', '13h', '14h', '15h', '16h'],
                datasets: [{ label: 'Envios', data: [5, 8, 12, 10, 15, 25, 22, 18], borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', fill: true, tension: 0.4 }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

        const transportadoraCtx = document.getElementById('transportadoraChart').getContext('2d');
        new Chart(transportadoraCtx, {
            type: 'doughnut',
            data: {
                labels: ['Correios', 'Jadlog', 'Motoboy'],
                datasets: [{ data: [120, 75, 45], backgroundColor: ['#facc15', '#374151', '#ef4444'] }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    function renderFilaConferencia() {
        const filaContainer = $('#fila-conferencia');
        filaContainer.empty();
        mockData.pedidosParaEnvio.forEach(pedido => {
            const item = `
                <a href="#" class="list-group-item list-group-item-action" data-id="${pedido.id}">
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1">Pedido #${pedido.id}</h6>
                        <small>${pedido.transportadora}</small>
                    </div>
                    <p class="mb-1">SKU: ${pedido.sku} | Qtd: ${pedido.quantidade}</p>
                </a>
            `;
            filaContainer.append(item);
        });
    }

    function renderHistoricoTable() {
        renderTable('historicoTable', mockData.historicoEnvios, [
            { data: 'data', render: data => new Date(data).toLocaleString('pt-BR') },
            { data: 'pedidoId', render: id => `#${id}` },
            { data: 'sku' },
            { data: 'quantidade' },
            { data: 'nf' },
            { data: 'transportadora' },
            { data: 'usuario' },
            { data: 'status', render: s => `<span class="badge bg-success">${s}</span>` }
        ]);
    }

    function renderRelatoriosTable() {
        renderTable('relatoriosTable', mockData.relatoriosProcessos, [
            { data: 'data', render: data => new Date(data).toLocaleString('pt-BR') },
            { data: 'pedidoId', render: id => `#${id}` },
            { data: 'usuario' },
            { data: 'etapa' },
            { data: 'duracao' },
            { data: 'resultado', render: r => `<span class="badge ${r === 'Sucesso' ? 'bg-success' : 'bg-danger'}">${r}</span>` }
        ]);
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

    // --- LÓGICA DA CONFERÊNCIA ---
    function iniciarConferencia(pedidoId) {
        pedidoAtual = mockData.pedidosParaEnvio.find(p => p.id === pedidoId);
        if (!pedidoAtual) return;

        startTime = new Date();
        etapaAtual = 1;
        const estacaoHtml = `
            <div class="card-body p-4">
                <div class="conferencia-header">
                    <h4>Pedido #${pedidoAtual.id}</h4>
                    <p class="text-muted">SKU: ${pedidoAtual.sku} | Quantidade: ${pedidoAtual.quantidade} | NF: ${pedidoAtual.nf}</p>
                </div>
                <div class="conferencia-steps">
                    <div class="step" id="step-1"><div class="step-icon"><i class="fas fa-barcode"></i></div><span class="step-label">SKU</span></div>
                    <div class="step" id="step-2"><div class="step-icon"><i class="fas fa-hashtag"></i></div><span class="step-label">Pedido</span></div>
                    <div class="step" id="step-3"><div class="step-icon"><i class="fas fa-file-invoice"></i></div><span class="step-label">Nota Fiscal</span></div>
                </div>
                <div class="conferencia-input-group mt-4">
                    <input type="text" class="form-control" id="conferencia-input" placeholder="Aguardando leitura do código...">
                    <button class="btn btn-primary" id="conferencia-btn"><i class="fas fa-check"></i></button>
                </div>
                <div class="conferencia-feedback text-center" id="conferencia-feedback"></div>
            </div>
        `;
        $('#estacao-conferencia').html(estacaoHtml);
        
        $('#conferencia-input').on('keypress', function(e) {
            if (e.which === 13) { // Enter key
                verificarEtapa();
            }
        });
        $('#conferencia-btn').on('click', verificarEtapa);

        atualizarEtapaVisual();
    }

    function atualizarEtapaVisual() {
        $('.step').removeClass('active success error');
        if (etapaAtual <= 3) {
            $(`#step-${etapaAtual}`).addClass('active');
        }
        for (let i = 1; i < etapaAtual; i++) {
            $(`#step-${i}`).addClass('success');
        }
        const placeholders = ["SKU do Pedido", "Número do Pedido", "Número da NF"];
        $('#conferencia-input').attr('placeholder', `Leia o ${placeholders[etapaAtual - 1]}...`).focus();
    }

    function verificarEtapa() {
        const inputVal = $('#conferencia-input').val().trim();
        if (!inputVal) return;

        let valorCorreto = '';
        switch (etapaAtual) {
            case 1: valorCorreto = pedidoAtual.sku; break;
            case 2: valorCorreto = pedidoAtual.id.toString(); break;
            case 3: valorCorreto = pedidoAtual.nf; break;
        }

        if (inputVal === valorCorreto) {
            feedback('Correto!', 'success');
            $(`#step-${etapaAtual}`).addClass('success');
            etapaAtual++;
            if (etapaAtual > 3) {
                finalizarConferencia();
            } else {
                atualizarEtapaVisual();
            }
        } else {
            feedback('Erro! O valor não corresponde.', 'error');
            $(`#step-${etapaAtual}`).addClass('error');
            setTimeout(() => $(`#step-${etapaAtual}`).removeClass('error'), 1000);
        }
        $('#conferencia-input').val('');
    }

    function feedback(mensagem, tipo) {
        const feedbackEl = $('#conferencia-feedback');
        feedbackEl.text(mensagem).removeClass('feedback-success feedback-error').addClass(`feedback-${tipo}`);
        setTimeout(() => feedbackEl.text(''), 2000);
    }

    function finalizarConferencia() {
        const endTime = new Date();
        const duracao = ((endTime - startTime) / 1000).toFixed(1) + 's';

        // Adicionar ao histórico
        mockData.historicoEnvios.unshift({
            data: new Date().toISOString(),
            pedidoId: pedidoAtual.id,
            sku: pedidoAtual.sku,
            quantidade: pedidoAtual.quantidade,
            nf: pedidoAtual.nf,
            transportadora: pedidoAtual.transportadora,
            usuario: 'Usuário Atual', // Simulado
            status: 'Enviado'
        });

        // Adicionar ao relatório de processo
        mockData.relatoriosProcessos.unshift({
            data: new Date().toISOString(),
            pedidoId: pedidoAtual.id,
            usuario: 'Usuário Atual',
            etapa: 'Conferência',
            duracao: duracao,
            resultado: 'Sucesso'
        });

        // Remover da fila
        mockData.pedidosParaEnvio = mockData.pedidosParaEnvio.filter(p => p.id !== pedidoAtual.id);

        // Atualizar UI
        $('#estacao-conferencia').html(`
            <div class="card-body text-center p-5 animate__animated animate__tada">
                <i class="fas fa-check-circle fa-4x text-success mb-3"></i>
                <h4>Pedido #${pedidoAtual.id} Conferido!</h4>
                <p class="text-muted">Pronto para o envio.</p>
            </div>
        `);
        setTimeout(() => {
            $('#estacao-conferencia').html(`
                <div class="card-body text-center">
                    <i class="fas fa-box-open fa-4x text-muted mb-3"></i>
                    <h5 class="text-muted">Selecione um pedido da fila para iniciar a conferência.</h5>
                </div>
            `);
        }, 3000);

        renderFilaConferencia();
        renderHistoricoTable();
        renderRelatoriosTable();
        renderDashboard();
    }

    // Inicia a aplicação
    initializeApp();
});
