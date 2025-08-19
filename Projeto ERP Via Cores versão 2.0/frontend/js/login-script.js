// Login Page JavaScript
$(document).ready(function() {
    
    // Initialize the application
    initializeApp();
    
    function initializeApp() {
        setupEventListeners();
        setupValidation();
        setupAnimations();
        loadUserData();
    }
    
    // Mock user database for demonstration
    const users = [
        {
            email: 'admin@empresa.com',
            password: 'admin123',
            role: 'admin',
            firstAccess: false,
            name: 'Administrador'
        },
        {
            email: 'joao.silva@empresa.com',
            password: 'temp123',
            role: 'operator',
            firstAccess: true,
            name: 'João Silva'
        },
        {
            email: 'maria.santos@empresa.com',
            password: 'maria456',
            role: 'manager',
            firstAccess: false,
            name: 'Maria Santos'
        }
    ];
    
    // Event Listeners Setup
    function setupEventListeners() {
        // Login form submission
        $('#loginForm').on('submit', handleLogin);
        
        // Password toggle
        $('#togglePassword').on('click', togglePasswordVisibility);
        
        // Forgot password
        $('#sendRecoveryBtn').on('click', handleForgotPassword);
        
        // First access
        $('#setNewPasswordBtn').on('click', handleFirstAccess);
        
        // Real-time validation
        $('#email, #password').on('input', validateField);
        $('#newPassword, #confirmPassword').on('input', validatePasswordMatch);
        
        // Enter key handling
        $(document).on('keypress', function(e) {
            if (e.which === 13) {
                const activeModal = $('.modal.show');
                if (activeModal.length) {
                    if (activeModal.attr('id') === 'forgotPasswordModal') {
                        $('#sendRecoveryBtn').click();
                    } else if (activeModal.attr('id') === 'firstAccessModal') {
                        $('#setNewPasswordBtn').click();
                    }
                } else {
                    $('#loginForm').submit();
                }
            }
        });
    }
    
    // Login Handler
    function handleLogin(e) {
        e.preventDefault();
        
        const email = $('#email').val().trim();
        const password = $('#password').val();
        const rememberMe = $('#rememberMe').is(':checked');
        
        // Validate form
        if (!validateLoginForm(email, password)) {
            return;
        }
        
        // Show loading state
        showLoadingState('#loginBtn');
        
        // Simulate API call
        setTimeout(() => {
            const user = authenticateUser(email, password);
            
            if (user) {
                if (user.firstAccess) {
                    hideLoadingState('#loginBtn');
                    showFirstAccessRequired(user);
                } else {
                    loginSuccess(user, rememberMe);
                }
            } else {
                hideLoadingState('#loginBtn');
                showLoginError('Email ou senha incorretos.');
            }
        }, 1500);
    }
    
    // User Authentication
    function authenticateUser(email, password) {
        return users.find(user => 
            user.email.toLowerCase() === email.toLowerCase() && 
            user.password === password
        );
    }
    
    // Login Success
    function loginSuccess(user, rememberMe) {
        // Store user session
        sessionStorage.setItem('currentUser', JSON.stringify(user));
        
        if (rememberMe) {
            localStorage.setItem('rememberedUser', user.email);
        }
        
        // Log the action
        logUserAction(user.email, 'Login', 'Sistema', 'Login realizado com sucesso');
        
        // Show success animation
        showSuccessMessage('Login realizado com sucesso!', () => {
            // Redirect to admin panel (simulate)
            window.location.href = '/admin.html';
        });
    }
    
    // Show First Access Required
    function showFirstAccessRequired(user) {
        showErrorMessage('Primeiro acesso detectado. Por favor, defina uma nova senha.', () => {
            $('#firstAccessEmail').val(user.email);
            $('#firstAccessModal').modal('show');
        });
    }
    
    // Login Error
    function showLoginError(message) {
        $('#email, #password').addClass('is-invalid');
        showErrorMessage(message);
        
        // Add shake animation
        $('.login-card').addClass('animate__animated animate__shakeX');
        setTimeout(() => {
            $('.login-card').removeClass('animate__animated animate__shakeX');
        }, 1000);
    }
    
    // Password Toggle
    function togglePasswordVisibility() {
        const passwordField = $('#password');
        const toggleIcon = $('#togglePassword i');
        
        if (passwordField.attr('type') === 'password') {
            passwordField.attr('type', 'text');
            toggleIcon.removeClass('fa-eye').addClass('fa-eye-slash');
        } else {
            passwordField.attr('type', 'password');
            toggleIcon.removeClass('fa-eye-slash').addClass('fa-eye');
        }
    }
    
    // Forgot Password Handler
    function handleForgotPassword() {
        const email = $('#recoveryEmail').val().trim();
        
        if (!email) {
            showFieldError('#recoveryEmail', 'Por favor, digite seu email.');
            return;
        }
        
        if (!isValidEmail(email)) {
            showFieldError('#recoveryEmail', 'Por favor, digite um email válido.');
            return;
        }
        
        // Check if user exists
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (!user) {
            showFieldError('#recoveryEmail', 'Email não encontrado no sistema.');
            return;
        }
        
        // Show loading
        showLoadingState('#sendRecoveryBtn');
        
        // Simulate sending email
        setTimeout(() => {
            hideLoadingState('#sendRecoveryBtn');
            $('#forgotPasswordModal').modal('hide');
            
            // Log the action
            logUserAction(email, 'Recuperação de Senha', 'Sistema', 'Solicitação de recuperação de senha');
            
            showSuccessMessage('Instruções de recuperação enviadas para seu email!');
            
            // Clear form
            $('#recoveryEmail').val('');
        }, 2000);
    }
    
    // First Access Handler
    function handleFirstAccess() {
        const email = $('#firstAccessEmail').val().trim();
        const tempPassword = $('#tempPassword').val();
        const newPassword = $('#newPassword').val();
        const confirmPassword = $('#confirmPassword').val();
        
        // Validate form
        if (!validateFirstAccessForm(email, tempPassword, newPassword, confirmPassword)) {
            return;
        }
        
        // Find user
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        
        if (!user || user.password !== tempPassword) {
            showFieldError('#tempPassword', 'Email ou senha temporária incorretos.');
            return;
        }
        
        // Show loading
        showLoadingState('#setNewPasswordBtn');
        
        // Simulate password update
        setTimeout(() => {
            // Update user password
            user.password = newPassword;
            user.firstAccess = false;
            
            hideLoadingState('#setNewPasswordBtn');
            $('#firstAccessModal').modal('hide');
            
            // Log the action
            logUserAction(email, 'Alteração de Senha', 'Sistema', 'Senha alterada no primeiro acesso');
            
            showSuccessMessage('Senha definida com sucesso! Faça login com sua nova senha.', () => {
                // Clear forms
                $('#firstAccessForm')[0].reset();
                $('#loginForm')[0].reset();
                $('#email').val(email);
                $('#email').focus();
            });
        }, 2000);
    }
    
    // Form Validation
    function validateLoginForm(email, password) {
        let isValid = true;
        
        // Clear previous errors
        $('.form-control').removeClass('is-invalid is-valid');
        
        // Email validation
        if (!email) {
            showFieldError('#email', 'Por favor, digite seu email.');
            isValid = false;
        } else if (!isValidEmail(email)) {
            showFieldError('#email', 'Por favor, digite um email válido.');
            isValid = false;
        } else {
            showFieldSuccess('#email');
        }
        
        // Password validation
        if (!password) {
            showFieldError('#password', 'Por favor, digite sua senha.');
            isValid = false;
        } else if (password.length < 6) {
            showFieldError('#password', 'A senha deve ter pelo menos 6 caracteres.');
            isValid = false;
        } else {
            showFieldSuccess('#password');
        }
        
        return isValid;
    }
    
    function validateFirstAccessForm(email, tempPassword, newPassword, confirmPassword) {
        let isValid = true;
        
        // Clear previous errors
        $('#firstAccessModal .form-control').removeClass('is-invalid is-valid');
        
        // Email validation
        if (!email || !isValidEmail(email)) {
            showFieldError('#firstAccessEmail', 'Por favor, digite um email válido.');
            isValid = false;
        }
        
        // Temporary password validation
        if (!tempPassword) {
            showFieldError('#tempPassword', 'Por favor, digite a senha temporária.');
            isValid = false;
        }
        
        // New password validation
        if (!newPassword) {
            showFieldError('#newPassword', 'Por favor, digite uma nova senha.');
            isValid = false;
        } else if (!isValidPassword(newPassword)) {
            showFieldError('#newPassword', 'A senha deve ter pelo menos 8 caracteres, incluindo letras e números.');
            isValid = false;
        }
        
        // Confirm password validation
        if (!confirmPassword) {
            showFieldError('#confirmPassword', 'Por favor, confirme sua nova senha.');
            isValid = false;
        } else if (newPassword !== confirmPassword) {
            showFieldError('#confirmPassword', 'As senhas não coincidem.');
            isValid = false;
        }
        
        return isValid;
    }
    
    // Real-time Validation
    function validateField() {
        const field = $(this);
        const value = field.val().trim();
        
        field.removeClass('is-invalid is-valid');
        
        if (field.attr('id') === 'email') {
            if (value && isValidEmail(value)) {
                field.addClass('is-valid');
            } else if (value) {
                field.addClass('is-invalid');
            }
        } else if (field.attr('id') === 'password') {
            if (value && value.length >= 6) {
                field.addClass('is-valid');
            } else if (value) {
                field.addClass('is-invalid');
            }
        }
    }
    
    function validatePasswordMatch() {
        const newPassword = $('#newPassword').val();
        const confirmPassword = $('#confirmPassword').val();
        
        $('#newPassword, #confirmPassword').removeClass('is-invalid is-valid');
        
        if (newPassword && isValidPassword(newPassword)) {
            $('#newPassword').addClass('is-valid');
        } else if (newPassword) {
            $('#newPassword').addClass('is-invalid');
        }
        
        if (confirmPassword) {
            if (confirmPassword === newPassword && newPassword) {
                $('#confirmPassword').addClass('is-valid');
            } else {
                $('#confirmPassword').addClass('is-invalid');
            }
        }
    }
    
    // Validation Helpers
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function isValidPassword(password) {
        // At least 8 characters, including letters and numbers
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/;
        return passwordRegex.test(password);
    }
    
    // UI Helper Functions
    function showFieldError(selector, message) {
        const field = $(selector);
        field.addClass('is-invalid');
        field.siblings('.invalid-feedback').text(message);
    }
    
    function showFieldSuccess(selector) {
        const field = $(selector);
        field.addClass('is-valid');
    }
    
    function showLoadingState(selector) {
        const btn = $(selector);
        btn.prop('disabled', true);
        btn.find('.btn-text').addClass('d-none');
        btn.find('.btn-loading').removeClass('d-none');
    }
    
    function hideLoadingState(selector) {
        const btn = $(selector);
        btn.prop('disabled', false);
        btn.find('.btn-text').removeClass('d-none');
        btn.find('.btn-loading').addClass('d-none');
    }
    
    function showSuccessMessage(message, callback) {
        $('#successMessage').text(message);
        $('#successModal').modal('show');
        
        if (callback) {
            $('#successModal').off('hidden.bs.modal').on('hidden.bs.modal', callback);
        }
    }
    
    function showErrorMessage(message, callback) {
        // Create error modal if it doesn't exist
        if ($('#errorModal').length === 0) {
            const errorModal = `
                <div class="modal fade" id="errorModal" tabindex="-1">
                    <div class="modal-dialog modal-dialog-centered">
                        <div class="modal-content">
                            <div class="modal-body text-center py-4">
                                <div class="error-icon mb-3">
                                    <i class="fas fa-exclamation-triangle text-warning"></i>
                                </div>
                                <h5 class="modal-title mb-3">Atenção!</h5>
                                <p class="text-muted" id="errorMessage"></p>
                                <button type="button" class="btn btn-primary" data-bs-dismiss="modal">OK</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            $('body').append(errorModal);
            
            // Add styles for error icon
            $('<style>').text(`
                .error-icon i {
                    font-size: 4rem;
                    animation: pulse 2s infinite;
                }
            `).appendTo('head');
        }
        
        $('#errorMessage').text(message);
        $('#errorModal').modal('show');
        
        if (callback) {
            $('#errorModal').off('hidden.bs.modal').on('hidden.bs.modal', callback);
        }
    }
    
    // Setup Animations
    function setupAnimations() {
        // Add entrance animations to form elements
        $('.form-group').each(function(index) {
            $(this).css('animation-delay', (index * 0.1) + 's');
            $(this).addClass('animate__animated animate__fadeInUp');
        });
        
        // Add hover effects to buttons
        $('.btn').hover(
            function() {
                $(this).addClass('animate__animated animate__pulse');
            },
            function() {
                $(this).removeClass('animate__animated animate__pulse');
            }
        );
    }
    
    // Setup Validation
    function setupValidation() {
        // Remove validation classes on input
        $('.form-control').on('input', function() {
            $(this).siblings('.invalid-feedback').text('');
        });
        
        // Clear validation on modal close
        $('.modal').on('hidden.bs.modal', function() {
            $(this).find('.form-control').removeClass('is-invalid is-valid');
            $(this).find('.invalid-feedback').text('');
            $(this).find('form')[0].reset();
        });
    }
    
    // Load User Data
    function loadUserData() {
        // Check for remembered user
        const rememberedUser = localStorage.getItem('rememberedUser');
        if (rememberedUser) {
            $('#email').val(rememberedUser);
            $('#rememberMe').prop('checked', true);
            $('#password').focus();
        } else {
            $('#email').focus();
        }
        
        // Check for existing session
        const currentUser = sessionStorage.getItem('currentUser');
        if (currentUser) {
            const user = JSON.parse(currentUser);
            showSuccessMessage(`Bem-vindo de volta, ${user.name}!`, () => {
                window.location.href = './admin.html';
            });
        }
    }
    
    // Log User Actions
    function logUserAction(user, action, module, details) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            user: user,
            action: action,
            module: module,
            details: details,
            ip: '192.168.1.100', // Simulated IP
            status: 'Sucesso'
        };
        
        // Store in localStorage for demonstration
        let logs = JSON.parse(localStorage.getItem('systemLogs') || '[]');
        logs.unshift(logEntry);
        
        // Keep only last 100 logs
        if (logs.length > 100) {
            logs = logs.slice(0, 100);
        }
        
        localStorage.setItem('systemLogs', JSON.stringify(logs));
        console.log('Log registrado:', logEntry);
    }
    
    // Utility Functions
    function generateTempPassword() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    // Demo Functions (for testing)
    window.demoLogin = function() {
        $('#email').val('admin@empresa.com');
        $('#password').val('admin123');
        $('#loginForm').submit();
    };
    
    window.demoFirstAccess = function() {
        $('#email').val('joao.silva@empresa.com');
        $('#password').val('temp123');
        $('#loginForm').submit();
    };
    
    // Add demo buttons for testing (only in development)
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.protocol === 'file:') {
        const demoButtons = `
            <div class="demo-buttons mt-3 text-center">
                <small class="text-muted d-block mb-2">Demonstração:</small>
                <button type="button" class="btn btn-sm btn-outline-info me-2" onclick="demoLogin()">
                    Login Admin
                </button>
                <button type="button" class="btn btn-sm btn-outline-warning" onclick="demoFirstAccess()">
                    Primeiro Acesso
                </button>
            </div>
        `;
        $('.login-footer').before(demoButtons);
    }
    
});

// Additional utility functions
function formatDateTime(date) {
    return new Intl.DateTimeFormat('pt-BR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }).format(new Date(date));
}

// Logout function (for use in admin panel)
function logout() {
    const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || '{}');
    
    if (currentUser.email) {
        logUserAction(currentUser.email, 'Logout', 'Sistema', 'Logout realizado');
    }
    
    sessionStorage.removeItem('currentUser');
    window.location.href = './login.html';
}

