// Dados de exemplo para o sistema
window.sampleData = {
    // Dados de estoque
    estoque: [
        {
            id: 1,
            sku: 'PCRV029',
            descricao: 'Camiseta Personalizada Rosa Vintage',
            posicao: 'A1-15',
            quantidade: 45,
            status: 'disponivel',
            categoria: 'Camisetas',
            preco: 29.90,
            ultimaMovimentacao: '2024-10-10T14:30:00Z'
        },
        {
            id: 2,
            sku: 'KDDN001',
            descricao: 'Caneca Decorativa Dourada',
            posicao: 'B2-08',
            quantidade: 12,
            status: 'baixo',
            categoria: 'Canecas',
            preco: 19.90,
            ultimaMovimentacao: '2024-10-09T16:45:00Z'
        },
        {
            id: 3,
            sku: 'ABCD123',
            descricao: 'Almofada Bordada Colorida',
            posicao: 'C3-22',
            quantidade: 78,
            status: 'disponivel',
            categoria: 'Almofadas',
            preco: 39.90,
            ultimaMovimentacao: '2024-10-10T09:15:00Z'
        },
        {
            id: 4,
            sku: 'XPTO456',
            descricao: 'Quadro Personalizado Família',
            posicao: 'D1-05',
            quantidade: 23,
            status: 'disponivel',
            categoria: 'Quadros',
            preco: 89.90,
            ultimaMovimentacao: '2024-10-08T11:20:00Z'
        }
    ],

    // Dados de pedidos
    pedidos: [
        {
            id: 12345,
            sku: 'PCRV029',
            quantidade: 2,
            marketplace: 'Shopee',
            cliente: 'João Silva',
            endereco: 'Rua das Flores, 123 - São Paulo, SP',
            status: 'aguardando',
            dataEntrega: '2024-10-12',
            tipoEntrega: 'normal',
            valor: 59.80,
            dataPedido: '2024-10-10T10:30:00Z'
        },
        {
            id: 12346,
            sku: 'KDDN001',
            quantidade: 1,
            marketplace: 'Mercado Livre',
            cliente: 'Maria Santos',
            endereco: 'Av. Principal, 456 - Rio de Janeiro, RJ',
            status: 'producao',
            dataEntrega: '2024-10-11',
            tipoEntrega: 'motoboy',
            valor: 19.90,
            dataPedido: '2024-10-09T15:45:00Z'
        },
        {
            id: 12347,
            sku: 'ABCD123',
            quantidade: 3,
            marketplace: 'Magalu',
            cliente: 'Pedro Costa',
            endereco: 'Rua Central, 789 - Belo Horizonte, MG',
            status: 'confirmado',
            dataEntrega: '2024-10-13',
            tipoEntrega: 'normal',
            valor: 119.70,
            dataPedido: '2024-10-10T08:20:00Z'
        }
    ],

    // Dados de produção
    producao: [
        {
            id: 1,
            pedidoId: 12345,
            sku: 'PCRV029',
            quantidade: 2,
            dataEntrega: '2024-10-12',
            tipoEntrega: 'normal',
            status: 'fila',
            iniciadoEm: null,
            finalizadoEm: null,
            usuario: null,
            observacoes: ''
        },
        {
            id: 2,
            pedidoId: 12346,
            sku: 'KDDN001',
            quantidade: 1,
            dataEntrega: '2024-10-11',
            tipoEntrega: 'motoboy',
            status: 'fila',
            iniciadoEm: null,
            finalizadoEm: null,
            usuario: null,
            observacoes: 'Urgente - Motoboy'
        }
    ],

    // Dados de costura
    costura: [
        {
            id: 1,
            sku: 'PCRV029',
            quantidade: 2,
            status: 'fila',
            usuario: null,
            iniciadoEm: null,
            finalizadoEm: null,
            tipo: 'PV'
        }
    ],

    // Dados de expedição
    expedicao: [
        {
            id: 1,
            pedidoId: 12344,
            sku: 'XPTO789',
            cliente: 'Pedro Costa',
            endereco: 'Rua Central, 789 - Belo Horizonte, MG',
            status: 'conferencia1',
            etapaAtual: 1,
            totalEtapas: 3,
            codigoRastreamento: null,
            dataEnvio: null
        }
    ],

    // Dados de usuários
    usuarios: [
        {
            id: 1,
            nome: 'Admin Master',
            email: 'admin@sistema.com',
            perfil: 'admin-master',
            status: 'ativo',
            ultimoAcesso: '2024-10-10T16:30:00Z',
            dataCriacao: '2024-01-01T00:00:00Z'
        },
        {
            id: 2,
            nome: 'João Silva',
            email: 'joao@sistema.com',
            perfil: 'usuario-estoque',
            status: 'ativo',
            ultimoAcesso: '2024-10-10T14:15:00Z',
            dataCriacao: '2024-02-15T00:00:00Z'
        },
        {
            id: 3,
            nome: 'Maria Santos',
            email: 'maria@sistema.com',
            perfil: 'usuario-costura',
            status: 'ativo',
            ultimoAcesso: '2024-10-10T13:45:00Z',
            dataCriacao: '2024-03-10T00:00:00Z'
        },
        {
            id: 4,
            nome: 'Pedro Costa',
            email: 'pedro@sistema.com',
            perfil: 'admin-producao',
            status: 'ativo',
            ultimoAcesso: '2024-10-10T12:20:00Z',
            dataCriacao: '2024-04-05T00:00:00Z'
        }
    ],

    // Dados de movimentações de estoque
    movimentacoes: [
        {
            id: 1,
            sku: 'PCRV029',
            tipo: 'entrada',
            quantidade: 50,
            motivo: 'Compra',
            usuario: 'João Silva',
            data: '2024-10-08T10:00:00Z',
            observacoes: 'Lote 001 - Fornecedor ABC'
        },
        {
            id: 2,
            sku: 'PCRV029',
            tipo: 'saida',
            quantidade: 5,
            motivo: 'Venda',
            usuario: 'João Silva',
            data: '2024-10-10T14:30:00Z',
            observacoes: 'Pedido #12345'
        },
        {
            id: 3,
            sku: 'KDDN001',
            tipo: 'entrada',
            quantidade: 20,
            motivo: 'Compra',
            usuario: 'João Silva',
            data: '2024-10-07T15:30:00Z',
            observacoes: 'Lote 002 - Fornecedor XYZ'
        },
        {
            id: 4,
            sku: 'KDDN001',
            tipo: 'saida',
            quantidade: 8,
            motivo: 'Venda',
            usuario: 'João Silva',
            data: '2024-10-09T16:45:00Z',
            observacoes: 'Pedidos diversos'
        }
    ],

    // Dados de banco de imagens
    bancoImagens: [
        {
            sku: 'PCRV029',
            totalImagens: 4,
            imagens: [
                'pcrv029_frente.jpg',
                'pcrv029_verso.jpg',
                'pcrv029_detalhe1.jpg',
                'pcrv029_detalhe2.jpg'
            ],
            impressora: null,
            status: 'disponivel',
            ultimaAtualizacao: '2024-10-05T10:00:00Z'
        },
        {
            sku: 'KDDN001',
            totalImagens: 6,
            imagens: [
                'kddn001_frente.jpg',
                'kddn001_verso.jpg',
                'kddn001_lateral1.jpg',
                'kddn001_lateral2.jpg',
                'kddn001_detalhe1.jpg',
                'kddn001_detalhe2.jpg'
            ],
            impressora: 'imp1',
            status: 'processando',
            ultimaAtualizacao: '2024-10-10T09:30:00Z'
        }
    ],

    // Estatísticas do dashboard
    estatisticas: {
        estoque: {
            totalItens: 1234,
            estoquesBaixos: 23,
            entradasHoje: 156,
            saidasHoje: 89
        },
        pedidos: {
            pedidosHoje: 89,
            pedidosProcessando: 45,
            pedidosFinalizados: 234,
            faturamentoHoje: 2847.50
        },
        producao: {
            filaProducao: 45,
            produzidosHoje: 67,
            eficienciaMedia: 92.5,
            tempoMedioProducao: 2.3
        },
        expedicao: {
            paraExpedicao: 23,
            enviadosHoje: 34,
            entregasHoje: 28,
            taxaEntrega: 98.2
        }
    }
};

