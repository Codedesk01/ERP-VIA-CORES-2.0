// Sistema de Autenticação
class AuthSystem {
    constructor() {
        this.isAuthenticated = false;
        this.sessionTimeout = 30 * 60 * 1000; // 30 minutos
        this.sessionTimer = null;
        this.loginAttempts = 0;
        this.maxLoginAttempts = 3;
        this.lockoutTime = 5 * 60 * 1000; // 5 minutos
        
        // Usuários de teste
        this.testUsers = {
            'admin': {
                password: 'admin123',
                profile: 'admin-master',
                name: 'Admin Master'
            },
            'producao': {
                password: 'prod123',
                profile: 'admin-producao',
                name: 'Admin Produção'
            },
            'estoque': {
                password: 'est123',
                profile: 'usuario-estoque',
                name: 'Usuário Estoque'
            },
            'pedidos': {
                password: 'ped123',
                profile: 'usuario-pedidos',
                name: 'Usuário Pedidos'
            },
            'costura': {
                password: 'cos123',
                profile: 'usuario-costura',
                name: 'Usuário Costura'
            }
        };
    }

    // Simula o processo de login
    async login(username, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Verifica se está bloqueado
                if (this.isLockedOut()) {
                    reject(new Error('Muitas tentativas de login. Tente novamente em 5 minutos.'));
                    return;
                }

                // Verifica credenciais
                const user = this.testUsers[username.toLowerCase()];
                if (user && user.password === password) {
                    this.isAuthenticated = true;
                    this.loginAttempts = 0;
                    
                    // Define o perfil do usuário
                    if (window.permissionSystem) {
                        window.permissionSystem.setUserProfile(user.profile);
                    }
                    
                    // Inicia o timer de sessão
                    this.startSessionTimer();
                    
                    // Salva no localStorage para persistência
                    localStorage.setItem('isAuthenticated', 'true');
                    localStorage.setItem('userProfile', user.profile);
                    localStorage.setItem('loginTime', Date.now().toString());
                    
                    // Log da ação
                    this.logAction('login', `Usuário ${username} fez login`);
                    
                    resolve({
                        success: true,
                        user: user,
                        message: 'Login realizado com sucesso!'
                    });
                } else {
                    this.loginAttempts++;
                    this.logAction('login_failed', `Tentativa de login falhada para usuário ${username}`);
                    
                    if (this.loginAttempts >= this.maxLoginAttempts) {
                        localStorage.setItem('lockoutTime', Date.now().toString());
                        reject(new Error('Muitas tentativas de login. Conta bloqueada por 5 minutos.'));
                    } else {
                        reject(new Error(`Credenciais inválidas. ${this.maxLoginAttempts - this.loginAttempts} tentativas restantes.`));
                    }
                }
            }, 1000); // Simula delay de rede
        });
    }

    // Logout
    logout() {
        this.isAuthenticated = false;
        this.clearSessionTimer();
        
        // Remove dados do localStorage
        localStorage.removeItem('isAuthenticated');
        localStorage.removeItem('userProfile');
        localStorage.removeItem('loginTime');
        
        // Log da ação
        this.logAction('logout', 'Usuário fez logout');
        
        // Redireciona para login
        this.redirectToLogin();
    }

    // Verifica se está autenticado
    checkAuth() {
        const stored = localStorage.getItem('isAuthenticated');
        const loginTime = localStorage.getItem('loginTime');
        const userProfile = localStorage.getItem('userProfile');
        
        if (stored === 'true' && loginTime && userProfile) {
            const elapsed = Date.now() - parseInt(loginTime);
            
            // Verifica se a sessão não expirou
            if (elapsed < this.sessionTimeout) {
                this.isAuthenticated = true;
                
                // Restaura o perfil do usuário
                if (window.permissionSystem) {
                    window.permissionSystem.setUserProfile(userProfile);
                }
                
                // Reinicia o timer de sessão
                this.startSessionTimer();
                return true;
            } else {
                // Sessão expirada
                this.logout();
                return false;
            }
        }
        
        return false;
    }

    // Verifica se está bloqueado
    isLockedOut() {
        const lockoutTime = localStorage.getItem('lockoutTime');
        if (lockoutTime) {
            const elapsed = Date.now() - parseInt(lockoutTime);
            if (elapsed < this.lockoutTime) {
                return true;
            } else {
                localStorage.removeItem('lockoutTime');
                this.loginAttempts = 0;
            }
        }
        return false;
    }

    // Inicia o timer de sessão
    startSessionTimer() {
        this.clearSessionTimer();
        this.sessionTimer = setTimeout(() => {
            alert('Sua sessão expirou. Você será redirecionado para o login.');
            this.logout();
        }, this.sessionTimeout);
    }

    // Limpa o timer de sessão
    clearSessionTimer() {
        if (this.sessionTimer) {
            clearTimeout(this.sessionTimer);
            this.sessionTimer = null;
        }
    }

    // Redireciona para login
    redirectToLogin() {
        window.location.href = 'index.html';
    }

    // Log de ações
    logAction(action, description) {
        const log = {
            timestamp: new Date().toISOString(),
            action: action,
            description: description,
            userAgent: navigator.userAgent,
            ip: 'localhost' // Em produção, seria obtido do servidor
        };
        
        // Salva no localStorage (em produção seria enviado para o servidor)
        const logs = JSON.parse(localStorage.getItem('systemLogs') || '[]');
        logs.push(log);
        
        // Mantém apenas os últimos 1000 logs
        if (logs.length > 1000) {
            logs.splice(0, logs.length - 1000);
        }
        
        localStorage.setItem('systemLogs', JSON.stringify(logs));
    }

    // Obtém logs do sistema
    getLogs(limit = 100) {
        const logs = JSON.parse(localStorage.getItem('systemLogs') || '[]');
        return logs.slice(-limit).reverse(); // Retorna os mais recentes primeiro
    }

    // Renova a sessão
    renewSession() {
        if (this.isAuthenticated) {
            localStorage.setItem('loginTime', Date.now().toString());
            this.startSessionTimer();
        }
    }

    // Inicializa o sistema
    init() {
        // Verifica autenticação ao carregar a página
        if (!this.checkAuth() && !window.location.pathname.includes('index.html') && window.location.pathname !== '/') {
            this.redirectToLogin();
        }

        // Renova sessão em atividade do usuário
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        events.forEach(event => {
            document.addEventListener(event, () => {
                if (this.isAuthenticated) {
                    this.renewSession();
                }
            }, { passive: true });
        });
    }
}

// Instância global do sistema de autenticação
window.authSystem = new AuthSystem();

