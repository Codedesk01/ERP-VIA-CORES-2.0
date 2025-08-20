// Dados simulados para o módulo de Pedidos
const pedidosData = {
    // Pedidos dos Marketplaces
    marketplacePedidos: [
        {
            id: 'SHP001',
            marketplace: 'shopee',
            sku: 'PCRV029',
            cliente: 'João Silva',
            produto: 'Camiseta Personalizada Vermelha',
            quantidade: 2,
            valor: 59.90,
            status: 'pendente',
            dataRecebimento: '2024-01-15 09:30',
            temEstoque: true,
            posicaoEstoque: 'A1-005',
            quantidadeDisponivel: 15,
            arteUpload: null,
            impressora: null,
            observacoes: 'Cliente solicitou entrega expressa'
        },
        {
            id: 'ML002',
            marketplace: 'mercadolivre',
            sku: 'PCAZ031',
            cliente: 'Maria Santos',
            produto: 'Camiseta Personalizada Azul',
            quantidade: 1,
            valor: 34.90,
            status: 'aguardando_arte',
            dataRecebimento: '2024-01-15 10:15',
            temEstoque: true,
            posicaoEstoque: 'A2-010',
            quantidadeDisponivel: 8,
            arteUpload: {
                arquivo: 'arte_pcaz031_001.png',
                dataUpload: '2024-01-15 11:00',
                usuario: 'Designer1',
                status: 'aprovada'
            },
            impressora: 'Epson_L3150_01',
            observacoes: 'Arte aprovada pelo cliente'
        },
        {
            id: 'SHP003',
            marketplace: 'shopee',
            sku: 'PCPR033',
            cliente: 'Carlos Oliveira',
            produto: 'Camiseta Personalizada Preta',
            quantidade: 3,
            valor: 89.70,
            status: 'sem_estoque',
            dataRecebimento: '2024-01-15 11:45',
            temEstoque: false,
            posicaoEstoque: null,
            quantidadeDisponivel: 0,
            arteUpload: null,
            impressora: null,
            observacoes: 'Aguardando reposição de estoque'
        },
        {
            id: 'ML004',
            marketplace: 'mercadolivre',
            sku: 'PCBR035',
            cliente: 'Ana Costa',
            produto: 'Camiseta Personalizada Branca',
            quantidade: 1,
            valor: 29.90,
            status: 'producao',
            dataRecebimento: '2024-01-15 14:20',
            temEstoque: true,
            posicaoEstoque: 'B1-015',
            quantidadeDisponivel: 12,
            arteUpload: {
                arquivo: 'arte_pcbr035_001.pdf',
                dataUpload: '2024-01-15 15:30',
                usuario: 'Designer2',
                status: 'em_impressao'
            },
            impressora: 'Canon_G3110_02',
            observacoes: 'Em processo de impressão'
        },
        {
            id: 'SHP005',
            marketplace: 'shopee',
            sku: 'PCVD037',
            cliente: 'Pedro Almeida',
            produto: 'Camiseta Personalizada Verde',
            quantidade: 2,
            valor: 69.80,
            status: 'costura',
            dataRecebimento: '2024-01-14 16:00',
            temEstoque: true,
            posicaoEstoque: 'C1-020',
            quantidadeDisponivel: 6,
            arteUpload: {
                arquivo: 'arte_pcvd037_001.jpg',
                dataUpload: '2024-01-14 17:15',
                usuario: 'Designer1',
                status: 'impressa'
            },
            impressora: 'Epson_L3150_01',
            observacoes: 'Arte impressa, enviado para costura'
        },
        {
            id: 'ML006',
            marketplace: 'mercadolivre',
            sku: 'PCRS039',
            cliente: 'Lucia Ferreira',
            produto: 'Camiseta Personalizada Rosa',
            quantidade: 1,
            valor: 39.90,
            status: 'expedicao',
            dataRecebimento: '2024-01-14 08:30',
            temEstoque: true,
            posicaoEstoque: 'A1-025',
            quantidadeDisponivel: 10,
            arteUpload: {
                arquivo: 'arte_pcrs039_001.png',
                dataUpload: '2024-01-14 09:45',
                usuario: 'Designer2',
                status: 'finalizada'
            },
            impressora: 'Canon_G3110_02',
            observacoes: 'Produto finalizado, aguardando expedição'
        }
    ],

    // Status dos pedidos
    statusPedidos: {
        'pendente': {
            label: 'Pendente',
            cor: '#f59e0b',
            icone: 'fas fa-clock',
            descricao: 'Aguardando processamento'
        },
        'aguardando_arte': {
            label: 'Aguardando Arte',
            cor: '#8b5cf6',
            icone: 'fas fa-palette',
            descricao: 'Aguardando upload da arte'
        },
        'sem_estoque': {
            label: 'Sem Estoque',
            cor: '#ef4444',
            icone: 'fas fa-exclamation-triangle',
            descricao: 'Produto indisponível no estoque'
        },
        'producao': {
            label: 'Produção',
            cor: '#06b6d4',
            icone: 'fas fa-cogs',
            descricao: 'Em processo de produção'
        },
        'costura': {
            label: 'Costura',
            cor: '#10b981',
            icone: 'fas fa-cut',
            descricao: 'Na etapa de costura'
        },
        'expedicao': {
            label: 'Expedição',
            cor: '#6366f1',
            icone: 'fas fa-shipping-fast',
            descricao: 'Pronto para expedição'
        },
        'enviado': {
            label: 'Enviado',
            cor: '#059669',
            icone: 'fas fa-check-circle',
            descricao: 'Pedido enviado ao cliente'
        }
    },

    // Impressoras disponíveis
    impressoras: [
        {
            id: 'epson_l3150_01',
            nome: 'Epson L3150 #01',
            tipo: 'inkjet',
            status: 'disponivel',
            localizacao: 'Setor A - Mesa 1',
            filaImpressao: 2,
            ultimaManutencao: '2024-01-10',
            nivelTinta: {
                preto: 85,
                ciano: 72,
                magenta: 68,
                amarelo: 91
            }
        },
        {
            id: 'canon_g3110_02',
            nome: 'Canon G3110 #02',
            tipo: 'inkjet',
            status: 'em_uso',
            localizacao: 'Setor B - Mesa 2',
            filaImpressao: 1,
            ultimaManutencao: '2024-01-12',
            nivelTinta: {
                preto: 45,
                ciano: 38,
                magenta: 52,
                amarelo: 41
            }
        },
        {
            id: 'hp_deskjet_03',
            nome: 'HP DeskJet #03',
            tipo: 'inkjet',
            status: 'manutencao',
            localizacao: 'Setor A - Mesa 3',
            filaImpressao: 0,
            ultimaManutencao: '2024-01-08',
            nivelTinta: {
                preto: 15,
                ciano: 8,
                magenta: 12,
                amarelo: 20
            }
        }
    ],

    // Histórico de transações
    historicoTransacoes: [
        {
            id: 1,
            data: '2024-01-15 15:30',
            pedidoId: 'ML004',
            acao: 'upload_arte',
            usuario: 'Designer2',
            detalhes: 'Upload da arte: arte_pcbr035_001.pdf',
            status: 'sucesso'
        },
        {
            id: 2,
            data: '2024-01-15 14:45',
            pedidoId: 'ML004',
            acao: 'baixa_estoque',
            usuario: 'Sistema',
            detalhes: 'Baixa automática no estoque: 1 unidade de PCBR035',
            status: 'sucesso'
        },
        {
            id: 3,
            data: '2024-01-15 14:20',
            pedidoId: 'ML004',
            acao: 'novo_pedido',
            usuario: 'Sistema',
            detalhes: 'Novo pedido recebido do Mercado Livre',
            status: 'sucesso'
        },
        {
            id: 4,
            data: '2024-01-15 11:00',
            pedidoId: 'ML002',
            acao: 'upload_arte',
            usuario: 'Designer1',
            detalhes: 'Upload da arte: arte_pcaz031_001.png',
            status: 'sucesso'
        },
        {
            id: 5,
            data: '2024-01-15 10:30',
            pedidoId: 'ML002',
            acao: 'verificacao_estoque',
            usuario: 'Sistema',
            detalhes: 'Verificação de estoque: 8 unidades disponíveis em A2-010',
            status: 'sucesso'
        },
        {
            id: 6,
            data: '2024-01-14 17:15',
            pedidoId: 'SHP005',
            acao: 'impressao_concluida',
            usuario: 'Sistema',
            detalhes: 'Impressão concluída na Epson L3150 #01',
            status: 'sucesso'
        },
        {
            id: 7,
            data: '2024-01-14 16:30',
            pedidoId: 'SHP005',
            acao: 'envio_impressao',
            usuario: 'Operador1',
            detalhes: 'Arte enviada para impressão na Epson L3150 #01',
            status: 'sucesso'
        }
    ],

    // Relatórios de upload de artes
    relatoriosArtes: [
        {
            id: 1,
            arquivo: 'arte_pcaz031_001.png',
            pedidoId: 'ML002',
            sku: 'PCAZ031',
            dataUpload: '2024-01-15 11:00',
            usuario: 'Designer1',
            tamanhoArquivo: '2.5 MB',
            resolucao: '300 DPI',
            formato: 'PNG',
            status: 'aprovada',
            observacoes: 'Arte aprovada pelo cliente via WhatsApp'
        },
        {
            id: 2,
            arquivo: 'arte_pcbr035_001.pdf',
            pedidoId: 'ML004',
            sku: 'PCBR035',
            dataUpload: '2024-01-15 15:30',
            usuario: 'Designer2',
            tamanhoArquivo: '1.8 MB',
            resolucao: '300 DPI',
            formato: 'PDF',
            status: 'em_impressao',
            observacoes: 'Arte vetorial, qualidade excelente'
        },
        {
            id: 3,
            arquivo: 'arte_pcvd037_001.jpg',
            pedidoId: 'SHP005',
            sku: 'PCVD037',
            dataUpload: '2024-01-14 17:15',
            usuario: 'Designer1',
            tamanhoArquivo: '3.2 MB',
            resolucao: '300 DPI',
            formato: 'JPG',
            status: 'impressa',
            observacoes: 'Arte com cores vibrantes, impressão perfeita'
        },
        {
            id: 4,
            arquivo: 'arte_pcrs039_001.png',
            pedidoId: 'ML006',
            sku: 'PCRS039',
            dataUpload: '2024-01-14 09:45',
            usuario: 'Designer2',
            tamanhoArquivo: '2.1 MB',
            resolucao: '300 DPI',
            formato: 'PNG',
            status: 'finalizada',
            observacoes: 'Arte finalizada, produto pronto para expedição'
        }
    ],

    // Métricas para dashboard
    metricas: {
        pedidosHoje: 6,
        pedidosPendentes: 2,
        pedidosProducao: 3,
        pedidosSemEstoque: 1,
        artesUploadHoje: 2,
        impressorasAtivas: 2,
        impressorasManutencao: 1,
        valorTotalPedidos: 324.10,
        tempoMedioProcessamento: '2.5 horas',
        taxaSucesso: 92.5
    },

    // Configurações dos marketplaces
    configMarketplaces: {
        shopee: {
            nome: 'Shopee',
            ativo: true,
            apiKey: 'shopee_api_key_demo',
            ultimaSync: '2024-01-15 16:00',
            pedidosImportados: 156,
            cor: '#ee4d2d'
        },
        mercadolivre: {
            nome: 'Mercado Livre',
            ativo: true,
            apiKey: 'ml_api_key_demo',
            ultimaSync: '2024-01-15 16:05',
            pedidosImportados: 203,
            cor: '#fff159'
        }
    }
};

