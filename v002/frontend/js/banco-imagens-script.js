$(document).ready(function() {
    
    // --- DADOS SIMULADOS ---
    // Em um ambiente real, estes dados viriam de um backend/API.
    const mockData = {
        artes: [
            { id: 1, nome: 'Arte Promocional de Natal', sku: 'PED12345', arquivo: 'promo_natal.png', tipo: 'image', url: 'https://via.placeholder.com/800x600.png/22c55e/ffffff?text=Arte+Natal', impressoraId: 1, tags: ['natal', 'promocao'], status: 'disponivel', dataUpload: '2025-08-19T10:00:00Z', usuario: 'Designer1', tamanho: '2.5 MB' },
            { id: 2, nome: 'Logo Cliente Via Cores', sku: 'PED12346', arquivo: 'logo_viacores.pdf', tipo: 'pdf', url: '#', impressoraId: 2, tags: ['cliente', 'logo'], status: 'em_uso', dataUpload: '2025-08-18T14:30:00Z', usuario: 'Designer2', tamanho: '800 KB' },
            { id: 3, nome: 'Estampa Floral Verão', sku: 'PED12347', arquivo: 'estampa_verao.jpg', tipo: 'image', url: 'https://via.placeholder.com/800x600.png/f97316/ffffff?text=Arte+Verão', impressoraId: 1, tags: ['verao', 'floral'], status: 'disponivel', dataUpload: '2025-08-17T09:20:00Z', usuario: 'Designer1', tamanho: '4.1 MB' },
            { id: 4, nome: 'Arte Dia das Mães Antiga', sku: 'PED11101', arquivo: 'dia_maes_2024.ai', tipo: 'ai', url: '#', impressoraId: 3, tags: ['dia das maes', 'antigo'], status: 'arquivada', dataUpload: '2024-05-01T11:00:00Z', usuario: 'Admin', tamanho: '12.3 MB' },
            { id: 5, nome: 'Vetor Camiseta Esportiva', sku: 'PED12348', arquivo: 'camiseta_esporte.cdr', tipo: 'cdr', url: '#', impressoraId: 2, tags: ['esporte', 'camiseta'], status: 'em_uso', dataUpload: '2025-08-20T11:00:00Z', usuario: 'Designer2', tamanho: '7.8 MB' }
        ],
        impressoras: [
            { id: 1, nome: 'Epson L3150 #01' },
            { id: 2, nome: 'Canon G3110 #02' },
            { id: 3, nome: 'HP DeskJet #03' }
        ],
        logs: [
            { data: '2025-08-20T11:00:00Z', usuario: 'Designer2', acao: 'Upload', detalhes: 'Fez upload da arte "Vetor Camiseta Esportiva"', ip: '192.168.1.12' },
            { data: '2025-08-20T10:05:00Z', usuario: 'Designer1', acao: 'Visualização', detalhes: 'Visualizou a arte "Arte Promocional de Natal"', ip: '192.168.1.10' },
            { data: '2025-08-19T15:00:00Z', usuario: 'Admin', acao: 'Arquivamento', detalhes: 'Arquivou a arte "Arte Dia das Mães Antiga"', ip: '192.168.1.1' }
        ]
    };

    let uploadsChartInstance, impressorasChartInstance;
    let historicoTable, logsTable;

    // --- INICIALIZAÇÃO ---
    function initializeApp( ) {
        setupNavigation();
        setupSidebar();
        loadAllData();
        setupEventListeners();
    }

    function setupNavigation() {
        $('.sidebar-nav .nav-link').on('click', function(e) {
            e.preventDefault();
            const section = $(this).data('section');
            $('.sidebar-nav .nav-link').removeClass('active');
            $(this).addClass('active');
            $('.content-section').removeClass('active');
            $(`#${section}-section`).addClass('active');
            if (section === 'dashboard') {
                renderDashboardCharts();
            }
        });
    }

    function setupSidebar() {
        $('#sidebarToggle').on('click', () => $('#sidebar').toggleClass('collapsed'));
    }

    function setupEventListeners() {
        $('#saveUploadBtn').on('click', handleSaveUpload);
        $('#applyArtFilters, #filterImpressora, #filterStatusArte').on('change', renderGallery);
        $('#searchArtes').on('keyup', renderGallery);
        $(document).on('click', '.image-card', function() {
            const arteId = $(this).data('id');
            showDetailsModal(arteId);
        });
    }

    // --- CARREGAMENTO DE DADOS ---
    function loadAllData() {
        populateImpressoraFilters();
        renderDashboard();
        renderGallery();
        renderHistorico();
        renderLogs();
    }

    function populateImpressoraFilters() {
        const impressoraSelects = $('#filterImpressora, #arteImpressora');
        impressoraSelects.each(function() {
            const currentSelect = $(this);
            currentSelect.find('option:gt(0)').remove();
            mockData.impressoras.forEach(imp => {
                currentSelect.append(`<option value="${imp.id}">${imp.nome}</option>`);
            });
        });
    }

    // --- RENDERIZAÇÃO DAS SEÇÕES ---
    function renderDashboard() {
        const uploadsHoje = mockData.artes.filter(a => new Date(a.dataUpload).toDateString() === new Date().toDateString()).length;
        $('#total-artes').text(mockData.artes.length);
        $('#uploads-hoje').text(uploadsHoje);
        $('#artes-producao').text(mockData.artes.filter(a => a.status === 'em_uso').length);
        const espacoUsado = mockData.artes.reduce((acc, a) => acc + parseFloat(a.tamanho), 0);
        $('#espaco-usado').text(`${(espacoUsado / 1024).toFixed(2)} GB`);

        renderDashboardCharts(uploadsHoje);
    }

    function renderDashboardCharts(uploadsHoje = 0) {
        if (uploadsChartInstance) uploadsChartInstance.destroy();
        uploadsChartInstance = new Chart($('#uploadsChart'), {
            type: 'line',
            data: {
                labels: ['D-6', 'D-5', 'D-4', 'D-3', 'D-2', 'Ontem', 'Hoje'],
                datasets: [{
                    label: 'Uploads', data: [2, 3, 1, 4, 2, 5, uploadsHoje],
                    borderColor: 'rgba(139, 92, 246, 1)', backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    fill: true, tension: 0.4
                }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });

        if (impressorasChartInstance) impressorasChartInstance.destroy();
        const impressoraUsage = mockData.impressoras.map(imp => mockData.artes.filter(a => a.impressoraId === imp.id).length);
        impressorasChartInstance = new Chart($('#impressorasChart'), {
            type: 'doughnut',
            data: {
                labels: mockData.impressoras.map(i => i.nome),
                datasets: [{ data: impressoraUsage, backgroundColor: ['#8b5cf6', '#6366f1', '#a78bfa'] }]
            },
            options: { responsive: true, maintainAspectRatio: false }
        });
    }

    function renderGallery() {
        const gallery = $('#image-gallery');
        gallery.empty();
        const searchTerm = $('#searchArtes').val().toLowerCase();
        const impressoraFilter = $('#filterImpressora').val();
        const statusFilter = $('#filterStatusArte').val();

        const filteredArtes = mockData.artes.filter(arte => 
            (searchTerm === '' || arte.nome.toLowerCase().includes(searchTerm) || (arte.sku && arte.sku.toLowerCase().includes(searchTerm)) || arte.tags.some(tag => tag.toLowerCase().includes(searchTerm))) &&
            (impressoraFilter === '' || arte.impressoraId == impressoraFilter) &&
            (statusFilter === '' || arte.status === statusFilter)
        );

        if (filteredArtes.length === 0) {
            gallery.html('<div class="col-12"><div class="alert alert-info">Nenhuma arte encontrada.</div></div>');
            return;
        }

        filteredArtes.forEach(arte => {
            const fileIcon = getFileIcon(arte.tipo);
            const imagePreview = arte.tipo === 'image' ? `<img src="${arte.url}" class="card-img-top" alt="${arte.nome}">` : `<div class="card-img-top"><i class="fas ${fileIcon}"></i></div>`;
            const tagsHtml = arte.tags.map(tag => `<span class="tag">${tag}</span>`).join('');
            
            gallery.append(`
                <div class="col-xl-3 col-lg-4 col-md-6 mb-4 animate__animated animate__fadeIn">
                    <div class="card image-card" data-id="${arte.id}">
                        ${imagePreview}
                        <span class="status-badge status-${arte.status}">${arte.status.replace('_', ' ')}</span>
                        <div class="card-body">
                            <h5 class="card-title" title="${arte.nome}">${arte.nome}</h5>
                            <p class="card-text">${arte.sku || 'Sem SKU'}</p>
                            <div class="tags-container">${tagsHtml}</div>
                        </div>
                    </div>
                </div>
            `);
        });
    }

    function renderHistorico() {
        if ($.fn.DataTable.isDataTable('#historicoTable')) {
            historicoTable.clear().rows.add(mockData.artes).draw();
        } else {
            historicoTable = $('#historicoTable').DataTable({
                data: mockData.artes,
                columns: [
                    { data: 'dataUpload', render: data => new Date(data).toLocaleString('pt-BR') },
                    { data: 'nome' },
                    { data: 'usuario' },
                    { data: 'sku', defaultContent: 'N/A' },
                    { data: 'impressoraId', render: id => mockData.impressoras.find(i => i.id === id)?.nome || 'N/A' },
                    { data: 'status', render: s => `<span class="badge status-badge status-${s}">${s.replace('_', ' ')}</span>` },
                    { data: 'id', render: id => `<button class="btn btn-sm btn-outline-primary" onclick="window.showDetailsModal(${id})"><i class="fas fa-eye"></i></button>` }
                ],
                responsive: true, order: [[0, 'desc']], language: { url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/pt-BR.json' }
            });
        }
    }

    function renderLogs() {
        if ($.fn.DataTable.isDataTable('#logsTable')) {
            logsTable.clear().rows.add(mockData.logs).draw();
        } else {
            logsTable = $('#logsTable').DataTable({
                data: mockData.logs,
                columns: [
                    { data: 'data', render: data => new Date(data).toLocaleString('pt-BR') },
                    { data: 'usuario' },
                    { data: 'acao' },
                    { data: 'detalhes' },
                    { data: 'ip' }
                ],
                responsive: true, order: [[0, 'desc']], language: { url: '//cdn.datatables.net/plug-ins/1.13.7/i18n/pt-BR.json' }
            });
        }
    }

    // --- MANIPULAÇÃO DE EVENTOS E MODAIS ---
    function handleSaveUpload() {
        const newArte = {
            id: mockData.artes.length + 1,
            nome: $('#arteNome').val(),
            sku: $('#arteSku').val(),
            arquivo: $('#arteArquivo').val().split('\\').pop(),
            tipo: getFileType($('#arteArquivo').val()),
            url: 'https://via.placeholder.com/800x600.png/a78bfa/ffffff?text=Nova+Arte',
            impressoraId: parseInt($('#arteImpressora' ).val()),
            tags: $('#arteTags').val().split(',').map(tag => tag.trim()).filter(Boolean),
            status: 'disponivel',
            dataUpload: new Date().toISOString(),
            usuario: 'Usuário Atual',
            tamanho: `${(Math.random() * 10).toFixed(1)} MB`
        };

        if (!newArte.nome || !newArte.arquivo || !newArte.impressoraId) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        mockData.artes.push(newArte);
        addLog('Upload', `Fez upload da arte "${newArte.nome}"`);
        
        $('#uploadModal').modal('hide');
        $('#uploadForm')[0].reset();
        
        loadAllData();
        showAlert('Arte enviada com sucesso!', 'success');
    }

    window.showDetailsModal = function(arteId) {
        const arte = mockData.artes.find(a => a.id === arteId);
        if (!arte) return;

        $('#detailsModalTitle').text(arte.nome);
        const preview = arte.tipo === 'image' ? `<img src="${arte.url}" alt="${arte.nome}">` : `<div class="file-icon"><i class="fas ${getFileIcon(arte.tipo)}"></i></div>`;
        $('#image-preview-container').html(preview);

        const impressoraNome = mockData.impressoras.find(i => i.id === arte.impressoraId)?.nome || 'N/A';
        const details = `
            <h4>${arte.nome}</h4>
            <div class="detail-item">
                <span class="detail-label">SKU / Pedido</span>
                <div class="detail-value">${arte.sku || 'N/A'}</div>
            </div>
            <div class="detail-item">
                <span class="detail-label">Data de Upload</span>
                <div class="detail-value">${new Date(arte.dataUpload).toLocaleString('pt-BR')} por <strong>${arte.usuario}</strong></div>
            </div>
            <div class="detail-item">
                <span class="detail-label">Impressora</span>
                <div class="detail-value">${impressoraNome}</div>
            </div>
            <div class="detail-item">
                <span class="detail-label">Status</span>
                <div class="detail-value"><span class="badge status-badge status-${arte.status}">${arte.status.replace('_', ' ')}</span></div>
            </div>
            <div class="detail-item">
                <span class="detail-label">Tags</span>
                <div class="tags-container">${arte.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}</div>
            </div>
        `;
        $('#image-details-container').html(details);

        // Configura botões do modal
        $('#deleteArtBtn').off().on('click', () => deleteArt(arteId));
        $('#archiveArtBtn').off().on('click', () => archiveArt(arteId)).text(arte.status === 'arquivada' ? 'Restaurar' : 'Arquivar');
        $('#downloadArtBtn').off().on('click', () => downloadArt(arte.arquivo));

        $('#detailsModal').modal('show');
    }

    function deleteArt(arteId) {
        if (confirm('Tem certeza que deseja excluir esta arte permanentemente?')) {
            const index = mockData.artes.findIndex(a => a.id === arteId);
            if (index > -1) {
                const arteNome = mockData.artes[index].nome;
                mockData.artes.splice(index, 1);
                addLog('Exclusão', `Excluiu a arte "${arteNome}"`);
                $('#detailsModal').modal('hide');
                loadAllData();
                showAlert('Arte excluída com sucesso!', 'danger');
            }
        }
    }

    function archiveArt(arteId) {
        const arte = mockData.artes.find(a => a.id === arteId);
        if (arte) {
            const isArchiving = arte.status !== 'arquivada';
            arte.status = isArchiving ? 'arquivada' : 'disponivel';
            addLog(isArchiving ? 'Arquivamento' : 'Restauração', `${isArchiving ? 'Arquivou' : 'Restaurou'} a arte "${arte.nome}"`);
            $('#detailsModal').modal('hide');
            loadAllData();
            showAlert(`Arte ${isArchiving ? 'arquivada' : 'restaurada'} com sucesso!`, 'success');
        }
    }

    function downloadArt(fileName) {
        showAlert(`Iniciando download de ${fileName}...`, 'info');
    }

    // --- FUNÇÕES UTILITÁRIAS ---
    function getFileIcon(fileType) {
        switch (fileType) {
            case 'pdf': return 'fa-file-pdf';
            case 'ai': return 'fa-file-pen';
            case 'cdr': return 'fa-file-alt';
            default: return 'fa-file-image';
        }
    }

    function getFileType(fileName) {
        const ext = fileName.split('.').pop().toLowerCase();
        if (['png', 'jpg', 'jpeg', 'gif'].includes(ext)) return 'image';
        if (ext === 'pdf') return 'pdf';
        if (ext === 'ai') return 'ai';
        if (ext === 'cdr') return 'cdr';
        return 'other';
    }

    function addLog(acao, detalhes) {
        mockData.logs.unshift({
            data: new Date().toISOString(),
            usuario: 'Usuário Atual',
            acao: acao,
            detalhes: detalhes,
            ip: '192.168.1.15'
        });
        renderLogs();
    }

    function showAlert(message, type = 'info') {
        const alertClass = { success: 'alert-success', danger: 'alert-danger', info: 'alert-info' }[type] || 'alert-secondary';
        const alertHtml = `<div class="alert ${alertClass} alert-dismissible fade show position-fixed" style="top: 20px; right: 20px; z-index: 9999;">${message}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
        $('body').append(alertHtml);
        setTimeout(() => $('.alert').fadeOut(500, function() { $(this).remove(); }), 5000);
    }

    // Inicia a aplicação
    initializeApp();
});
