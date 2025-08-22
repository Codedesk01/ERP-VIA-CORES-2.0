// Script principal do sistema
document.addEventListener('DOMContentLoaded', function() {
    // Inicializa todos os sistemas
    initializeSystems();
    
    // Configura event listeners
    setupEventListeners();
    
    // Configura responsividade
    setupResponsive();
});

// Inicializa todos os sistemas
function initializeSystems() {
    // Inicializa sistema de autenticação
    if (window.authSystem) {
        window.authSystem.init();
    }
    
    // Inicializa sistema de permissões
    if (window.permissionSystem) {
        window.permissionSystem.init();
    }
    
    // Inicializa sistema de módulos
    if (window.moduleSystem) {
        window.moduleSystem.init();
    }
}

// Configura event listeners
function setupEventListeners() {
    // Toggle do menu lateral
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.toggle('collapsed');
        });
    }

    // Dropdown do usuário
    const userAvatar = document.getElementById('userAvatar');
    const userDropdown = document.getElementById('userDropdown');
    
    if (userAvatar && userDropdown) {
        userAvatar.addEventListener('click', function(e) {
            e.stopPropagation();
            userDropdown.classList.toggle('show');
        });

        // Fecha dropdown ao clicar fora
        document.addEventListener('click', function() {
            userDropdown.classList.remove('show');
        });

        // Previne fechamento ao clicar dentro do dropdown
        userDropdown.addEventListener('click', function(e) {
            e.stopPropagation();
        });
    }

    // Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (window.authSystem) {
                if (confirm('Tem certeza que deseja sair?')) {
                    window.authSystem.logout();
                }
            }
        });
    }

    // Links do perfil e configurações
    const profileLink = document.getElementById('profileLink');
    const settingsLink = document.getElementById('settingsLink');
    
    if (profileLink) {
        profileLink.addEventListener('click', function(e) {
            e.preventDefault();
            showModal('Perfil do Usuário', getProfileContent());
        });
    }
    
    if (settingsLink) {
        settingsLink.addEventListener('click', function(e) {
            e.preventDefault();
            showModal('Configurações', getSettingsContent());
        });
    }

    // Listener para mudanças de permissões
    document.addEventListener('permissionsUpdated', function(e) {
        const { user, profile } = e.detail;
        console.log('Permissões atualizadas:', user, profile);
        
        // Atualiza elementos da interface baseado nas novas permissões
        updateUIBasedOnPermissions(user);
    });
}

// Configura responsividade
function setupResponsive() {
    const sidebar = document.getElementById('sidebar');
    const menuToggle = document.getElementById('menuToggle');
    
    // Função para verificar se é mobile
    function isMobile() {
        return window.innerWidth <= 768;
    }
    
    // Função para atualizar layout responsivo
    function updateResponsiveLayout() {
        if (isMobile()) {
            sidebar.classList.add('mobile');
            // Em mobile, sidebar começa fechada
            if (!sidebar.classList.contains('show')) {
                sidebar.style.transform = 'translateX(-100%)';
            }
        } else {
            sidebar.classList.remove('mobile');
            sidebar.style.transform = '';
        }
    }
    
    // Listener para redimensionamento
    window.addEventListener('resize', updateResponsiveLayout);
    
    // Configuração inicial
    updateResponsiveLayout();
    
    // Toggle para mobile
    if (menuToggle) {
        menuToggle.addEventListener('click', function() {
            if (isMobile()) {
                sidebar.classList.toggle('show');
                if (sidebar.classList.contains('show')) {
                    sidebar.style.transform = 'translateX(0)';
                } else {
                    sidebar.style.transform = 'translateX(-100%)';
                }
            }
        });
    }
    
    // Fecha sidebar em mobile ao clicar em um link
    document.addEventListener('click', function(e) {
        if (isMobile() && e.target.closest('.nav-link')) {
            sidebar.classList.remove('show');
            sidebar.style.transform = 'translateX(-100%)';
        }
    });
}

// Atualiza UI baseado nas permissões
function updateUIBasedOnPermissions(user) {
    // Atualiza estatísticas do dashboard baseado nas permissões
    const statsCards = document.querySelectorAll('.stat-card');
    
    if (user && user.permissions) {
        statsCards.forEach(card => {
            const icon = card.querySelector('i');
            if (icon) {
                // Mostra/oculta cards baseado nas permissões
                if (icon.classList.contains('fa-boxes') && !user.permissions.includes('estoque')) {
                    card.style.display = 'none';
                } else if (icon.classList.contains('fa-shopping-cart') && !user.permissions.includes('pedidos')) {
                    card.style.display = 'none';
                } else if (icon.classList.contains('fa-industry') && !user.permissions.includes('producao')) {
                    card.style.display = 'none';
                } else if (icon.classList.contains('fa-shipping-fast') && !user.permissions.includes('expedicao')) {
                    card.style.display = 'none';
                } else {
                    card.style.display = 'flex';
                }
            }
        });
    }
}