// Função para integração com o módulo de estoque
function verificarEstoque(sku) {
    // Esta função seria integrada com o sistema de estoque existente
    // Por enquanto, simulamos a verificação
    const item = stockData.items.find(item => item.code === sku);
    
    if (item) {
        return {
            disponivel: item.quantity > 0,
            quantidade: item.quantity,
            posicao: `${item.shelf}-${item.position}`,
            status: item.status
        };
    }
    
    return {
        disponivel: false,
        quantidade: 0,
        posicao: null,
        status: 'nao_encontrado'
    };
}

// Função para baixa automática no estoque
function baixaAutomaticaEstoque(sku, quantidade, pedidoId) {
    // Esta função seria integrada com o sistema de estoque existente
    const item = stockData.items.find(item => item.code === sku);
    
    if (item && item.quantity >= quantidade) {
        // Reduzir quantidade no estoque
        item.quantity -= quantidade;
        
        // Atualizar status do item
        if (item.quantity === 0) {
            item.status = 'esgotado';
        } else if (item.quantity <= item.minStock) {
            item.status = 'baixo';
        }
        
        // Registrar movimentação no estoque
        const movimento = {
            id: stockData.movements.length + 1,
            date: new Date().toISOString().slice(0, 19).replace('T', ' '),
            type: 'saida',
            itemId: item.id,
            itemName: item.name,
            quantity: quantidade,
            reason: 'venda',
            user: 'Sistema - Pedidos',
            observations: `Baixa automática - Pedido: ${pedidoId}`,
            ip: '192.168.1.100'
        };
        
        stockData.movements.unshift(movimento);
        
        // Registrar no histórico de transações
        pedidosData.historicoTransacoes.unshift({
            id: pedidosData.historicoTransacoes.length + 1,
            data: new Date().toISOString().slice(0, 19).replace('T', ' '),
            pedidoId: pedidoId,
            acao: 'baixa_estoque_automatica',
            usuario: 'Sistema',
            detalhes: `Baixa automática: ${quantidade} unidade(s) de ${sku}`,
            status: 'sucesso'
        });
        
        return {
            sucesso: true,
            novaQuantidade: item.quantity,
            mensagem: `Baixa realizada com sucesso. Nova quantidade: ${item.quantity}`
        };
    }
    
    return {
        sucesso: false,
        novaQuantidade: item ? item.quantity : 0,
        mensagem: 'Quantidade insuficiente no estoque ou item não encontrado'
    };
}

