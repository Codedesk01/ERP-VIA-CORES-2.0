// Sistema de Permissões
class PermissionSystem {
    constructor() {
        this.userProfiles = {
            'admin-master': {
                name: 'Admin Master',
                permissions: ['admin', 'estoque', 'pedidos', 'banco-imagens', 'producao', 'costura', 'expedicao', 'relatorios'],
                level: 'master'
            },
            'admin-producao': {
                name: 'Admin Produção',
                permissions: ['producao', 'costura', 'expedicao', 'relatorios'],
                level: 'admin'
            },
            'usuario-estoque': {
                name: 'Usuário Estoque',
                permissions: ['estoque'],
                level: 'user',
                restrictions: {
                    'estoque': ['movimentacoes'] // Não pode acessar movimentações
                }
            },
            'usuario-pedidos': {
                name: 'Usuário Pedidos',
                permissions: ['pedidos', 'banco-imagens'],
                level: 'user'
            },
            'usuario-costura': {
                name: 'Usuário Costura',
                permissions: ['costura'],
                level: 'user'
            }
        };
        
        this.currentUser = null;
        this.currentProfile = 'admin-master';
    }

    // Define o perfil atual do usuário
    setUserProfile(profileId) {
        if (this.userProfiles[profileId]) {
            this.currentProfile = profileId;
            this.currentUser = this.userProfiles[profileId];
            this.updateUI();
            return true;
        }
        return false;
    }

    // Verifica se o usuário tem permissão para um módulo
    hasPermission(module) {
        if (!this.currentUser) return false;
        return this.currentUser.permissions.includes(module);
    }

    // Verifica se o usuário tem restrições em um submódulo
    hasRestriction(module, submodule) {
        if (!this.currentUser || !this.currentUser.restrictions) return false;
        const moduleRestrictions = this.currentUser.restrictions[module];
        return moduleRestrictions && moduleRestrictions.includes(submodule);
    }

    // Atualiza a interface baseada nas permissões
    updateUI() {
        const navItems = document.querySelectorAll('.nav-item[data-permission]');
        const userName = document.getElementById('userName');
        
        // Atualiza o nome do usuário
        if (userName && this.currentUser) {
            userName.textContent = this.currentUser.name;
        }

        // Mostra/oculta itens do menu baseado nas permissões
        navItems.forEach(item => {
            const permission = item.getAttribute('data-permission');
            if (this.hasPermission(permission)) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });

        // Dispara evento para outros componentes
        document.dispatchEvent(new CustomEvent('permissionsUpdated', {
            detail: {
                user: this.currentUser,
                profile: this.currentProfile
            }
        }));
    }

    // Obtém o perfil atual
    getCurrentProfile() {
        return this.currentProfile;
    }

    // Obtém o usuário atual
    getCurrentUser() {
        return this.currentUser;
    }

    // Obtém todas as permissões do usuário atual
    getUserPermissions() {
        return this.currentUser ? this.currentUser.permissions : [];
    }

    // Verifica se é admin master
    isAdminMaster() {
        return this.currentUser && this.currentUser.level === 'master';
    }

    // Verifica se é admin de setor
    isAdmin() {
        return this.currentUser && (this.currentUser.level === 'admin' || this.currentUser.level === 'master');
    }

    // Inicializa o sistema
    init() {
        this.setUserProfile(this.currentProfile);
        
        // Listener para mudança de perfil
        const profileSelect = document.getElementById('profileSelect');
        if (profileSelect) {
            profileSelect.addEventListener('change', (e) => {
                this.setUserProfile(e.target.value);
            });
        }
    }
}

// Instância global do sistema de permissões
window.permissionSystem = new PermissionSystem();

