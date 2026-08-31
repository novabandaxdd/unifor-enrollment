<#import "template.ftl" as layout>
<@layout.registrationLayout displayMessage=!messagesPerField.existsError('username','password') displayInfo=realm.password && realm.registrationAllowed && !registrationDisabled??; section>
    <#if section = "header">
        ${msg("loginTotpTitle")}
    <#elseif section = "form">

    <div id="unifor-login-shell">

        <!-- ══ Painel Esquerdo — Branding ══════════════════════════ -->
        <div class="brand-panel">

            <div class="brand-logo">
                <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 3L1 9l11 6 9-4.91V17h2V9L12 3zM5 13.18v4L12 21l7-3.82v-4L12 17l-7-3.82z"/>
                </svg>
            </div>

            <h1 class="brand-name">Unifor</h1>
            <p class="brand-tagline">Sistema de Matrículas</p>
            <p class="brand-semester">Semestre 2026.2</p>

            <div class="brand-features">
                <div class="feature-item">
                    <span class="feature-dot"></span>
                    <span>Gestão de Matriz Curricular</span>
                </div>
                <div class="feature-item">
                    <span class="feature-dot"></span>
                    <span>Matrícula Online Segura</span>
                </div>
                <div class="feature-item">
                    <span class="feature-dot"></span>
                    <span>Controle de Vagas em Tempo Real</span>
                </div>
                <div class="feature-item">
                    <span class="feature-dot"></span>
                    <span>Acesso por Perfil de Usuário</span>
                </div>
            </div>

            <div class="brand-footer-text">
                Universidade de Fortaleza — UNIFOR
            </div>

        </div>

        <!-- ══ Painel Direito — Formulário ═════════════════════════ -->
        <div class="form-panel">

            <div class="form-card">

                <!-- Ícone topo -->
                <div class="form-icon-wrap">
                    <svg viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                    </svg>
                </div>

                <h2 class="form-title">Bem-vindo de volta</h2>
                <p class="form-subtitle">Faça login para acessar o sistema</p>

                <!-- Mensagem de erro -->
                <#if messagesPerField.existsError('username','password')>
                    <div class="alert-error-box">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                        </svg>
                        <span>${kcSanitize(messagesPerField.getFirstError('username','password'))?no_esc}</span>
                    </div>
                </#if>

                <!-- Formulário -->
                <form id="kc-form-login" onsubmit="login.disabled = true; return true;"
                      action="${url.loginAction}" method="post">

                    <div class="field-group">
                        <label for="username" class="field-label">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                            ${msg("username")}
                        </label>
                        <input
                            tabindex="1"
                            id="username"
                            class="form-input <#if messagesPerField.existsError('username','password')>input-error</#if>"
                            name="username"
                            value="${login.username!''}"
                            type="text"
                            autofocus
                            autocomplete="off"
                            placeholder="seu@email.com ou usuario"
                        />
                    </div>

                    <div class="field-group">
                        <label for="password" class="field-label">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="14" height="14">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                            </svg>
                            ${msg("password")}
                        </label>
                        <div class="password-wrap">
                            <input
                                tabindex="2"
                                id="password"
                                class="form-input <#if messagesPerField.existsError('username','password')>input-error</#if>"
                                name="password"
                                type="password"
                                autocomplete="current-password"
                                placeholder="••••••••"
                            />
                            <button type="button" class="toggle-password" onclick="togglePassword()" tabindex="-1" aria-label="Mostrar senha">
                                <svg id="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16">
                                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                                    <circle cx="12" cy="12" r="3"/>
                                </svg>
                            </button>
                        </div>
                    </div>

                    <!-- Lembrar-me + Esqueci -->
                    <div class="form-options">
                        <#if realm.rememberMe && !usernameEditDisabled??>
                            <label class="remember-me">
                                <input tabindex="3" id="rememberMe" name="rememberMe" type="checkbox"
                                    <#if login.rememberMe?? && login.rememberMe>checked</#if>
                                />
                                <span>${msg("rememberMe")}</span>
                            </label>
                        </#if>
                        <#if realm.resetPasswordAllowed>
                            <a tabindex="5" href="${url.loginResetCredentialsUrl}" class="forgot-link">
                                ${msg("forgotPassword")}
                            </a>
                        </#if>
                    </div>

                    <!-- Botão Entrar -->
                    <button tabindex="4" class="btn-entrar" name="login" id="kc-login" type="submit">
                        <span>Entrar</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" width="16" height="16">
                            <line x1="5" y1="12" x2="19" y2="12"/>
                            <polyline points="12,5 19,12 12,19"/>
                        </svg>
                    </button>

                </form>

                <!-- Rodapé do card -->
                <div class="form-footer">
                    <div class="footer-divider">
                        <span>Acesso restrito a usuários cadastrados</span>
                    </div>
                    <p class="footer-help">
                        Problemas para acessar?
                        <a href="mailto:suporte@unifor.br">suporte@unifor.br</a>
                    </p>
                </div>

            </div>
        </div>

    </div>

    <!-- Script toggle senha -->
    <script>
        function togglePassword() {
            var input = document.getElementById('password');
            var icon = document.getElementById('eye-icon');
            if (input.type === 'password') {
                input.type = 'text';
                icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>';
            } else {
                input.type = 'password';
                icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
            }
        }
    </script>

    </#if>
</@layout.registrationLayout>
