// admin-panel.js - Painel Administrativo YUNA

// Função para alterar tipo de acesso (precisa estar disponível imediatamente)
window.alterarTipoAcesso = function() {
    var tipo = document.getElementById('tipo-acesso')?.value;
    var departamentoSection = document.getElementById('departamento-section');
    if (!departamentoSection) return;
    
    if (tipo === 'equipe') {
        departamentoSection.classList.remove('hidden');
        console.log('[DEBUG] Tipo de acesso: equipe - mostrando departamento');
    } else {
        departamentoSection.classList.add('hidden');
        console.log('[DEBUG] Tipo de acesso: admin - ocultando departamento');
    }
};

// Função de emergência para resetar o sistema
window.emergencyReset = function() {
    console.log('🚨 EMERGENCY RESET INICIADO');
    
    // Limpar localStorage
    localStorage.clear();
    
    // Forçar logout
    if (window.auth) {
        window.auth.signOut().then(() => {
            console.log('✅ Logout forçado realizado');
            window.location.reload();
        }).catch(error => {
            console.error('Erro no logout:', error);
            window.location.reload();
        });
    } else {
        window.location.reload();
    }
};

// Função para criação rápida de super admin (desenvolvimento)
window.criarSuperAdminDev = async function(email, senha) {
    if (!window.auth || !window.db) {
        console.error('Firebase não inicializado');
        return;
    }
    
    try {
        // Criar usuário no Firebase Auth
        const userCredential = await window.auth.createUserWithEmailAndPassword(email, senha);
        const user = userCredential.user;
        
        // Criar documento na coleção usuarios_admin
        await window.db.collection('usuarios_admin').doc(user.uid).set({
            nome: 'Super Admin Dev',
            email: email,
            role: 'super_admin',
            ativo: true,
            dataCriacao: new Date().toISOString(),
            permissoes: {
                criarUsuarios: true,
                gerenciarDepartamentos: true,
                verRelatorios: true,
                gerenciarSolicitacoes: true
            }
        });
        
        console.log('✅ Super admin criado:', email);
        alert('Super admin criado com sucesso! Faça login agora.');
        
    } catch (error) {
        console.error('Erro ao criar super admin:', error);
        alert('Erro: ' + error.message);
    }
};

// --- Firebase ---
function firebaseReady() {
    return (typeof firebase !== 'undefined') && typeof firebase.initializeApp === 'function';
}

async function initFirebaseApp() {
    if (!firebaseReady()) {
        console.error('[ERRO] Firebase SDK não carregado');
        alert('Erro: Firebase SDK não carregado. Verifique a conexão ou o script.');
        return false;
    }
    
    try {
        if (!firebase.apps.length) {
            // Use the configuration from firebase-config-secure.js loaded via script tag
            if (typeof window.firebaseConfig === 'undefined') {
                console.error('[ERRO] Configuração Firebase não encontrada');
                alert('Erro: Configuração Firebase não carregada. Verifique firebase-config-secure.js');
                return false;
            }
            
            console.log('[DEBUG] Inicializando Firebase com config:', window.firebaseConfig.projectId);
            firebase.initializeApp(window.firebaseConfig);
            console.log('✅ Firebase inicializado com sucesso');
        }
        
        window.auth = firebase.auth();
        window.db = firebase.firestore();
        
        // Configurar settings do Firestore apenas se necessário
        // Verificar se ainda não foi configurado
        let settingsConfigured = false;
        try {
            // Tentar uma operação simples para verificar se já foi configurado
            const testQuery = window.db.collection('_test').limit(1);
            settingsConfigured = true; // Se chegou aqui, Firestore já está ativo
        } catch (e) {
            // Firestore ainda não foi usado, podemos configurar settings
            settingsConfigured = false;
        }
        
        if (!settingsConfigured) {
            try {
                window.db.settings({
                    ignoreUndefinedProperties: true
                });
                console.log('✅ Settings do Firestore configuradas');
            } catch (settingsError) {
                // Ignorar erro silenciosamente se já foi configurado
                if (settingsError.code !== 'failed-precondition') {
                    console.warn('⚠️ Aviso settings:', settingsError.code);
                }
            }
        }
        
        // Configurar persistência offline
        try {
            await window.db.enablePersistence({ synchronizeTabs: true });
            console.log('✅ Persistência offline habilitada');
        } catch (err) {
            // Apenas avisar, não é erro crítico
            if (err.code === 'failed-precondition') {
                console.log('ℹ️ Persistência não ativada: múltiplas abas abertas');
            } else if (err.code === 'unimplemented') {
                console.log('ℹ️ Persistência não suportada neste navegador');
            }
        }
        
        return true;
        
    } catch (error) {
        console.error('[ERRO] Falha na inicialização do Firebase:', error);
        showToast('Erro', 'Falha na conexão com Firebase. Modo offline ativado.', 'error');
        return false;
    }
}

// --- Permissões centralizadas ---
// Funções importadas do admin-permissions.js
// window.verificarUsuarioAdminJS, window.temPermissaoJS, window.podeVerSolicitacaoJS
function showToast(titulo, mensagem, tipo) {
    var toast = document.createElement('div');
    toast.className = 'toast ' + tipo;
    toast.innerHTML = `<strong>${titulo}:</strong> ${mensagem}`;
    document.body.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
}

function ocultarSecoesPrincipais() {
    const idsOcultar = [
        'admin-panel',
        'acompanhantes-section',
        'relatorios-section',
        'metricas-gerais',
        'create-user-modal',
        'manage-users-modal',
        'teams-grid'
    ];
    idsOcultar.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.classList.add('hidden');
            console.log(`[DEBUG] ocultarSecoesPrincipais: ocultando ${id}`);
        } else {
            console.warn(`[AVISO] ocultarSecoesPrincipais: elemento não encontrado: ${id}`);
        }
    });
    if (document.querySelector('.teams-grid')) {
        document.querySelector('.teams-grid').classList.add('hidden');
        console.log('[DEBUG] ocultarSecoesPrincipais: ocultando teams-grid');
    }
    document.getElementById('auth-section')?.classList.remove('hidden');
    console.log('[DEBUG] ocultarSecoesPrincipais: exibindo auth-section');
}

function mostrarSecaoPainel(secao) {
    try {
        console.log(`[DEBUG] mostrarSecaoPainel: navegação para '${secao}'`);
        // Oculta todas as seções principais
        const secoes = [
            'admin-panel',
            'acompanhantes-section',
            'relatorios-section',
            'metricas-gerais',
            'create-user-modal',
            'manage-users-modal',
            'teams-grid'
        ];
        secoes.forEach(id => {
            const el = document.getElementById(id) || document.querySelector('.' + id);
            if (el) el.classList.add('hidden');
        });
        // Exibe apenas a seção desejada
        if (secao === 'painel') {
            document.getElementById('admin-panel')?.classList.remove('hidden');
            document.getElementById('metricas-gerais')?.classList.remove('hidden');
            document.querySelector('.teams-grid')?.classList.remove('hidden');
            console.log('[DEBUG] mostrarSecaoPainel: exibindo painel principal');
        } else if (secao === 'acompanhantes') {
            document.getElementById('admin-panel')?.classList.remove('hidden');
            document.getElementById('acompanhantes-section')?.classList.remove('hidden');
            console.log('[DEBUG] mostrarSecaoPainel: exibindo acompanhantes-section');
        } else if (secao === 'relatorios') {
            document.getElementById('admin-panel')?.classList.remove('hidden');
            document.getElementById('relatorios-section')?.classList.remove('hidden');
            console.log('[DEBUG] mostrarSecaoPainel: exibindo relatorios-section');
        } else if (secao === 'create-user') {
            const modal = document.getElementById('modal-novo-usuario');
            document.getElementById('admin-panel')?.classList.remove('hidden');
            if (modal) {
                modal.classList.remove('hidden');
                modal.style.display = 'flex';
                modal.style.zIndex = '9999';
                modal.style.visibility = 'visible';
                modal.style.opacity = '1';
            }
            setTimeout(() => document.getElementById('usuario-nome')?.focus(), 300);
            console.log('[DEBUG] mostrarSecaoPainel: exibindo modal-novo-usuario');
        } else if (secao === 'manage-users') {
            document.getElementById('admin-panel')?.classList.remove('hidden');
            document.getElementById('manage-users-modal')?.classList.remove('hidden');
            document.getElementById('manage-users-modal').style.display = 'flex';
            console.log('[DEBUG] mostrarSecaoPainel: exibindo manage-users-modal');
        } else {
            console.warn(`[AVISO] mostrarSecaoPainel: seção desconhecida: ${secao}`);
        }
    } catch (err) {
        console.error('[ERRO] mostrarSecaoPainel: falha ao exibir seção:', err);
    }
}