// Função para atualizar status do pedido
function atualizarStatusPedido(pedidoId, novoStatus, observacoes = '') {
    const pedido = pedidosData.marketplacePedidos.find(p => p.id === pedidoId);
    
    if (pedido) {
        const statusAnterior = pedido.status;
        pedido.status = novoStatus;
        
        if (observacoes) {
            pedido.observacoes = observacoes;
        }
        
        // Registrar no histórico
        pedidosData.historicoTransacoes.unshift({
            id: pedidosData.historicoTransacoes.length + 1,
            data: new Date().toISOString().slice(0, 19).replace('T', ' '),
            pedidoId: pedidoId,
            acao: 'mudanca_status',
            usuario: 'Sistema',
            detalhes: `Status alterado de "${statusAnterior}" para "${novoStatus}"`,
            status: 'sucesso'
        });
        
        // Se o status mudou para produção, fazer baixa automática no estoque
        if (novoStatus === 'producao' && pedido.temEstoque) {
            baixaAutomaticaEstoque(pedido.sku, pedido.quantidade, pedidoId);
        }
        
        return true;
    }
    
    return false;
}

// Exportar dados para uso global
if (typeof window !== 'undefined') {
    window.pedidosData = pedidosData;
    window.verificarEstoque = verificarEstoque;
    window.baixaAutomaticaEstoque = baixaAutomaticaEstoque;
    window.atualizarStatusPedido = atualizarStatusPedido;
}