// Mostra modal
function showModal(title, content) {
    // Remove modal existente
    const existingModal = document.getElementById('systemModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Cria novo modal
    const modal = document.createElement('div');
    modal.id = 'systemModal';
    modal.innerHTML = `
        <div class="modal-overlay" style="
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        ">
            <div class="modal-content" style="
                background: white;
                border-radius: 8px;
                padding: 2rem;
                max-width: 500px;
                width: 90%;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            ">
                <div class="modal-header" style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 1.5rem;
                    padding-bottom: 1rem;
                    border-bottom: 1px solid #e2e8f0;
                ">
                    <h3 style="margin: 0; color: #1e293b;">${title}</h3>
                    <button class="modal-close" style="
                        background: none;
                        border: none;
                        font-size: 1.5rem;
                        cursor: pointer;
                        color: #64748b;
                    ">&times;</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Event listeners para fechar modal
    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    modal.querySelector('.modal-overlay').addEventListener('click', (e) => {
        if (e.target === e.currentTarget) {
            modal.remove();
        }
    });
    
    // Fecha com ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            modal.remove();
        }
    });
}

// Conteúdo do modal de perfil
function getProfileContent() {
    const user = window.permissionSystem?.getCurrentUser();
    
    return `
        <div class="profile-info">
            <div style="text-align: center; margin-bottom: 2rem;">
                <i class="fas fa-user-circle" style="font-size: 4rem; color: #2563eb; margin-bottom: 1rem;"></i>
                <h4>${user?.name || 'Usuário'}</h4>
                <p style="color: #64748b;">Nível: ${user?.level === 'master' ? 'Admin Master' : user?.level === 'admin' ? 'Administrador' : 'Usuário'}</p>
            </div>
            
            <div class="profile-details">
                <h5>Permissões:</h5>
                <div style="display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1.5rem;">
                    ${user?.permissions.map(perm => `
                        <span style="
                            background: #e0f2fe;
                            color: #0277bd;
                            padding: 0.25rem 0.75rem;
                            border-radius: 20px;
                            font-size: 0.875rem;
                        ">${perm}</span>
                    `).join('') || '<span>Nenhuma permissão</span>'}
                </div>
                
                <h5>Informações da Sessão:</h5>
                <p><strong>Login:</strong> ${new Date(parseInt(localStorage.getItem('loginTime') || '0')).toLocaleString('pt-BR')}</p>
                <p><strong>Perfil Ativo:</strong> ${window.permissionSystem?.getCurrentProfile()}</p>
            </div>
        </div>
    `;
}

// Conteúdo do modal de configurações
function getSettingsContent() {
    return `
        <div class="settings-content">
            <h5>Configurações do Sistema</h5>
            
            <div class="form-group">
                <label>Tema:</label>
                <select class="form-control">
                    <option>Claro</option>
                    <option>Escuro</option>
                    <option>Automático</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>Idioma:</label>
                <select class="form-control">
                    <option>Português (BR)</option>
                    <option>English</option>
                    <option>Español</option>
                </select>
            </div>
            
            <div class="form-group">
                <label>
                    <input type="checkbox" checked> Notificações por email
                </label>
            </div>
            
            <div class="form-group">
                <label>
                    <input type="checkbox" checked> Notificações no navegador
                </label>
            </div>
            
            <div style="margin-top: 2rem; text-align: right;">
                <button class="btn btn-secondary" onclick="document.getElementById('systemModal').remove()">Cancelar</button>
                <button class="btn btn-primary" onclick="alert('Configurações salvas!'); document.getElementById('systemModal').remove()">Salvar</button>
            </div>
        </div>
    `;
}

// Utilitários
function formatDate(date) {
    return new Date(date).toLocaleDateString('pt-BR');
}

function formatDateTime(date) {
    return new Date(date).toLocaleString('pt-BR');
}

function formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(value);
}

// Função para mostrar notificações
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : type === 'warning' ? '#f59e0b' : '#06b6d4'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 10001;
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Anima entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove após 5 segundos
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Exporta funções globais
window.showModal = showModal;
window.showNotification = showNotification;