// --- Autenticação e Acesso ---
// Oculta campo departamento corretamente na inicialização
window.addEventListener('DOMContentLoaded', async function() {
    console.log('[DEBUG] DOMContentLoaded: iniciando configuração...');
    
    // Primeiro, configurar os botões ANTES de qualquer coisa relacionada ao Firebase
    console.log('[DEBUG] DOMContentLoaded: configurando eventos dos botões ANTES do Firebase...');
    
    // Garantir que as funções dos modais estão disponíveis
    if (typeof window.showCreateUserModal !== 'function') {
        console.error('[ERRO] showCreateUserModal não definida durante DOMContentLoaded!');
    }
    if (typeof window.showManageUsersModal !== 'function') {
        console.error('[ERRO] showManageUsersModal não definida durante DOMContentLoaded!');
    }
    
    // Configurar eventos imediatamente
    configurarEventosBotoes();
    
    // Tentar inicializar Firebase
    try {
        const firebaseOk = await initFirebaseApp();
        
        if (!firebaseOk) {
            console.warn('[AVISO] Firebase falhou na inicialização - continuando em modo offline');
            // Em caso de falha do Firebase, ativar modo offline básico
            setTimeout(() => {
                // Simular login offline para admins
                window.userRole = 'admin';
                window.usuarioAdmin = { role: 'admin', nome: 'Admin Offline', email: 'admin@offline.local' };
                
                const authSection = document.getElementById('auth-section');
                const adminPanel = document.getElementById('admin-panel');
                if (authSection) authSection.classList.add('hidden');
                if (adminPanel) adminPanel.classList.remove('hidden');
                
                atualizarVisibilidadeBotoes();
                configurarEventosBotoes();
                
                showToast('Aviso', 'Modo offline ativado - funcionalidade limitada', 'warning');
            }, 1000);
            return;
        }
    } catch (error) {
        console.error('[ERRO] Erro crítico na inicialização do Firebase:', error);
    }
    
    // FORÇAR ocultação de todos os painéis administrativos na inicialização
    const adminPanel = document.getElementById('admin-panel');
    if (adminPanel) adminPanel.classList.add('hidden');
    
    const teamsGrid = document.querySelector('.teams-grid');
    if (teamsGrid) teamsGrid.classList.add('hidden');
    
    // Ocultar TODOS os painéis administrativos na inicialização
    const allPanels = document.querySelectorAll('.team-panel, .department-card, [class*="card"]');
    allPanels.forEach(panel => {
        if (panel.classList) panel.classList.add('hidden');
    });
    
    // Garantir que a seção de autenticação esteja visível
    const authSection = document.getElementById('auth-section');
    if (authSection) authSection.classList.remove('hidden');
    
    // Ocultar campo departamento corretamente na inicialização
    var tipoSelect = document.getElementById('tipo-acesso');
    var tipo = tipoSelect ? tipoSelect.value : null;
    var departamentoSection = document.getElementById('departamento-section');
    if (tipo !== 'equipe' && departamentoSection) {
        departamentoSection.classList.add('hidden');
        var departamentoSelect = document.getElementById('departamento');
        if (departamentoSelect) departamentoSelect.value = '';
        console.log('[DEBUG] Inicialização: ocultando departamento-section');
    }
    
    // Listener de autenticação persistente (apenas se Firebase OK)
    if (window.auth) {
        window.auth.onAuthStateChanged(async function(user) {
            try {
                if (user) {
                    console.log('[DEBUG] Usuário autenticado:', user.email);
                    console.log('[DEBUG] UID do usuário:', user.uid);
                    
                    // Verifica admin via Firestore
                    console.log('[DEBUG] Verificando permissões do usuário...');
                    const dadosAdmin = await window.verificarUsuarioAdminJS(user);
                    
                    if (dadosAdmin) {
                        console.log('[DEBUG] Dados do admin carregados:', dadosAdmin);
                        window.usuarioAdmin = dadosAdmin;
                        localStorage.setItem('usuarioAdmin', JSON.stringify(dadosAdmin));
                        
                        window.userEmail = user.email;
                        window.userRole = dadosAdmin.role;
                        
                        console.log('[DEBUG] Configurando interface para:', {
                            email: user.email,
                            role: dadosAdmin.role,
                            isEquipe: dadosAdmin.isEquipe,
                            isSuperAdmin: dadosAdmin.isSuperAdmin,
                            equipe: dadosAdmin.equipe
                        });
                        
                        // Configurar interface baseada no tipo de usuário
                        if (dadosAdmin.role === 'super_admin' || dadosAdmin.isSuperAdmin) {
                            console.log('[DEBUG] Usuário SUPER ADMIN - mostrando painel completo');
                            // Super admin vê tudo
                            document.getElementById('auth-section')?.classList.add('hidden');
                            document.getElementById('admin-panel')?.classList.remove('hidden');
                            
                            // Mostrar todos os cards para super admin
                            const teamsGrid = document.querySelector('.teams-grid');
                            if (teamsGrid) teamsGrid.classList.remove('hidden');
                            
                        } else if (dadosAdmin.isEquipe && dadosAdmin.equipe) {
                            console.log('[DEBUG] Usuário EQUIPE - mostrando apenas cards do departamento:', dadosAdmin.equipe);
                            // Usuário de equipe vê apenas seu departamento
                            document.getElementById('auth-section')?.classList.add('hidden');
                            document.getElementById('admin-panel')?.classList.remove('hidden');
                            
                            // Mostrar apenas cards do departamento específico
                            const teamsGrid = document.querySelector('.teams-grid');
                            if (teamsGrid) teamsGrid.classList.remove('hidden');
                            
                            // Ocultar todos os painéis primeiro
                            const allPanels = document.querySelectorAll('.team-panel, .department-card, [class*="card"]');
                            allPanels.forEach(panel => {
                                if (panel.classList) panel.classList.add('hidden');
                            });
                            
                            // Mostrar apenas o painel do departamento do usuário
                            const departmentPanel = document.querySelector(`[data-department="${dadosAdmin.equipe}"]`);
                            if (departmentPanel) {
                                departmentPanel.classList.remove('hidden');
                                console.log('[DEBUG] Mostrando painel do departamento:', dadosAdmin.equipe);
                            } else {
                                console.warn('[AVISO] Painel não encontrado para departamento:', dadosAdmin.equipe);
                            }
                            
                        } else {
                            console.log('[DEBUG] Usuário sem permissões específicas - mantendo na tela de login');
                            document.getElementById('auth-section')?.classList.remove('hidden');
                            document.getElementById('admin-panel')?.classList.add('hidden');
                            showToast('Erro', 'Usuário sem permissões definidas', 'error');
                            setTimeout(() => window.auth.signOut(), 2000);
                            return;
                        }
                        
                        // Atualizar botões imediatamente após login
                        setTimeout(() => {
                            console.log('[DEBUG] Inicializando botões após login...');
                            atualizarVisibilidadeBotoes();
                            configurarEventosBotoes();
                            
                            // Garantir que as funções estão disponíveis globalmente
                            if (typeof window.showCreateUserModal !== 'function') {
                                console.error('[ERRO] showCreateUserModal não está definida!');
                            }
                            if (typeof window.showManageUsersModal !== 'function') {
                                console.error('[ERRO] showManageUsersModal não está definida!');
                            }
                            
                            console.log('[DEBUG] Estado dos botões após login:', {
                                userRole: window.userRole,
                                usuarioAdmin: window.usuarioAdmin,
                                showCreateUserModal: typeof window.showCreateUserModal,
                                showManageUsersModal: typeof window.showManageUsersModal
                            });
                            
                            // Chamar função de teste para debug
                            if (typeof window.testarBotoes === 'function') {
                                window.testarBotoes();
                            }
                            
                        }, 300);
                        
                        // Segunda verificação para garantir configuração
                        setTimeout(() => {
                            console.log('[DEBUG] Segunda verificação dos botões...');
                            if (window.reconfigurarBotoes) {
                                window.reconfigurarBotoes();
                            }
                        }, 1000);
                        
                        // Carregar dados da aplicação
                        await carregarSolicitacoes();
                        
                    } else {
                        console.log('[DEBUG] Usuário sem permissões - mantendo na tela de login');
                        // Usuário autenticado mas sem permissões - manter na tela de login
                        const authSection = document.getElementById('auth-section');
                        const adminPanel = document.getElementById('admin-panel');
                        if (authSection) authSection.classList.remove('hidden');
                        if (adminPanel) adminPanel.classList.add('hidden');
                        
                        // Fazer logout automático do usuário não autorizado
                        setTimeout(() => {
                            window.auth.signOut();
                        }, 2000);
                    }
                } else {
                    console.log('[DEBUG] Usuário não autenticado - resetando interface completa');
                    // Usuário não autenticado - resetar interface completamente
                    
                    // Ocultar painéis administrativos
                    const authSection2 = document.getElementById('auth-section');
                    const adminPanel2 = document.getElementById('admin-panel');
                    if (authSection2) authSection2.classList.remove('hidden');
                    if (adminPanel2) adminPanel2.classList.add('hidden');
                    
                    // Ocultar TODOS os painéis de departamento
                    const teamsGrid = document.querySelector('.teams-grid');
                    if (teamsGrid) teamsGrid.classList.add('hidden');
                    
                    const allPanels = document.querySelectorAll('.team-panel, .department-card, [class*="card"]');
                    allPanels.forEach(panel => {
                        if (panel.classList) panel.classList.add('hidden');
                    });
                    
                    // Limpar dados do usuário
                    window.usuarioAdmin = null;
                    window.userRole = null;
                    window.userEmail = null;
                    localStorage.removeItem('usuarioAdmin');
                    
                    // Resetar formulário de login
                    const loginForm = document.getElementById('login-form');
                    if (loginForm) loginForm.reset();
                }
            } catch (authError) {
                console.error('[ERRO] Erro no listener de autenticação:', authError);
                showToast('Erro', 'Erro na autenticação. Tentando modo offline...', 'error');
            }
        });
    }
    // Corrige botão de logout
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.onclick = async function() {
            try {
                await window.auth.signOut();
                showToast('Sucesso', 'Logout realizado!', 'success');
                const authSection3 = document.getElementById('auth-section');
                const adminPanel3 = document.getElementById('admin-panel');
                if (authSection3) authSection3.classList.remove('hidden');
                if (adminPanel3) adminPanel3.classList.add('hidden');
            } catch (err) {
                showToast('Erro', 'Erro ao fazer logout.', 'error');
            }
        };
    }
});
window.handleLogin = async function(event) {
    try {
        console.log('[DEBUG] handleLogin: login iniciado...');
        event.preventDefault();
        const email = document.getElementById('login-email').value;
        const senha = document.getElementById('login-password').value;
        
        if (!email || !senha) {
            showToast('Erro', 'Preencha email e senha.', 'error');
            console.warn('[AVISO] handleLogin: email ou senha não preenchidos!');
            return;
        }
        
        console.log('[DEBUG] Tentando login com email:', email);
        
        // Verificar se Firebase está disponível
        if (!window.auth) {
            console.error('[ERRO] Firebase Auth não disponível');
            showToast('Erro', 'Sistema de autenticação não disponível. Ativando modo desenvolvimento...', 'warning');
            // Ativar modo desenvolvimento
            setTimeout(() => {
                window.loginDesenvolvimento(email);
            }, 1000);
            return;
        }
        
        const userCredential = await window.auth.signInWithEmailAndPassword(email, senha);
        showToast('Sucesso', 'Login realizado!', 'success');
        console.log('[DEBUG] handleLogin: login realizado com sucesso!');
        
        // Oculta tela de login e mostra painel principal
        document.getElementById('auth-section')?.classList.add('hidden');
        
        // Atualiza badge do menu imediatamente
        const badge = document.getElementById('user-role-badge');
        if (badge) {
            // Exibe o papel correto do usuário
            if (window.usuarioAdmin && window.usuarioAdmin.role === 'super_admin') {
                badge.textContent = 'Super Administrador';
            } else if (window.usuarioAdmin && window.usuarioAdmin.role === 'admin') {
                badge.textContent = 'Administrador';
            } else {
                badge.textContent = 'Equipe';
            }
        }
        
        // Exibe loader dentro do painel principal
        const painel = document.getElementById('admin-panel');
        let loader = document.createElement('div');
        loader.className = 'loader';
        loader.innerHTML = `<div class='loader-spinner'></div> <span>Carregando...</span>`;
        painel.appendChild(loader);
        window._mainLoader = loader;
        mostrarSecaoPainel('painel');
        carregarSolicitacoesAgrupadas();
        
    } catch (error) {
        console.error('[ERRO] handleLogin: falha no login:', error);
        
        // Tratamento específico de diferentes tipos de erro
        let mensagemErro = 'Erro desconhecido no login';
        let mostrarModoDesenvolvimento = false;
        
        if (error.code) {
            switch (error.code) {
                case 'auth/invalid-login-credentials':
                    mensagemErro = 'Email ou senha incorretos. Verifique suas credenciais.';
                    mostrarModoDesenvolvimento = true;
                    break;
                case 'auth/user-not-found':
                    mensagemErro = 'Usuário não encontrado. Verifique o email.';
                    mostrarModoDesenvolvimento = true;
                    break;
                case 'auth/wrong-password':
                    mensagemErro = 'Senha incorreta.';
                    break;
                case 'auth/invalid-email':
                    mensagemErro = 'Email inválido.';
                    break;
                case 'auth/user-disabled':
                    mensagemErro = 'Conta desabilitada. Entre em contato com o administrador.';
                    break;
                case 'auth/too-many-requests':
                    mensagemErro = 'Muitas tentativas de login. Tente novamente mais tarde.';
                    break;
                case 'auth/network-request-failed':
                    mensagemErro = 'Erro de rede. Verifique sua conexão.';
                    mostrarModoDesenvolvimento = true;
                    break;
                default:
                    mensagemErro = `Erro de autenticação: ${error.code}`;
                    mostrarModoDesenvolvimento = true;
            }
        } else if (error.message) {
            mensagemErro = error.message;
            mostrarModoDesenvolvimento = true;
        }
        
        showToast('Erro', mensagemErro, 'error');
        
        // Se há problemas de conectividade ou credenciais, oferecer modo desenvolvimento
        if (mostrarModoDesenvolvimento) {
            setTimeout(() => {
                const email = document.getElementById('login-email').value;
                if (email && confirm('Erro de autenticação detectado. Deseja ativar o modo desenvolvimento? (Funcionalidade limitada)')) {
                    window.loginDesenvolvimento(email);
                }
            }, 2000);
        }
    }
}
window.carregarSolicitacoesAgrupadas = async function() {
    // Chama a função que atualiza os cards de métricas e equipes
    await carregarSolicitacoes();
}