// Funções utilitárias para manipular os dados
window.dataUtils = {
    // Busca item no estoque por SKU
    getEstoqueItem: function(sku) {
        return window.sampleData.estoque.find(item => item.sku === sku);
    },

    // Busca pedidos por status
    getPedidosByStatus: function(status) {
        return window.sampleData.pedidos.filter(pedido => pedido.status === status);
    },

    // Busca pedidos por marketplace
    getPedidosByMarketplace: function(marketplace) {
        return window.sampleData.pedidos.filter(pedido => pedido.marketplace === marketplace);
    },

    // Busca movimentações por SKU
    getMovimentacoesBySku: function(sku) {
        return window.sampleData.movimentacoes.filter(mov => mov.sku === sku);
    },

    // Calcula estatísticas em tempo real
    calcularEstatisticas: function() {
        const hoje = new Date().toISOString().split('T')[0];
        
        return {
            totalEstoque: window.sampleData.estoque.reduce((total, item) => total + item.quantidade, 0),
            pedidosHoje: window.sampleData.pedidos.filter(p => p.dataPedido.startsWith(hoje)).length,
            filaProducao: window.sampleData.producao.filter(p => p.status === 'fila').length,
            paraExpedicao: window.sampleData.expedicao.length
        };
    },

    // Formata data para exibição
    formatarData: function(dataISO) {
        return new Date(dataISO).toLocaleDateString('pt-BR');
    },

    // Formata data e hora para exibição
    formatarDataHora: function(dataISO) {
        return new Date(dataISO).toLocaleString('pt-BR');
    },

    // Formata valor monetário
    formatarMoeda: function(valor) {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        }).format(valor);
    },

    // Gera cor baseada no status
    getStatusColor: function(status) {
        const colors = {
            'disponivel': 'success',
            'baixo': 'warning',
            'indisponivel': 'danger',
            'aguardando': 'warning',
            'producao': 'info',
            'confirmado': 'success',
            'finalizado': 'success',
            'cancelado': 'danger',
            'ativo': 'success',
            'inativo': 'secondary'
        };
        return colors[status] || 'secondary';
    },

    // Gera badge HTML para status
    getStatusBadge: function(status, texto) {
        const color = this.getStatusColor(status);
        return `<span class="badge badge-${color}">${texto || status}</span>`;
    }
};

