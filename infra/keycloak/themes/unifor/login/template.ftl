<#macro registrationLayout bodyClass="" displayInfo=false displayMessage=true displayRequiredFields=false displayWide=false showAnotherWayIfPresent=true>
<!DOCTYPE html>
<html class="${properties.kcHtmlClass!}" lang="pt-BR">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex, nofollow">
    <meta name="description" content="Unifor — Sistema de Matrícula 2026.2">

    <title>Unifor Enrollment</title>

    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'><path fill='%232563eb' d='M12 3L1 9l11 6 9-4.91V17h2V9L12 3z'/></svg>">

    <#if properties.stylesCommon?has_content>
        <#list properties.stylesCommon?split(' ') as style>
            <link href="${url.resourcesCommonPath}/${style}" rel="stylesheet"/>
        </#list>
    </#if>

    <#if properties.styles?has_content>
        <#list properties.styles?split(' ') as style>
            <link href="${url.resourcesPath}/${style}" rel="stylesheet"/>
        </#list>
    </#if>

    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html, body {
            height: 100%;
            font-family: 'Segoe UI', system-ui, sans-serif;
        }

        body {
            background: #0f172a;
            display: flex;
            align-items: stretch;
            min-height: 100vh;
            overflow-x: hidden;
        }

        /* ══ Shell de dois painéis ═══════════════════════════════════ */
        #unifor-login-shell {
            display: flex;
            width: 100%;
            max-width: 100vw;
            min-height: 100vh;
            overflow-x: hidden;
        }

        /* ══ Painel Esquerdo — Branding ══════════════════════════════ */
        .brand-panel {
            width: 420px;
            min-width: 360px;
            background: linear-gradient(160deg, #1e3a5f 0%, #1d4ed8 50%, #7c3aed 100%);
            display: flex;
            flex-direction: column;
            align-items: flex-start;
            justify-content: center;
            padding: 3rem;
            position: relative;
            overflow: hidden;
            flex-shrink: 0;
        }

        .brand-panel::before {
            content: '';
            position: absolute;
            top: -80px; right: -80px;
            width: 320px; height: 320px;
            border-radius: 50%;
            background: rgba(255,255,255,0.05);
        }

        .brand-panel::after {
            content: '';
            position: absolute;
            bottom: -60px; left: -60px;
            width: 250px; height: 250px;
            border-radius: 50%;
            background: rgba(255,255,255,0.04);
        }

        .brand-logo {
            width: 60px; height: 60px;
            background: rgba(255,255,255,0.15);
            border-radius: 16px;
            display: flex; align-items: center; justify-content: center;
            margin-bottom: 1.75rem;
            border: 1px solid rgba(255,255,255,0.2);
        }

        .brand-logo svg { width: 32px; height: 32px; }

        .brand-name {
            font-size: 2.2rem; font-weight: 800;
            color: white; letter-spacing: -0.03em;
            line-height: 1; margin-bottom: 0.4rem;
        }

        .brand-tagline {
            font-size: 1.05rem; color: rgba(255,255,255,0.8);
            font-weight: 500; margin-bottom: 0.3rem;
        }

        .brand-semester {
            font-size: 0.82rem; color: rgba(255,255,255,0.5);
            font-weight: 500; text-transform: uppercase;
            letter-spacing: 0.08em; margin-bottom: 2.5rem;
        }

        .brand-features { display: flex; flex-direction: column; gap: 0.75rem; margin-bottom: 3rem; }

        .feature-item {
            display: flex; align-items: center; gap: 0.65rem;
            color: rgba(255,255,255,0.75); font-size: 0.88rem; font-weight: 500;
        }

        .feature-dot {
            width: 6px; height: 6px; border-radius: 50%;
            background: rgba(255,255,255,0.5); flex-shrink: 0;
        }

        .brand-footer-text {
            font-size: 0.78rem; color: rgba(255,255,255,0.35);
            font-weight: 500; text-transform: uppercase; letter-spacing: 0.07em;
            border-top: 1px solid rgba(255,255,255,0.1);
            padding-top: 1.25rem; width: 100%;
        }

        /* ══ Painel Direito — Formulário ════════════════════════════ */
        .form-panel {
            flex: 1; min-width: 0; display: flex; align-items: center; justify-content: center;
            background: #f1f5f9; padding: 2rem 1.5rem;
        }

        .form-card {
            background: white; border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.04);
            padding: 2.5rem 2.5rem 2rem;
            width: 100%; max-width: 400px;
            animation: fadeInUp 0.35s ease both;
        }

        @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(16px); }
            to   { opacity: 1; transform: translateY(0); }
        }

        .form-icon-wrap {
            width: 52px; height: 52px;
            background: linear-gradient(135deg, #1d4ed8, #7c3aed);
            border-radius: 14px;
            display: flex; align-items: center; justify-content: center;
            margin: 0 auto 1.25rem;
            box-shadow: 0 4px 12px rgba(37,99,235,0.3);
        }

        .form-icon-wrap svg { width: 26px; height: 26px; }

        .form-title {
            text-align: center; font-size: 1.45rem; font-weight: 800;
            color: #0f172a; letter-spacing: -0.02em; margin-bottom: 0.35rem;
        }

        .form-subtitle {
            text-align: center; font-size: 0.85rem; color: #94a3b8;
            font-weight: 500; margin-bottom: 1.75rem;
        }

        .alert-error-box {
            background: #fef2f2; border: 1.5px solid #fca5a5;
            border-radius: 10px; padding: 0.75rem 1rem; margin-bottom: 1.25rem;
            color: #991b1b; font-size: 0.87rem; font-weight: 500;
            display: flex; align-items: center; gap: 0.5rem;
        }

        .field-group { margin-bottom: 1.1rem; }

        .field-label {
            display: flex; align-items: center; gap: 0.4rem;
            font-size: 0.77rem; font-weight: 700; color: #374151;
            text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.45rem;
        }

        .field-label svg { color: #94a3b8; flex-shrink: 0; }

        .form-input {
            width: 100%; padding: 0.72rem 1rem;
            border: 1.5px solid #e5e7eb; border-radius: 10px;
            font-size: 0.93rem; font-family: inherit; color: #0f172a;
            background: #f9fafb;
            transition: border-color 0.15s, box-shadow 0.15s, background 0.15s;
            outline: none; -webkit-appearance: none; appearance: none;
        }

        .form-input::placeholder { color: #cbd5e1; }

        .form-input:focus {
            border-color: #2563eb; background: white;
            box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
        }

        .form-input.input-error { border-color: #f87171; background: #fff5f5; }

        .password-wrap { position: relative; }
        /* padding-right largo o suficiente para acomodar o olho + ícone de autofill do browser */
        .password-wrap .form-input { padding-right: 4.5rem; }

        /* Remove ícone nativo de reveal do Edge/IE; mantém autofill do Chrome mas afasta o olho dele */
        .password-wrap .form-input::-ms-reveal,
        .password-wrap .form-input::-ms-clear { display: none; }

        /* Botão olho posicionado à esquerda do ícone de autofill do browser (~24px) */
        .toggle-password {
            position: absolute; right: 2.4rem; top: 50%; transform: translateY(-50%);
            background: none; border: none; color: #94a3b8; cursor: pointer;
            padding: 4px; border-radius: 4px;
            display: flex; align-items: center; justify-content: center;
            transition: color 0.15s;
            z-index: 2;
        }

        .toggle-password:hover { color: #374151; }

        .form-options {
            display: flex; justify-content: space-between; align-items: center;
            margin-bottom: 1.25rem;
        }

        .remember-me {
            display: flex; align-items: center; gap: 0.4rem;
            cursor: pointer; font-size: 0.83rem; color: #6b7280; font-weight: 500;
        }

        .remember-me input[type="checkbox"] {
            width: 15px; height: 15px; accent-color: #2563eb; cursor: pointer;
        }

        .forgot-link {
            font-size: 0.83rem; color: #2563eb; text-decoration: none;
            font-weight: 600; transition: color 0.15s;
        }

        .forgot-link:hover { color: #1d4ed8; text-decoration: underline; }

        .btn-entrar {
            width: 100%; padding: 0.82rem 1.5rem;
            background: linear-gradient(135deg, #1d4ed8, #2563eb);
            border: none; border-radius: 10px; color: white;
            font-size: 0.95rem; font-weight: 700; font-family: inherit;
            cursor: pointer; transition: all 0.2s; letter-spacing: 0.02em;
            display: flex; align-items: center; justify-content: center; gap: 0.5rem;
            box-shadow: 0 4px 14px rgba(37,99,235,0.35);
        }

        .btn-entrar:hover {
            background: linear-gradient(135deg, #1e40af, #1d4ed8);
            box-shadow: 0 6px 20px rgba(37,99,235,0.45);
            transform: translateY(-1px);
        }

        .btn-entrar:active { transform: translateY(0); }

        .form-footer {
            margin-top: 1.5rem; padding-top: 1.25rem;
            border-top: 1px solid #f1f5f9; text-align: center;
        }

        .footer-divider { font-size: 0.77rem; color: #cbd5e1; margin-bottom: 0.65rem; }

        .footer-help { font-size: 0.8rem; color: #94a3b8; }

        .footer-help a { color: #2563eb; text-decoration: none; font-weight: 500; }
        .footer-help a:hover { text-decoration: underline; }

        @media (max-width: 768px) {
            .brand-panel { display: none; }
            .form-panel { background: #0f172a; }
            .form-card { box-shadow: 0 20px 60px rgba(0,0,0,0.4); }
        }
    </style>
</head>

<body>
    <#nested "form">
    <#if properties.scripts?has_content>
        <#list properties.scripts?split(' ') as script>
            <script src="${url.resourcesPath}/${script}" type="text/javascript"></script>
        </#list>
    </#if>
</body>
</html>
</#macro>