window.showCreateUserModal = function() {
    console.log('[DEBUG] showCreateUserModal: iniciando...');
    
    // Debug completo do estado atual
    window.debugModals();
    
    // Verifica se o usuário está autenticado e tem permissões
    const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
    const userRole = window.userRole || usuarioAdmin.role;
    
    console.log('[DEBUG] showCreateUserModal: usuarioAdmin:', usuarioAdmin);
    console.log('[DEBUG] showCreateUserModal: userRole:', userRole);
    
    // Permite APENAS para super_admin
    if (!userRole || userRole !== 'super_admin') {
        showToast('Erro', 'Acesso negado. Apenas super administradores podem criar usuários.', 'error');
        console.warn('[AVISO] showCreateUserModal: acesso negado, role:', userRole);
        return;
    }
    
    // Busca o modal
    const modal = document.getElementById('modal-novo-usuario');
    console.log('[DEBUG] showCreateUserModal: modal encontrado:', !!modal);
    
    if (modal) {
        console.log('[DEBUG] showCreateUserModal: exibindo modal');
        
        // IMPORTANTE: Remover a classe .hidden PRIMEIRO (que tem !important)
        modal.classList.remove('hidden');
        
        // Depois configurar os estilos
        modal.style.display = 'flex';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.zIndex = '99999';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        
        // Focar no primeiro campo após um delay
        setTimeout(() => {
            const nomeField = document.getElementById('usuario-nome');
            if (nomeField) {
                nomeField.focus();
                console.log('[DEBUG] showCreateUserModal: foco definido no campo nome');
            }
        }, 200);
        
        console.log('[DEBUG] showCreateUserModal: modal exibido com sucesso');
    } else {
        console.error('[ERRO] Modal de criação de usuário não encontrado no DOM!');
        alert('Erro: Modal de criação de usuário não encontrado!');
    }
};

window.showManageUsersModal = async function() {
    console.log('[DEBUG] showManageUsersModal: iniciando...');
    
    // Debug completo do estado atual
    window.debugModals();
    
    // Verifica se o usuário está autenticado e tem permissões
    const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
    const userRole = window.userRole || usuarioAdmin.role;
    
    console.log('[DEBUG] showManageUsersModal: usuarioAdmin:', usuarioAdmin);
    console.log('[DEBUG] showManageUsersModal: userRole:', userRole);
    
    // Permite APENAS para super_admin
    if (!userRole || userRole !== 'super_admin') {
        showToast('Erro', 'Acesso negado. Apenas super administradores podem gerenciar usuários.', 'error');
        console.warn('[AVISO] showManageUsersModal: acesso negado, role:', userRole);
        return;
    }
    
    // Busca o modal
    const modal = document.getElementById('manage-users-modal');
    console.log('[DEBUG] showManageUsersModal: modal encontrado:', !!modal);
    
    if (modal) {
        console.log('[DEBUG] showManageUsersModal: exibindo modal');
        
        // IMPORTANTE: Remover a classe .hidden PRIMEIRO (que tem !important)
        modal.classList.remove('hidden');
        
        // Depois configurar os estilos
        modal.style.display = 'flex';
        modal.style.position = 'fixed';
        modal.style.top = '0';
        modal.style.left = '0';
        modal.style.width = '100%';
        modal.style.height = '100%';
        modal.style.zIndex = '99999';
        modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        modal.style.alignItems = 'center';
        modal.style.justifyContent = 'center';
        
        // Focar no modal após um delay
        setTimeout(() => {
            modal.focus();
            console.log('[DEBUG] showManageUsersModal: foco definido no modal');
        }, 200);
        
        // Carregar os usuários após exibir o modal
        try {
            console.log('[DEBUG] showManageUsersModal: carregando usuários...');
            await carregarUsuarios();
            console.log('[DEBUG] showManageUsersModal: usuários carregados com sucesso');
        } catch (error) {
            console.error('[ERRO] showManageUsersModal: erro ao carregar usuários:', error);
            showToast('Erro', 'Erro ao carregar usuários.', 'error');
        }
        
        console.log('[DEBUG] showManageUsersModal: modal exibido com sucesso');
    } else {
        console.error('[ERRO] Modal de gerenciamento de usuários não encontrado no DOM!');
        alert('Erro: Modal de gerenciamento de usuários não encontrado!');
    }
};

window.mostrarRelatorios = function() {
    // Verificar se é super_admin
    const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
    const userRole = window.userRole || usuarioAdmin.role;
    
    if (!userRole || userRole !== 'super_admin') {
        showToast('Erro', 'Acesso negado. Apenas super administradores podem acessar relatórios.', 'error');
        console.warn('[AVISO] mostrarRelatorios: acesso negado, role:', userRole);
        return;
    }
    
    // Permite acesso para super_admin autenticado
    mostrarSecaoPainel('relatorios');
    var filtroPeriodo = document.getElementById('filtro-periodo');
    if (filtroPeriodo && !filtroPeriodo.dataset.listenerAdded) {
        filtroPeriodo.addEventListener('change', function() {
            var customDateRange = document.getElementById('custom-date-range');
            customDateRange.style.display = this.value === 'custom' ? 'grid' : 'none';
        });
        filtroPeriodo.dataset.listenerAdded = 'true';
    }
    // Carrega solicitações do Firestore ao abrir relatórios
    carregarSolicitacoes();
    
    // Garantir que os botões estejam configurados corretamente
    setTimeout(() => {
        console.log('[DEBUG] mostrarRelatorios: reconfigurando botões...');
        atualizarVisibilidadeBotoes();
        configurarEventosBotoes();
    }, 100);
};

window.abrirAcompanhantesSection = function() {
    // Verificar se é super_admin
    const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
    const userRole = window.userRole || usuarioAdmin.role;
    
    if (!userRole || userRole !== 'super_admin') {
        showToast('Erro', 'Acesso negado. Apenas super administradores podem gerenciar acompanhantes.', 'error');
        console.warn('[AVISO] abrirAcompanhantesSection: acesso negado, role:', userRole);
        return;
    }
    
    mostrarSecaoPainel('acompanhantes');
    if (typeof carregarAcompanhantes === 'function') carregarAcompanhantes();
};

window.voltarPainelPrincipal = function() {
    mostrarSecaoPainel('painel');
    
    // Garantir que os botões estejam configurados ao voltar ao painel
    setTimeout(() => {
        console.log('[DEBUG] voltarPainelPrincipal: reconfigurando botões...');
        atualizarVisibilidadeBotoes();
        configurarEventosBotoes();
    }, 100);
};

// --- Firestore: Usuários ---
function preencherTabelaUsuarios(listaUsuarios) {
    const usersList = document.getElementById('users-list');
    const totalCount = document.getElementById('total-users-count');
    if (!usersList) return;
    if (listaUsuarios.length === 0) {
        usersList.innerHTML = `<div style='text-align:center; color:#6b7280; padding:2rem;'>Nenhum usuário cadastrado.</div>`;
        if (totalCount) totalCount.textContent = '0';
        return;
    }
    usersList.innerHTML = listaUsuarios.map(user => `
        <div class='user-row' style='display:flex; align-items:center; gap:1.5rem; background:#fff; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.04); padding:1rem 2rem;'>
            <span style='font-weight:600; color:#374151;'>${user.nome}</span>
            <span style='color:#2563eb;'>${user.departamento || user.equipe || '-'}</span>
            <span style='color:#f59e0b;'>${user.tipo || '-'}</span>
            <span style='color:#6b7280;'>${user.email}</span>
            <button onclick="editarUsuario('${user.id}')" style='background:#6366f1; color:#fff; border:none; border-radius:8px; padding:6px 16px; cursor:pointer;'>Editar</button>
            <button onclick="removerUsuario('${user.id}')" style='background:#ef4444; color:#fff; border:none; border-radius:8px; padding:6px 16px; cursor:pointer;'>Remover</button>
        </div>
    `).join('');
    if (totalCount) totalCount.textContent = listaUsuarios.length;
}
async function carregarUsuarios() {
    if (!window.db) {
        showToast('Erro', 'Firestore não inicializado!', 'error');
        return;
    }
    try {
        // Busca usuários de equipe
        const equipeSnap = await window.db.collection('usuarios_equipe').get();
        const listaEquipe = [];
        equipeSnap.forEach(doc => {
            listaEquipe.push({ id: doc.id, ...doc.data(), tipo: 'Equipe' });
        });
        // Busca usuários acompanhantes
        const acompSnap = await window.db.collection('usuarios_acompanhantes').get();
        const listaAcompanhantes = [];
        acompSnap.forEach(doc => {
            listaAcompanhantes.push({ id: doc.id, ...doc.data(), tipo: 'Acompanhante' });
        });
        // Junta tudo para exibir
        const listaUsuarios = [...listaEquipe, ...listaAcompanhantes];
        preencherTabelaUsuarios(listaUsuarios);
        console.log('Usuários carregados do Firestore:', listaUsuarios);
    } catch (error) {
        console.error('Erro ao buscar usuários:', error);
        showToast('Erro', 'Não foi possível carregar os usuários.', 'error');
    }
}

// --- Firestore: Solicitações & Renderização dos Cards ---
async function carregarSolicitacoes() {
    if (!window.db) {
        showToast('Erro', 'Firestore não inicializado!', 'error');
        console.error('Firestore não inicializado!');
        return;
    }
    
    try {
        console.log('[DEBUG] Buscando solicitações da coleção "solicitacoes"...');
        
        // Mostrar indicador de carregamento
        mostrarIndicadorCarregamento();
        
        // Obter dados do usuário atual
        const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
        const isEquipe = usuarioAdmin && (usuarioAdmin.role === 'equipe' || usuarioAdmin.isEquipe);
        const isSuperAdmin = usuarioAdmin && usuarioAdmin.role === 'super_admin';
        
        console.log('[DEBUG] Carregando para usuário:', { 
            role: usuarioAdmin?.role, 
            isEquipe, 
            isSuperAdmin, 
            equipe: usuarioAdmin?.equipe 
        });
        
        const snapshot = await window.db.collection('solicitacoes').get();
        console.log('[DEBUG] Snapshot recebido:', snapshot.size, 'documentos');
        
        const solicitacoes = [];
        let pendentes = 0;
        let finalizadasHoje = 0;
        let quartosAtivos = new Set();
        const hoje = new Date().toISOString().slice(0, 10);
        
        // Contadores por equipe
        const equipes = {
            manutencao: [],
            nutricao: [],
            higienizacao: [],
            hotelaria: []
        };
        
        let totalDocs = 0;
        snapshot.forEach(doc => {
            const data = doc.data();
            const item = { id: doc.id, ...data };
            
            // FILTRO RIGOROSO USANDO A FUNÇÃO DE PERMISSÕES
            if (!podeVerSolicitacaoJS(usuarioAdmin, data)) {
                // Pular esta solicitação se o usuário não tem permissão para vê-la
                console.log(`[DEBUG] Solicitação filtrada (sem permissão):`, item.titulo || item.tipo, 'equipe:', data.equipe);
                return;
            }
            
            totalDocs++;
            solicitacoes.push(item);
            
            console.log(`[DEBUG] Solicitação incluída:`, item.titulo || item.tipo, 'equipe:', data.equipe);
            
            if (data.status === 'pendente') pendentes++;
            if (data.status === 'finalizada' && data.dataFinalizacao?.slice(0,10) === hoje) finalizadasHoje++;
            if (data.quarto) quartosAtivos.add(data.quarto);
            
            // Agrupar por equipe apenas se necessário
            if (data.equipe && equipes[data.equipe] !== undefined) {
                equipes[data.equipe].push(item);
            }
        });
        
        console.log(`[DEBUG] Total de solicitações processadas: ${totalDocs}`);
        console.log(`[DEBUG] Solicitações por equipe:`, Object.keys(equipes).map(e => `${e}: ${equipes[e].length}`));
        
        // RENDERIZAÇÃO BASEADA NO TIPO DE USUÁRIO
        if (isEquipe && usuarioAdmin.equipe) {
            // Usuário de equipe: mostrar APENAS sua equipe
            const equipeFiltrada = {};
            equipeFiltrada[usuarioAdmin.equipe] = equipes[usuarioAdmin.equipe] || [];
            
            console.log(`[DEBUG] Renderizando apenas equipe: ${usuarioAdmin.equipe} com ${equipeFiltrada[usuarioAdmin.equipe].length} solicitações`);
            renderizarCardsEquipe(equipeFiltrada);
            
            // Ajustar visibilidade dos painéis (mostrar apenas o da equipe)
            setTimeout(() => {
                const allPanels = document.querySelectorAll('.team-panel');
                allPanels.forEach(panel => {
                    const department = panel.getAttribute('data-department');
                    if (department === usuarioAdmin.equipe) {
                        panel.classList.remove('hidden');
                        panel.style.display = 'block';
                    } else {
                        panel.classList.add('hidden');
                        panel.style.display = 'none';
                    }
                });
            }, 100);
            
        } else if (isSuperAdmin) {
            // Super admin: mostrar TODAS as equipes
            console.log('[DEBUG] Renderizando todas as equipes para super admin');
            renderizarCardsEquipe(equipes);
            
            // Mostrar todos os painéis
            setTimeout(() => {
                const allPanels = document.querySelectorAll('.team-panel');
                allPanels.forEach(panel => {
                    panel.classList.remove('hidden');
                    panel.style.display = 'block';
                });
            }, 100);
            
        } else {
            // Usuário sem permissões claras
            console.warn('[AVISO] Usuário sem permissões claras - não exibindo solicitações');
            renderizarCardsEquipe({});
        }
        
        // Atualizar métricas do painel
        atualizarMetricasPainel(totalDocs, pendentes, finalizadasHoje, quartosAtivos.size);
        
        // Se não há dados, mostrar dados simulados para teste
        if (totalDocs === 0) {
            console.log('[DEBUG] Nenhuma solicitação encontrada, criando dados de exemplo');
            criarDadosExemplo();
        }
        
        ocultarIndicadorCarregamento();
        
    } catch (error) {
        console.error('Erro ao buscar solicitações:', error);
        ocultarIndicadorCarregamento();
        
        if (error.code === 'unavailable' || error.message.includes('offline')) {
            showToast('Aviso', 'Modo offline - Carregando dados locais', 'success');
            carregarDadosOffline();
        } else {
            showToast('Erro', 'Não foi possível carregar as solicitações: ' + (error.message || error), 'error');
            // Carregar dados simulados como fallback
            criarDadosExemplo();
        }
    }
}

function mostrarIndicadorCarregamento() {
    const teamsGrid = document.querySelector('.teams-grid');
    if (teamsGrid) {
        teamsGrid.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 2rem;">
                <i class="fas fa-spinner fa-spin" style="font-size: 2rem; color: #3b82f6; margin-bottom: 1rem;"></i>
                <p>Carregando solicitações...</p>
            </div>
        `;
    }
}

function ocultarIndicadorCarregamento() {
    // O indicador será substituído pelo conteúdo real
}

function carregarDadosOffline() {
    // Simular dados offline
    const dadosOffline = {
        manutencao: [
            { id: 'offline1', status: 'pendente', titulo: 'Ar condicionado', quarto: '101', dataCriacao: new Date().toISOString().slice(0,10) }
        ],
        nutricao: [
            { id: 'offline2', status: 'pendente', titulo: 'Dieta especial', quarto: '102', dataCriacao: new Date().toISOString().slice(0,10) }
        ],
        higienizacao: [
            { id: 'offline3', status: 'em-andamento', titulo: 'Limpeza extra', quarto: '103', dataCriacao: new Date().toISOString().slice(0,10) }
        ],
        hotelaria: [
            { id: 'offline4', status: 'finalizada', titulo: 'Troca de roupas', quarto: '104', dataCriacao: new Date().toISOString().slice(0,10) }
        ]
    };
    
    atualizarMetricasPainel(4, 2, 1, 4);
    renderizarCardsEquipe(dadosOffline);
}

function criarDadosExemplo() {
    console.log('[DEBUG] Criando dados de exemplo para demonstração');
    
    const dadosExemplo = {
        manutencao: [
            { id: 'ex1', status: 'pendente', titulo: 'Reparo elétrico', quarto: '201A', dataCriacao: new Date().toISOString().slice(0,10), nome: 'João Silva' },
            { id: 'ex2', status: 'em-andamento', titulo: 'Manutenção AC', quarto: '205B', dataCriacao: new Date().toISOString().slice(0,10), nome: 'Maria Santos' }
        ],
        nutricao: [
            { id: 'ex3', status: 'pendente', titulo: 'Dieta sem glúten', quarto: '103C', dataCriacao: new Date().toISOString().slice(0,10), nome: 'Pedro Costa' }
        ],
        higienizacao: [
            { id: 'ex4', status: 'finalizada', titulo: 'Limpeza completa', quarto: '107A', dataCriacao: new Date().toISOString().slice(0,10), nome: 'Ana Paula' }
        ],
        hotelaria: [
            { id: 'ex5', status: 'pendente', titulo: 'Amenities extras', quarto: '210B', dataCriacao: new Date().toISOString().slice(0,10), nome: 'Carlos Lima' }
        ]
    };
    
    atualizarMetricasPainel(5, 3, 1, 5);
    renderizarCardsEquipe(dadosExemplo);
    
    showToast('Info', 'Dados de exemplo carregados para demonstração', 'success');
}

function atualizarMetricasPainel(total, pendentes, finalizadasHoje, quartosAtivos) {
    // Atualiza badge do menu para mostrar o papel do usuário
    const badge = document.getElementById('user-role-badge');
    if (badge) {
        const usuario = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
        if (usuario.role === 'super_admin') {
            badge.textContent = 'Super Administrador';
            badge.className = 'priority-badge priority-urgente';
        } else if (usuario.role === 'admin') {
            badge.textContent = 'Administrador';
            badge.className = 'priority-badge priority-alta';
        } else {
            badge.textContent = 'Equipe';
            badge.className = 'priority-badge priority-media';
        }
    }
    
    // Atualizar visibilidade dos botões
    atualizarVisibilidadeBotoes();
    
    // Remove loader visual (reforçado)
    setTimeout(() => {
        if (window._mainLoader) {
            window._mainLoader.remove();
            window._mainLoader = null;
        }
    }, 100);
    // Renderiza bloco de métricas centralizado
    let metricasEl = document.getElementById('metricas-painel');
    if (!metricasEl) {
        metricasEl = document.createElement('div');
        metricasEl.id = 'metricas-painel';
        metricasEl.className = 'metricas-painel';
        document.getElementById('admin-panel').insertAdjacentElement('afterbegin', metricasEl);
    }
    // Atualiza os cards do painel principal (HTML)
    const totalEl = document.getElementById('total-solicitacoes');
    const pendentesEl = document.getElementById('pendentes');
    const finalizadasEl = document.getElementById('finalizadas');
    const quartosEl = document.getElementById('quartos-ativos');
    if (totalEl) totalEl.textContent = total;
    if (pendentesEl) pendentesEl.textContent = pendentes;
    if (finalizadasEl) finalizadasEl.textContent = finalizadasHoje;
    if (quartosEl) quartosEl.textContent = quartosAtivos;
}

// Nova função para atualizar visibilidade dos botões
function atualizarVisibilidadeBotoes() {
    const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
    const btnNovoUsuario = document.getElementById('btn-novo-usuario');
    const btnGerenciarUsuarios = document.getElementById('manage-users-btn');
    const btnAcompanhantes = document.getElementById('acompanhantes-btn');
    const btnRelatorios = document.getElementById('relatorios-btn');
    const msgPermissao = document.getElementById('admin-permission-msg');
    const userRoleBadge = document.getElementById('user-role-badge');
    const panelTitle = document.getElementById('panel-title');
    
    console.log('[DEBUG] Atualizando botões para usuário:', usuarioAdmin);
    
    // Verificar tipo de usuário baseado nas coleções Firestore
    const isSuperAdmin = usuarioAdmin && usuarioAdmin.role === 'super_admin';
    const isEquipe = usuarioAdmin && (usuarioAdmin.role === 'equipe' || usuarioAdmin.isEquipe);
    const isAdmin = usuarioAdmin && usuarioAdmin.role === 'admin';
    
    console.log('[DEBUG] Tipo de usuário:', { 
        isSuperAdmin, 
        isEquipe, 
        isAdmin, 
        role: usuarioAdmin?.role, 
        equipe: usuarioAdmin?.equipe 
    });
    
    // Configurar título e badge baseado no tipo de usuário
    if (panelTitle) {
        if (isSuperAdmin) {
            panelTitle.textContent = '🏥 Painel Administrativo - Super Admin';
        } else if (isEquipe && usuarioAdmin.equipe) {
            const nomeEquipe = {
                'manutencao': 'Manutenção',
                'nutricao': 'Nutrição', 
                'higienizacao': 'Higienização',
                'hotelaria': 'Hotelaria'
            }[usuarioAdmin.equipe] || usuarioAdmin.equipe;
            panelTitle.textContent = `🏥 Painel ${nomeEquipe}`;
        } else if (isAdmin) {
            panelTitle.textContent = '🏥 Painel Administrativo';
        }
    }
    
    if (userRoleBadge) {
        if (isSuperAdmin) {
            userRoleBadge.textContent = 'Super Administrador';
            userRoleBadge.className = 'priority-badge priority-alta';
        } else if (isEquipe && usuarioAdmin.equipe) {
            const nomeEquipe = {
                'manutencao': 'Equipe Manutenção',
                'nutricao': 'Equipe Nutrição',
                'higienizacao': 'Equipe Higienização', 
                'hotelaria': 'Equipe Hotelaria'
            }[usuarioAdmin.equipe] || `Equipe ${usuarioAdmin.equipe}`;
            userRoleBadge.textContent = nomeEquipe;
            userRoleBadge.className = 'priority-badge priority-media';
        } else if (isAdmin) {
            userRoleBadge.textContent = 'Administrador';
            userRoleBadge.className = 'priority-badge priority-media';
        }
    }
    
    // Botão Criar Usuário - APENAS super_admin
    if (btnNovoUsuario) {
        if (isSuperAdmin) {
            btnNovoUsuario.classList.remove('btn-hide');
            btnNovoUsuario.style.display = 'inline-flex';
            console.log('[DEBUG] Botão Criar Usuário exibido para super_admin');
        } else {
            btnNovoUsuario.classList.add('btn-hide');
            btnNovoUsuario.style.display = 'none';
            console.log('[DEBUG] Botão Criar Usuário ocultado para usuário não super_admin');
        }
    }
    
    // Botão Gerenciar Usuários - APENAS super_admin
    if (btnGerenciarUsuarios) {
        if (isSuperAdmin) {
            btnGerenciarUsuarios.classList.remove('btn-hide');
            btnGerenciarUsuarios.style.display = 'inline-flex';
            console.log('[DEBUG] Botão Gerenciar Usuários exibido para super_admin');
        } else {
            btnGerenciarUsuarios.classList.add('btn-hide');
            btnGerenciarUsuarios.style.display = 'none';
            console.log('[DEBUG] Botão Gerenciar Usuários ocultado para usuário não super_admin');
        }
    }
    
    // Botão Acompanhantes - APENAS super_admin
    if (btnAcompanhantes) {
        if (isSuperAdmin) {
            btnAcompanhantes.classList.remove('btn-hide');
            btnAcompanhantes.style.display = 'inline-flex';
            console.log('[DEBUG] Botão Acompanhantes exibido para super_admin');
        } else {
            btnAcompanhantes.classList.add('btn-hide');
            btnAcompanhantes.style.display = 'none';
            console.log('[DEBUG] Botão Acompanhantes ocultado para usuário não super_admin');
        }
    }
    
    // Botão Relatórios - APENAS super_admin
    if (btnRelatorios) {
        if (isSuperAdmin) {
            btnRelatorios.classList.remove('btn-hide');
            btnRelatorios.style.display = 'inline-flex';
            console.log('[DEBUG] Botão Relatórios exibido para super_admin');
        } else {
            btnRelatorios.classList.add('btn-hide');
            btnRelatorios.style.display = 'none';
            console.log('[DEBUG] Botão Relatórios ocultado para usuário não super_admin');
        }
    }
    
    // Mensagem de permissão
    if (msgPermissao) {
        if (isEquipe && usuarioAdmin.equipe) {
            const nomeEquipe = {
                'manutencao': 'Manutenção',
                'nutricao': 'Nutrição',
                'higienizacao': 'Higienização',
                'hotelaria': 'Hotelaria'
            }[usuarioAdmin.equipe] || usuarioAdmin.equipe;
            
            msgPermissao.textContent = `Acesso da equipe: Visualização e gerenciamento de solicitações de ${nomeEquipe}`;
            msgPermissao.classList.remove('msg-permissao-hide');
            msgPermissao.style.display = 'block';
            msgPermissao.style.color = '#059669';
            msgPermissao.style.fontWeight = '500';
        } else if (!isSuperAdmin) {
            msgPermissao.textContent = 'Sem permissões administrativas';
            msgPermissao.classList.remove('msg-permissao-hide');
            msgPermissao.style.display = 'block';
            msgPermissao.style.color = '#dc2626';
        } else {
            msgPermissao.classList.add('msg-permissao-hide');
            msgPermissao.style.display = 'none';
        }
    }
    
    // Log final do estado dos botões
    console.log('[DEBUG] Estado final dos botões:', {
        role: usuarioAdmin?.role,
        equipe: usuarioAdmin?.equipe,
        isSuperAdmin,
        isEquipe,
        isAdmin,
        btnNovoUsuario: btnNovoUsuario ? !btnNovoUsuario.classList.contains('btn-hide') : 'não encontrado',
        btnGerenciarUsuarios: btnGerenciarUsuarios ? !btnGerenciarUsuarios.classList.contains('btn-hide') : 'não encontrado',
        btnAcompanhantes: btnAcompanhantes ? !btnAcompanhantes.classList.contains('btn-hide') : 'não encontrado',
        btnRelatorios: btnRelatorios ? !btnRelatorios.classList.contains('btn-hide') : 'não encontrado'
    });
}

// Função para configurar eventos dos botões
function configurarEventosBotoes() {
    console.log('[DEBUG] configurarEventosBotoes: iniciando configuração...');
    
    const btnNovoUsuario = document.getElementById('btn-novo-usuario');
    const btnGerenciarUsuarios = document.getElementById('manage-users-btn');
    
    console.log('[DEBUG] configurarEventosBotoes: botões encontrados:', {
        btnNovoUsuario: !!btnNovoUsuario,
        btnGerenciarUsuarios: !!btnGerenciarUsuarios,
        btnNovoUsuarioVisible: btnNovoUsuario ? !btnNovoUsuario.classList.contains('btn-hide') : false,
        btnGerenciarVisible: btnGerenciarUsuarios ? !btnGerenciarUsuarios.classList.contains('btn-hide') : false
    });
    
    if (btnNovoUsuario) {
        // Remove qualquer evento anterior
        btnNovoUsuario.onclick = null;
        
        btnNovoUsuario.onclick = function(e) {
            console.log('[LOG] CLIQUE no botão Criar Usuário detectado');
            e.preventDefault();
            e.stopPropagation();
            
            try {
                console.log('[DEBUG] Verificando função showCreateUserModal...');
                
                if (typeof window.showCreateUserModal !== 'function') {
                    console.error('[ERRO] showCreateUserModal não está definida!');
                    alert('Erro: Função showCreateUserModal não encontrada!');
                    return;
                }
                
                console.log('[DEBUG] Chamando showCreateUserModal...');
                window.showCreateUserModal();
                
            } catch (err) {
                console.error('[ERRO] Falha ao abrir modal Criar Usuário:', err);
                alert('Erro ao abrir modal Criar Usuário: ' + err.message);
            }
        };
        
        // Garantir que o botão é sempre clicável
        btnNovoUsuario.style.pointerEvents = 'auto';
        btnNovoUsuario.style.cursor = 'pointer';
        
        console.log('[DEBUG] Evento configurado para Criar Usuário');
    } else {
        console.warn('[AVISO] Botão Criar Usuário não encontrado!');
    }
    
    if (btnGerenciarUsuarios) {
        // Remove qualquer evento anterior
        btnGerenciarUsuarios.onclick = null;
        
        btnGerenciarUsuarios.onclick = function(e) {
            console.log('[LOG] CLIQUE no botão Gerenciar Usuários detectado');
            e.preventDefault();
            e.stopPropagation();
            
            try {
                console.log('[DEBUG] Verificando função showManageUsersModal...');
                
                if (typeof window.showManageUsersModal !== 'function') {
                    console.error('[ERRO] showManageUsersModal não está definida!');
                    alert('Erro: Função showManageUsersModal não encontrada!');
                    return;
                }
                
                console.log('[DEBUG] Chamando showManageUsersModal...');
                window.showManageUsersModal();
                
            } catch (err) {
                console.error('[ERRO] Falha ao abrir modal Gerenciar Usuários:', err);
                alert('Erro ao abrir modal Gerenciar Usuários: ' + err.message);
            }
        };
        
        // Garantir que o botão é sempre clicável
        btnGerenciarUsuarios.style.pointerEvents = 'auto';
        btnGerenciarUsuarios.style.cursor = 'pointer';
        
        console.log('[DEBUG] Evento configurado para Gerenciar Usuários');
    } else {
        console.warn('[AVISO] Botão Gerenciar Usuários não encontrado!');
    }
    
    console.log('[DEBUG] configurarEventosBotoes: configuração finalizada');
    
    // Forçar exibição dos botões se usuário tem permissão
    setTimeout(() => {
        if (window.userRole === 'admin' || window.userRole === 'super_admin') {
            if (btnNovoUsuario) {
                btnNovoUsuario.classList.remove('btn-hide');
                btnNovoUsuario.style.display = 'inline-flex';
            }
            if (btnGerenciarUsuarios) {
                btnGerenciarUsuarios.classList.remove('btn-hide');
                btnGerenciarUsuarios.style.display = 'inline-flex';
            }
            console.log('[DEBUG] Botões forçados a exibir para admin');
        }
    }, 100);
}

// Função auxiliar para reconfigurar botões quando necessário
window.reconfigurarBotoes = function() {
    console.log('[DEBUG] reconfigurarBotoes: forçando reconfiguração...');
    
    // Remove flags de configuração para forçar reconfiguração
    const btnNovoUsuario = document.getElementById('btn-novo-usuario');
    const btnGerenciarUsuarios = document.getElementById('manage-users-btn');
    
    if (btnNovoUsuario) {
        delete btnNovoUsuario.dataset.configured;
    }
    if (btnGerenciarUsuarios) {
        delete btnGerenciarUsuarios.dataset.configured;
    }
    
    // Reconfigura os botões
    atualizarVisibilidadeBotoes();
    configurarEventosBotoes();
    
    console.log('[DEBUG] reconfigurarBotoes: reconfiguração concluída');
};

// Função de debug para verificar estado dos modais
window.debugModals = function() {
    const modalCriar = document.getElementById('modal-novo-usuario');
    const modalGerenciar = document.getElementById('manage-users-modal');
    
    console.log('[DEBUG] Estado dos modais:', {
        modalCriar: {
            exists: !!modalCriar,
            hidden: modalCriar ? modalCriar.classList.contains('hidden') : 'N/A',
            display: modalCriar ? modalCriar.style.display : 'N/A'
        },
        modalGerenciar: {
            exists: !!modalGerenciar,
            hidden: modalGerenciar ? modalGerenciar.classList.contains('hidden') : 'N/A',
            display: modalGerenciar ? modalGerenciar.style.display : 'N/A'
        },
        funcoes: {
            showCreateUserModal: typeof window.showCreateUserModal,
            showManageUsersModal: typeof window.showManageUsersModal
        }
    });
    
    return {
        modalCriar: !!modalCriar,
        modalGerenciar: !!modalGerenciar,
        funcoes: {
            showCreateUserModal: typeof window.showCreateUserModal,
            showManageUsersModal: typeof window.showManageUsersModal
        }
    };
};

// Função de teste para os botões
window.testarBotoes = function() {
    console.log('=== TESTE DOS BOTÕES ===');
    
    const btnCriar = document.getElementById('btn-novo-usuario');
    const btnGerenciar = document.getElementById('manage-users-btn');
    
    console.log('Botão Criar Usuário:', {
        existe: !!btnCriar,
        visivel: btnCriar ? !btnCriar.classList.contains('btn-hide') : false,
        display: btnCriar ? btnCriar.style.display : 'N/A',
        onclick: btnCriar ? !!btnCriar.onclick : false
    });
    
    console.log('Botão Gerenciar Usuários:', {
        existe: !!btnGerenciar,
        visivel: btnGerenciar ? !btnGerenciar.classList.contains('btn-hide') : false,
        display: btnGerenciar ? btnGerenciar.style.display : 'N/A',
        onclick: btnGerenciar ? !!btnGerenciar.onclick : false
    });
    
    console.log('Funções disponíveis:', {
        showCreateUserModal: typeof window.showCreateUserModal,
        showManageUsersModal: typeof window.showManageUsersModal,
        userRole: window.userRole,
        usuarioAdmin: !!window.usuarioAdmin
    });
    
    // Teste manual dos modals
    console.log('Testando função showCreateUserModal...');
    try {
        if (typeof window.showCreateUserModal === 'function') {
            console.log('✅ showCreateUserModal está disponível');
        } else {
            console.error('❌ showCreateUserModal NÃO está disponível');
        }
    } catch (e) {
        console.error('❌ Erro ao verificar showCreateUserModal:', e);
    }
    
    console.log('Testando função showManageUsersModal...');
    try {
        if (typeof window.showManageUsersModal === 'function') {
            console.log('✅ showManageUsersModal está disponível');
        } else {
            console.error('❌ showManageUsersModal NÃO está disponível');
        }
    } catch (e) {
        console.error('❌ Erro ao verificar showManageUsersModal:', e);
    }
    
    console.log('=== FIM DO TESTE ===');
};

// Função para forçar inicialização completa dos botões
window.forcarInicializacao = function() {
    console.log('[FORCE] Forçando inicialização completa...');
    
    // Garantir que todas as funções estão definidas
    if (typeof window.showCreateUserModal !== 'function') {
        console.error('[FORCE] showCreateUserModal não está definida - redefinindo...');
        // A função já está definida acima no código
    }
    
    if (typeof window.showManageUsersModal !== 'function') {
        console.error('[FORCE] showManageUsersModal não está definida - redefinindo...');
        // A função já está definida acima no código
    }
    
    // Forçar atualização de visibilidade
    atualizarVisibilidadeBotoes();
    
    // Reconfigurar eventos
    configurarEventosBotoes();
    
    // Teste final
    window.testarBotoes();
    
    console.log('[FORCE] Inicialização forçada concluída');
};

// Função de inicialização de emergência para quando Firebase falha
window.inicializacaoEmergencia = function() {
    console.log('[EMERGENCY] Iniciando modo de emergência...');
    
    // Definir usuário admin de emergência
    window.userRole = 'admin';
    window.usuarioAdmin = { 
        role: 'admin', 
        nome: 'Admin Emergência', 
        email: 'admin@emergencia.local',
        isAdmin: true
    };
    
    // Mostrar painel
    document.getElementById('auth-section')?.classList.add('hidden');
    document.getElementById('admin-panel')?.classList.remove('hidden');
    
    // Forçar visibilidade dos botões
    const btnNovoUsuario = document.getElementById('btn-novo-usuario');
    const btnGerenciarUsuarios = document.getElementById('manage-users-btn');
    
    if (btnNovoUsuario) {
        btnNovoUsuario.classList.remove('btn-hide');
        btnNovoUsuario.style.display = 'inline-flex';
        btnNovoUsuario.style.visibility = 'visible';
    }
    
    if (btnGerenciarUsuarios) {
        btnGerenciarUsuarios.classList.remove('btn-hide');
        btnGerenciarUsuarios.style.display = 'inline-flex';
        btnGerenciarUsuarios.style.visibility = 'visible';
    }
    
    // Configurar eventos
    configurarEventosBotoes();
    
    showToast('Modo Emergência', 'Sistema iniciado em modo de emergência - funcionalidade limitada', 'warning');
    
    console.log('[EMERGENCY] Modo de emergência ativo');
};

// Expor função para debug direto no console
window.debug = {
    testarBotoes: window.testarBotoes,
    debugModals: window.debugModals,
    forcarInicializacao: window.forcarInicializacao,
    reconfigurarBotoes: window.reconfigurarBotoes,
    inicializacaoEmergencia: window.inicializacaoEmergencia,
    loginDev: window.loginDesenvolvimento
};

// ========== FUNÇÕES DE ACESSO RÁPIDO ==========
// Para usar no console quando há problemas de login:

// 1. Login rápido de desenvolvimento
window.loginRapido = function() {
    console.log('🚀 ATIVANDO LOGIN RÁPIDO...');
    window.loginDesenvolvimento('admin@rapido.local');
    console.log('✅ Login rápido ativado!');
    return 'Login realizado em modo desenvolvimento';
};

// 2. Corrigir tudo de uma vez
window.corrigirTudo = function() {
    console.log('🔧 CORRIGINDO TODOS OS PROBLEMAS...');
    
    // 1. Login de desenvolvimento
    window.loginDesenvolvimento('admin@corrigir.local');
    
    // 2. Configurar botões
    setTimeout(() => {
        window.solucionarBotoes();
    }, 500);
    
    // 3. Mostrar painel
    setTimeout(() => {
        mostrarSecaoPainel('painel');
    }, 1000);
    
    console.log('🎉 TUDO CORRIGIDO!');
    return 'Sistema totalmente funcional em modo desenvolvimento';
};

// 3. Criar usuário admin de teste (se Firebase estiver funcionando)
window.criarUsuarioTeste = async function() {
    console.log('👤 CRIANDO USUÁRIO DE TESTE...');
    
    if (!window.auth) {
        console.error('Firebase Auth não disponível');
        return 'Firebase não disponível';
    }
    
    const emailTeste = 'admin@teste.com';
    const senhaTeste = '123456';
    
    try {
        // Tentar criar o usuário
        const userCredential = await window.auth.createUserWithEmailAndPassword(emailTeste, senhaTeste);
        console.log('✅ Usuário de teste criado:', emailTeste);
        
        // Adicionar aos admins no Firestore
        if (window.db) {
            await window.db.collection('usuarios_admin').doc(userCredential.user.uid).set({
                nome: 'Admin Teste',
                email: emailTeste,
                role: 'admin',
                criadoEm: new Date().toISOString(),
                ativo: true
            });
            console.log('✅ Usuário adicionado como admin no Firestore');
        }
        
        showToast('Sucesso', `Usuário criado: ${emailTeste} / 123456`, 'success');
        return `Usuário criado: ${emailTeste} / senha: ${senhaTeste}`;
        
    } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
            console.log('✅ Usuário já existe:', emailTeste);
            showToast('Info', `Usuário já existe: ${emailTeste} / 123456`, 'warning');
            return `Usuário já existe: ${emailTeste} / senha: ${senhaTeste}`;
        } else {
            console.error('❌ Erro ao criar usuário:', error);
            showToast('Erro', 'Erro ao criar usuário de teste', 'error');
            return 'Erro ao criar usuário: ' + error.message;
        }
    }
};

// 4. Mostrar ajuda de desenvolvimento
window.mostrarAjudaDev = function() {
    const devHelp = document.getElementById('dev-help');
    if (devHelp) {
        devHelp.style.display = 'block';
        console.log('ℹ️ Ajuda de desenvolvimento exibida');
    }
};

// 5. Função para mostrar todas as opções disponíveis
window.ajuda = function() {
    console.log(`
🆘 === FUNÇÕES DE AJUDA DISPONÍVEIS ===

PARA PROBLEMAS DE LOGIN:
• loginRapido() - Login rápido em modo desenvolvimento
• corrigirTudo() - Corrige todos os problemas de uma vez
• criarUsuarioTeste() - Cria usuário admin@teste.com / 123456

PARA PROBLEMAS DE BOTÕES:
• solucionarBotoes() - Força funcionamento dos botões
• debug.testarBotoes() - Testa estado dos botões
• debug.forcarInicializacao() - Força reinicialização

PARA DEBUG:
• debug.debugModals() - Verifica estado dos modais
• debug.inicializacaoEmergencia() - Modo emergência completo
• mostrarAjudaDev() - Mostra ajuda na tela

EXEMPLO DE USO:
Se os botões não funcionam após login, execute:
corrigirTudo()

==========================================
    `);
    
    return 'Veja o console para lista completa de funções';
};

// Funções para fechar modais
window.closeCreateUserModal = function() {
    console.log('[DEBUG] closeCreateUserModal: fechando modal...');
    const modal = document.getElementById('modal-novo-usuario');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        console.log('[DEBUG] closeCreateUserModal: modal fechado');
    }
};

// Função de teste para verificar as melhorias nos cards
function testarMelhoriasCards() {
    console.log('[TESTE] Verificando melhorias nos cards...');
    
    // Log das funções existentes
    console.log('[TESTE] abrirSolicitacaoModal:', typeof abrirSolicitacaoModal);
    console.log('[TESTE] fecharSolicitacaoModal:', typeof fecharSolicitacaoModal);
    console.log('[TESTE] window.fecharSolicitacaoModal:', typeof window.fecharSolicitacaoModal);
    
    const cards = document.querySelectorAll('.solicitacao-card');
    console.log('[TESTE] Cards encontrados:', cards.length);
    
    cards.forEach((card, index) => {
        console.log(`[TESTE] Card ${index + 1}:`, {
            hasDataSolicitacao: !!card.dataset.solicitacao,
            hasClickEvent: !!card.onclick,
            isClickable: card.style.cursor === 'pointer'
        });
    });
    
    return {
        cardsEncontrados: cards.length,
        funcaoAbrirModal: typeof abrirSolicitacaoModal,
        funcaoFecharModal: typeof fecharSolicitacaoModal,
        funcaoFecharGlobal: typeof window.fecharSolicitacaoModal,
        testeCompleto: 'OK'
    };
}

// Funções para gerenciar status das solicitações (para equipes)
async function alterarStatusSolicitacao(solicitacaoId, novoStatus) {
    if (!window.db || !solicitacaoId) {
        showToast('Erro', 'Parâmetros inválidos', 'error');
        return;
    }

    try {
        const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
        
        // Verificar se o usuário pode alterar esta solicitação
        const solicitacaoDoc = await window.db.collection('solicitacoes').doc(solicitacaoId).get();
        if (!solicitacaoDoc.exists) {
            showToast('Erro', 'Solicitação não encontrada', 'error');
            return;
        }
        
        const solicitacaoData = solicitacaoDoc.data();
        
        // Verificar permissões usando a função de filtro
        if (!podeVerSolicitacaoJS(usuarioAdmin, solicitacaoData)) {
            showToast('Erro', 'Você não tem permissão para alterar esta solicitação', 'error');
            console.warn('[AVISO] alterarStatusSolicitacao: acesso negado para equipe:', usuarioAdmin.equipe, 'solicitação equipe:', solicitacaoData.equipe);
            return;
        }
        
        console.log(`[DEBUG] Alterando status da solicitação ${solicitacaoId} para ${novoStatus}`);
        
        const updateData = {
            status: novoStatus,
            dataAtualizacao: new Date().toISOString()
        };

        // Se está iniciando atendimento, adicionar responsável
        if (novoStatus === 'em-andamento' && usuarioAdmin.nome) {
            updateData.responsavel = usuarioAdmin.nome;
            updateData.dataInicioAtendimento = new Date().toISOString();
        }

        await window.db.collection('solicitacoes').doc(solicitacaoId).update(updateData);
        
        showToast('Sucesso', `Status alterado para: ${novoStatus}`, 'success');
        
        // Fechar modal e recarregar dados
        fecharSolicitacaoModal();
        carregarSolicitacoes();
        
    } catch (error) {
        console.error('Erro ao alterar status:', error);
        showToast('Erro', 'Não foi possível alterar o status: ' + (error.message || error), 'error');
    }
}

async function finalizarSolicitacao(solicitacaoId) {
    if (!window.db || !solicitacaoId) {
        showToast('Erro', 'Parâmetros inválidos', 'error');
        return;
    }

    try {
        const usuarioAdmin = window.usuarioAdmin || JSON.parse(localStorage.getItem('usuarioAdmin') || '{}');
        
        // Verificar se o usuário pode finalizar esta solicitação
        const solicitacaoDoc = await window.db.collection('solicitacoes').doc(solicitacaoId).get();
        if (!solicitacaoDoc.exists) {
            showToast('Erro', 'Solicitação não encontrada', 'error');
            return;
        }
        
        const solicitacaoData = solicitacaoDoc.data();
        
        // Verificar permissões usando a função de filtro
        if (!podeVerSolicitacaoJS(usuarioAdmin, solicitacaoData)) {
            showToast('Erro', 'Você não tem permissão para finalizar esta solicitação', 'error');
            console.warn('[AVISO] finalizarSolicitacao: acesso negado para equipe:', usuarioAdmin.equipe, 'solicitação equipe:', solicitacaoData.equipe);
            return;
        }

        // Solicitar descrição da solução
        const solucao = prompt('Descreva brevemente a solução aplicada (opcional):');
        
        console.log(`[DEBUG] Finalizando solicitação ${solicitacaoId}`);
        
        const updateData = {
            status: 'finalizada',
            dataFinalizacao: new Date().toISOString(),
            dataAtualizacao: new Date().toISOString()
        };

        if (usuarioAdmin.nome) {
            updateData.responsavel = usuarioAdmin.nome;
        }

        if (solucao && solucao.trim()) {
            updateData.solucao = solucao.trim();
        }

        await window.db.collection('solicitacoes').doc(solicitacaoId).update(updateData);
        
        showToast('Sucesso', 'Solicitação finalizada com sucesso!', 'success');
        
        // Fechar modal e recarregar dados
        fecharSolicitacaoModal();
        carregarSolicitacoes();
        
    } catch (error) {
        console.error('Erro ao finalizar solicitação:', error);
        showToast('Erro', 'Não foi possível finalizar a solicitação: ' + (error.message || error), 'error');
    }
}

// Expor funções globalmente para uso nos modais
window.alterarStatusSolicitacao = alterarStatusSolicitacao;
window.finalizarSolicitacao = finalizarSolicitacao;
window.testarMelhoriasCards = testarMelhoriasCards;

window.closeManageUsersModal = function() {
    console.log('[DEBUG] closeManageUsersModal: fechando modal...');
    const modal = document.getElementById('manage-users-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
        console.log('[DEBUG] closeManageUsersModal: modal fechado');
    }
};

// ========== FUNÇÃO DE SOLUÇÃO RÁPIDA ==========
// Execute no console: solucionarBotoes()
window.solucionarBotoes = function() {
    console.log('🔧 SOLUCIONANDO PROBLEMA DOS BOTÕES...');
    
    // 1. Garantir que o usuário tem permissão
    if (!window.userRole) {
        window.userRole = 'admin';
        console.log('✅ UserRole definido como admin');
    }
    
    if (!window.usuarioAdmin) {
        window.usuarioAdmin = { 
            role: 'admin', 
            nome: 'Admin', 
            email: 'admin@yuna.com.br',
            isAdmin: true
        };
        console.log('✅ UsuarioAdmin definido');
    }
    
    // 2. Forçar exibição dos botões
    const btnNovoUsuario = document.getElementById('btn-novo-usuario');
    const btnGerenciarUsuarios = document.getElementById('manage-users-btn');
    
    if (btnNovoUsuario) {
        btnNovoUsuario.classList.remove('btn-hide');
        btnNovoUsuario.style.display = 'inline-flex';
        btnNovoUsuario.style.visibility = 'visible';
        btnNovoUsuario.style.pointerEvents = 'auto';
        console.log('✅ Botão Criar Usuário exibido');
    }
    
    if (btnGerenciarUsuarios) {
        btnGerenciarUsuarios.classList.remove('btn-hide');
        btnGerenciarUsuarios.style.display = 'inline-flex';
        btnGerenciarUsuarios.style.visibility = 'visible';
        btnGerenciarUsuarios.style.pointerEvents = 'auto';
        console.log('✅ Botão Gerenciar Usuários exibido');
    }
    
    // 3. Configurar eventos dos botões
    configurarEventosBotoes();
    console.log('✅ Eventos dos botões configurados');
    
    // 4. Testar botões
    window.testarBotoes();
    
    console.log('🎉 PROBLEMA RESOLVIDO! Os botões devem funcionar agora.');
    showToast('Sucesso', 'Botões corrigidos com sucesso!', 'success');
    
    return 'Solução aplicada com sucesso!';
};

// ========== MODO DESENVOLVIMENTO ==========
window.loginDesenvolvimento = function(email = 'admin@dev.local') {
    console.log('[DEV] Ativando modo desenvolvimento...');
    
    // Simular usuário admin
    window.userRole = 'admin';
    window.usuarioAdmin = {
        role: 'admin',
        nome: 'Admin Desenvolvimento',
        email: email,
        isAdmin: true,
        isDev: true
    };
    
    window.userEmail = email;
    localStorage.setItem('usuarioAdmin', JSON.stringify(window.usuarioAdmin));
    
    // Ocultar tela de login
    document.getElementById('auth-section')?.classList.add('hidden');
    document.getElementById('admin-panel')?.classList.remove('hidden');
    
    // Atualizar badge
    const badge = document.getElementById('user-role-badge');
    if (badge) {
        badge.textContent = 'Admin Desenvolvimento';
        badge.style.backgroundColor = '#f59e0b'; // Cor diferente para modo dev
    }
    
    // Configurar botões
    setTimeout(() => {
        atualizarVisibilidadeBotoes();
        configurarEventosBotoes();
        
        // Forçar exibição dos botões
        const btnNovoUsuario = document.getElementById('btn-novo-usuario');
        const btnGerenciarUsuarios = document.getElementById('manage-users-btn');
        
        if (btnNovoUsuario) {
            btnNovoUsuario.classList.remove('btn-hide');
            btnNovoUsuario.style.display = 'inline-flex';
        }
        
        if (btnGerenciarUsuarios) {
            btnGerenciarUsuarios.classList.remove('btn-hide');
            btnGerenciarUsuarios.style.display = 'inline-flex';
        }
        
        console.log('[DEV] Botões configurados em modo desenvolvimento');
    }, 100);
    
    // Mostrar painel principal
    mostrarSecaoPainel('painel');
    
    // Mostrar dados de desenvolvimento nas métricas
    setTimeout(() => {
        carregarDadosDesenvolvimento();
    }, 500);
    
    showToast('Modo Dev', 'Modo desenvolvimento ativado - dados simulados', 'warning');
    console.log('[DEV] Modo desenvolvimento ativo');
};

// Função para carregar dados simulados no modo desenvolvimento
window.carregarDadosDesenvolvimento = function() {
    console.log('[DEV] Carregando dados simulados...');
    
    // Simular métricas
    const stats = [
        { id: 'total-solicitacoes', value: '42' },
        { id: 'pendentes', value: '12' },
        { id: 'em-andamento', value: '18' },
        { id: 'finalizadas', value: '12' }
    ];
    
    stats.forEach(stat => {
        const element = document.getElementById(stat.id);
        if (element) {
            element.textContent = stat.value;
        }
    });
    
    // Simular cards de equipe
    const teamsGrid = document.querySelector('.teams-grid');
    if (teamsGrid) {
        teamsGrid.innerHTML = `
            <div class="team-card" onclick="verSolicitacoesEquipe('manutencao')">
                <div class="team-icon">🔧</div>
                <div class="team-info">
                    <h3>Manutenção</h3>
                    <div class="team-stats">
                        <span class="pendentes">3 pendentes</span>
                        <span class="andamento">2 em andamento</span>
                        <span class="finalizadas">7 finalizadas</span>
                    </div>
                </div>
            </div>
            <div class="team-card" onclick="verSolicitacoesEquipe('nutricao')">
                <div class="team-icon">🍽️</div>
                <div class="team-info">
                    <h3>Nutrição</h3>
                    <div class="team-stats">
                        <span class="pendentes">2 pendentes</span>
                        <span class="andamento">4 em andamento</span>
                        <span class="finalizadas">1 finalizadas</span>
                    </div>
                </div>
            </div>
            <div class="team-card" onclick="verSolicitacoesEquipe('higienizacao')">
                <div class="team-icon">🧽</div>
                <div class="team-info">
                    <h3>Higienização</h3>
                    <div class="team-stats">
                        <span class="pendentes">4 pendentes</span>
                        <span class="andamento">6 em andamento</span>
                        <span class="finalizadas">2 finalizadas</span>
                    </div>
                </div>
            </div>
            <div class="team-card" onclick="verSolicitacoesEquipe('hotelaria')">
                <div class="team-icon">🏨</div>
                <div class="team-info">
                    <h3>Hotelaria</h3>
                    <div class="team-stats">
                        <span class="pendentes">3 pendentes</span>
                        <span class="andamento">6 em andamento</span>
                        <span class="finalizadas">2 finalizadas</span>
                    </div>
                </div>
            </div>
        `;
        teamsGrid.classList.remove('hidden');
    }
    
    console.log('[DEV] Dados simulados carregados');
};

function renderizarCardsEquipe(equipes) {
    // Remove loader visual ao finalizar renderização dos cards
    if (window._mainLoader) {
        window._mainLoader.remove();
        window._mainLoader = null;
    }
    
    const icones = {
        manutencao: 'tools',
        nutricao: 'utensils',
        higienizacao: 'broom',
        hotelaria: 'bed'
    };
    
    const equipesNomes = {
        manutencao: 'Manutenção',
        nutricao: 'Nutrição',
        higienizacao: 'Higienização',
        hotelaria: 'Hotelaria'
    };
    
    // Função para formatar data e hora
    function formatarDataHora(timestamp) {
        if (!timestamp) return 'Não informado';
        try {
            const data = new Date(timestamp);
            const hoje = new Date();
            const diffTime = hoje - data;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
            const diffMinutes = Math.floor(diffTime / (1000 * 60));
            
            if (diffDays > 0) {
                return `há ${diffDays} dia${diffDays > 1 ? 's' : ''}`;
            } else if (diffHours > 0) {
                return `há ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
            } else if (diffMinutes > 0) {
                return `há ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`;
            } else {
                return 'agora mesmo';
            }
        } catch (error) {
            return 'Tempo inválido';
        }
    }
    
    // Função para obter prioridade visual baseada no status e tempo
    function obterPrioridade(solicitacao) {
        if (solicitacao.status === 'finalizada') return 'baixa';
        if (solicitacao.status === 'em-andamento') return 'media';
        
        // Para solicitações pendentes, verificar tempo
        const agora = new Date();
        const criacao = new Date(solicitacao.dataCriacao);
        const diffHoras = (agora - criacao) / (1000 * 60 * 60);
        
        if (diffHoras > 24) return 'alta';
        if (diffHoras > 12) return 'media';
        return 'normal';
    }

    const gridContainer = document.querySelector('.teams-grid');
    if (!gridContainer) return;
    
    // Limpar container
    gridContainer.innerHTML = '';
    
    // Verificar se há equipes para mostrar
    const equipesParaMostrar = Object.keys(equipes).filter(equipe => 
        equipes[equipe] && Array.isArray(equipes[equipe])
    );
    
    if (equipesParaMostrar.length === 0) {
        gridContainer.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 3rem;">
                <i class="fas fa-inbox" style="font-size: 3rem; color: #cbd5e1; margin-bottom: 1rem;"></i>
                <h3 style="color: #64748b; margin-bottom: 0.5rem;">Nenhuma solicitação encontrada</h3>
                <p style="color: #94a3b8;">Não há solicitações para exibir no momento.</p>
            </div>
        `;
        return;
    }
    
    // Renderizar cada equipe
    equipesParaMostrar.forEach(equipe => {
        const solicitacoes = equipes[equipe] || [];
        
        // Ordenar solicitações por prioridade e data
        const solicitacoesOrdenadas = [...solicitacoes].sort((a, b) => {
            const prioridadeA = obterPrioridade(a);
            const prioridadeB = obterPrioridade(b);
            const prioridades = { 'alta': 3, 'media': 2, 'normal': 1, 'baixa': 0 };
            
            if (prioridades[prioridadeA] !== prioridades[prioridadeB]) {
                return prioridades[prioridadeB] - prioridades[prioridadeA];
            }
            
            return new Date(b.dataCriacao) - new Date(a.dataCriacao);
        });
        
        const panel = document.createElement('div');
        panel.className = 'team-panel';
        panel.setAttribute('data-department', equipe);
        
        panel.innerHTML = `
            <div class="team-header ${equipe}">
                <h3>
                    <i class="fas fa-${icones[equipe]}"></i>
                    ${equipesNomes[equipe]}
                </h3>
                <span class="badge" id="count-${equipe}">${solicitacoes.length}</span>
            </div>
            <div class="team-content" id="content-${equipe}">
                ${solicitacoes.length === 0 ? `
                    <div class="empty-state">
                        <i class="fas fa-${icones[equipe]}"></i>
                        <p>Nenhuma solicitação de ${equipesNomes[equipe].toLowerCase()}</p>
                    </div>
                ` : `
                    ${solicitacoesOrdenadas.map((solicitacao, index) => `
                        <div class="solicitacao-card" 
                             data-solicitacao='${JSON.stringify(solicitacao).replace(/'/g, '&apos;')}' 
                             data-equipe="${equipe}" 
                             data-index="${index}" 
                             data-status="${solicitacao.status || 'pendente'}"
                             onclick="abrirSolicitacaoModal(${JSON.stringify(solicitacao).replace(/'/g, '&apos;')})">
                            
                            <div class="card-header">
                                <span class="card-status status-${solicitacao.status || 'pendente'}">
                                    ${solicitacao.status || 'pendente'}
                                </span>
                                <div class="card-actions">
                                    <button class="action-btn view" title="Ver detalhes">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                            </div>
                            
                            <div class="card-title">
                                ${solicitacao.titulo || solicitacao.tipo || solicitacao.descricao || solicitacao.nome || 'Solicitação sem título'}
                            </div>
                            
                            <div class="card-details">
                                ${solicitacao.quarto ? `
                                    <div class="card-detail">
                                        <i class="fas fa-bed"></i>
                                        <span>Quarto ${solicitacao.quarto}</span>
                                    </div>
                                ` : ''}
                                
                                ${solicitacao.nome ? `
                                    <div class="card-detail">
                                        <i class="fas fa-user"></i>
                                        <span>${solicitacao.nome}</span>
                                    </div>
                                ` : ''}
                                
                                ${solicitacao.descricao && solicitacao.descricao !== solicitacao.titulo ? `
                                    <div class="card-detail">
                                        <i class="fas fa-comment"></i>
                                        <span>${solicitacao.descricao.length > 60 ? 
                                            solicitacao.descricao.substring(0, 60) + '...' : 
                                            solicitacao.descricao}</span>
                                    </div>
                                ` : ''}
                                
                                ${solicitacao.status === 'finalizada' && solicitacao.dataFinalizacao ? `
                                    <div class="card-detail highlight">
                                        <i class="fas fa-check-circle"></i>
                                        <span>Finalizada ${formatarDataHora(solicitacao.dataFinalizacao)}</span>
                                    </div>
                                ` : ''}
                            </div>
                            
                            <div class="card-meta">
                                <div class="card-time">
                                    <i class="fas fa-clock"></i>
                                    <span>${formatarDataHora(solicitacao.dataCriacao)}</span>
                                </div>
                                <div class="card-priority priority-${obterPrioridade(solicitacao)}">
                                    ${obterPrioridade(solicitacao) === 'alta' ? '🔴' : 
                                      obterPrioridade(solicitacao) === 'media' ? '🟡' : 
                                      obterPrioridade(solicitacao) === 'normal' ? '🟢' : '⚪'}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                `}
            </div>
        `;
        
        gridContainer.appendChild(panel);
    });
    
    // Adicionar eventos aos cards após renderização
    adicionarEventosSolicitacoes();
    
    console.log(`[DEBUG] Cards renderizados para ${equipesParaMostrar.length} equipe(s)`);
}

// === MODAL DE SOLICITAÇÃO (VERSÃO LIMPA) ===
function abrirSolicitacaoModal(solicitacao) {
    console.log('[DEBUG] Abrindo modal para:', solicitacao.id, 'Status:', solicitacao.status);
    mostrarModal(solicitacao);
}

function mostrarModal(solicitacao) {
    // Criar modal se não existir
    let modal = document.getElementById('solicitacao-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'solicitacao-modal';
        modal.className = 'modal hidden';
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0, 0, 0, 0.5); display: flex; justify-content: center; align-items: center; z-index: 1000;';
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 600px; max-height: 80vh; overflow-y: auto; position: relative; background: white; border-radius: 12px; padding: 24px;">
                <span onclick="fecharSolicitacaoModal()" style="position: absolute; top: 15px; right: 20px; font-size: 24px; cursor: pointer; color: #6b7280;">&times;</span>
                <h2 style="margin-bottom: 20px; color: #374151; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">Detalhes da Solicitação</h2>
                <div id="modal-detalhes"></div>
                <div style="margin-top: 20px; text-align: right;">
                    <button onclick="fecharSolicitacaoModal()" style="background: #6b7280; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Fechar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }

    // Preencher detalhes
    const detalhesEl = document.getElementById('modal-detalhes');
    if (detalhesEl && solicitacao) {
        const statusInfo = {
            'pendente': { cor: '#dc2626', icone: 'clock', texto: 'Pendente' },
            'em-andamento': { cor: '#d97706', icone: 'spinner', texto: 'Em Andamento' },
            'finalizada': { cor: '#059669', icone: 'check-circle', texto: 'Finalizada' }
        };
        
        const info = statusInfo[solicitacao.status] || statusInfo['pendente'];
        
        detalhesEl.innerHTML = `
            <div style="background: #f9fafb; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
                <div style="display: flex; align-items: center; margin-bottom: 8px;">
                    <i class="fas fa-${info.icone}" style="color: ${info.cor}; margin-right: 8px; font-size: 18px;"></i>
                    <span style="font-weight: 600; color: ${info.cor}; font-size: 16px;">${info.texto}</span>
                </div>
                <div style="font-size: 18px; font-weight: 600; color: #374151;">${solicitacao.titulo || solicitacao.tipo || solicitacao.descricao || 'Solicitação'}</div>
            </div>
            <div><strong>ID:</strong> ${solicitacao.id || 'N/A'}</div>
            <div><strong>Equipe:</strong> ${solicitacao.equipe || 'N/A'}</div>
            <div><strong>Descrição:</strong> ${solicitacao.descricao || 'N/A'}</div>
            <div><strong>Quarto:</strong> ${solicitacao.quarto || 'N/A'}</div>
            <div><strong>Solicitante:</strong> ${solicitacao.nome || 'N/A'}</div>
        `;
    }

    // Mostrar modal
    modal.classList.remove('hidden');
    modal.style.display = 'flex';
}

function fecharSolicitacaoModal() {
    const modal = document.getElementById('solicitacao-modal');
    if (modal) {
        modal.classList.add('hidden');
        modal.style.display = 'none';
    }
}

// Eventos para cards
function adicionarEventosSolicitacoes() {
    document.querySelectorAll('.solicitacao-card').forEach(card => {
        card.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (card.dataset.solicitacao) {
                try {
                    const solicitacao = JSON.parse(card.dataset.solicitacao.replace(/&apos;/g, "'"));
                    abrirSolicitacaoModal(solicitacao);
                } catch (error) {
                    console.error('Erro ao parsear solicitação:', error);
                }
            }
        };
    });
}

