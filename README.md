# 🏥 YUNA Healthcare System

[![Deploy](https://img.shields.io/badge/Deploy-Ready-success?logo=github)](https://github.com/Samukajr/clinicasyuna)
[![PWA](https://img.shields.io/badge/PWA-Ready-purple?logo=pwa)](#)

Sistema completo de gerenciamento de solicitações para clínicas YUNA com PWA otimizado.

## 🌐 **ACESSO ONLINE - DOMÍNIO PROFISSIONAL**

**✨ URL CORPORATIVA PROFISSIONAL:**
- **🏠 Sistema Principal:** https://yuna.github.io/yuna/
- **👥 Portal Acompanhantes:** https://yuna.github.io/yuna/acompanhantes/
- **👨‍💼 Painel Admin:** https://yuna.github.io/yuna/admin/

## 🚀 **DEPLOY AUTOMÁTICO - SIGA ESTES PASSOS**

### **✅ Opção 1: Netlify (RECOMENDADO)**

1. **Acesse:** https://app.netlify.com
2. **Faça login** com sua conta GitHub
3. **Clique em "New site from Git"**
4. **Escolha "GitHub"** e autorize a conexão
5. **Selecione o repositório:** `yuna/yuna` (após transferir para organização)
6. **Configure:**
   - Build command: `echo "Static site"`
   - Publish directory: `.` (ponto)
   - Branch: `main`
7. **Clique em "Deploy site"**

### **🔄 Opção 2: Vercel (ALTERNATIVO)**

1. **Acesse:** https://vercel.com/new
2. **Conecte** com GitHub
3. **Selecione:** `yuna/yuna` (após transferir para organização)
4. **Configure:**
   - Framework Preset: `Other`
   - Build Command: Deixe vazio
   - Output Directory: `.`
5. **Deploy**

### **📚 Opção 3: GitHub Pages**

1. **No GitHub,** vá para: github.com/yuna/yuna (após transferir)
2. **Pages** → Source: Deploy from branch
3. **Branch:** main, folder: / (root)
4. **Save**

## 📱 **Estrutura do Sistema**

```
📦 yuna-healthcare-system/
├── 🏠 index.html              # Página inicial com redirecionamento
├── 👥 acompanhantes/          # Portal dos acompanhantes
│   └── index.html
├── 👨‍💼 admin/                  # Painel administrativo  
│   ├── index.html
│   ├── admin-panel.js
│   └── admin-permissions.js
├── ⚙️ firebase-config-secure.js # Configuração Firebase
├── 📱 manifest.json           # PWA manifest
├── 🔧 service-worker.js       # Service worker PWA
├── 🌐 vercel.json            # Configuração Vercel
└── 🌐 netlify.toml           # Configuração Netlify
```

## ✨ **Funcionalidades Implementadas**

### 🌟 **Sistema de Satisfação**
- ⭐ Modal com 5 estrelas interativo
- 📊 Dashboard de métricas por equipe
- 🔔 Notificações em tempo real
- 💾 Persistência no Firestore
- 📱 Interface responsiva

### 🏥 **Portal dos Acompanhantes**
- 📋 Solicitação de serviços
- 👤 Perfil do usuário
- 📈 Acompanhamento em tempo real
- ⭐ Avaliação automática de serviços

### 👨‍💼 **Painel Administrativo**
- 👥 Gerenciamento de usuários
- 📊 Dashboard de métricas
- ⚡ Controle de solicitações
- 🏆 Analytics de satisfação

## 🔧 **URLs de Acesso (após deploy)**

Substitua `[SEU-DOMINIO]` pelo domínio gerado:

- **🏠 Sistema Principal:** `https://[SEU-DOMINIO]/`
- **👥 Portal Acompanhantes:** `https://[SEU-DOMINIO]/acompanhantes/`
- **👨‍💼 Painel Admin:** `https://[SEU-DOMINIO]/admin/`

## 📱 **PWA - App Móvel**

O sistema é um **Progressive Web App** que pode ser instalado:

1. **Acesse** o site no celular
2. **Menu do navegador** → "Adicionar à tela inicial"
3. **Pronto!** Agora você tem o app instalado

## 🆘 **Solução de Problemas**

### ❌ Se der erro 404:
1. Verifique se escolheu a branch `main`
2. Confirme que o diretório é `.` (raiz)
3. Aguarde 2-3 minutos para propagação

### 🔥 Se o Firebase não conectar:
1. Verifique se o domínio está autorizado no Firebase Console
2. Adicione o novo domínio em Authentication → Settings → Authorized domains

## 🎯 **Contatos de Suporte**

- **Desenvolvedor:** Samuel Lacerda
- **GitHub:** [@Samukajr](https://github.com/Samukajr)
- **Repositório:** [yuna](https://github.com/Samukajr/yuna)

---

**✅ Sistema YUNA - Pronto para Deploy! 🚀**

Sistema completo de gerenciamento de solicitações para clínicas YUNA.

## 🌐 **Acesso Online**
- 🏠 **Homepage:** [yuna-healthcare-system.vercel.app](https://yuna-healthcare-system.vercel.app)
- 📱 **Portal Acompanhantes:** [/acompanhantes](https://yuna-healthcare-system.vercel.app/acompanhantes)
- 👨‍💼 **Painel Admin:** [/admin](https://yuna-healthcare-system.vercel.app/admin)

## 📱 **App Mobile (PWA)**

### Como instalar
**Android:** Chrome → "Instalar App"
**iOS:** Safari → Compartilhar → "Adicionar à Tela de Início"

**Android:**
1. Acesse a URL no Chrome
2. Toque em "Instalar App" ou Menu → "Instalar App"

**iOS:**
1. Acesse a URL no Safari
2. Toque em Compartilhar → "Adicionar à Tela de Início"

## 🚀 Deploy Gratuito no Vercel

### Pré-requisitos:
- Conta no [Vercel](https://vercel.com) (gratuita)
- Conta no [GitHub](https://github.com) (gratuita)

### Passos para deploy:

1. **Subir código para GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Sistema YUNA inicial"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/yuna-app.git
   git push -u origin main
   ```

2. **Deploy no Vercel:**
   - Acesse [vercel.com](https://vercel.com)
   - Conecte com GitHub
   - Selecione seu repositório
   - Deploy automático!

3. **URL final:** `https://yuna-app-SEU-USUARIO.vercel.app`

### Estrutura do projeto:
```
/
├── admin/                  # Painel administrativo
│   ├── index.html         # Dashboard principal
│   ├── admin-panel.js     # Lógica do admin
│   └── ...
├── acompanhantes/         # Portal PWA
│   ├── index.html         # Interface principal
│   ├── manifest.json      # Configuração PWA
│   ├── service-worker.js  # Cache offline
│   └── ...
├── vercel.json           # Configuração de deploy
├── .env.example          # Template de variáveis de ambiente
├── build-config.sh       # Script para gerar config do Firebase
├── SECURITY.md           # Política de segurança
└── README.md             # Este arquivo
```

## 🔧 Configuração Firebase

### 🔒 Configuração Segura (IMPORTANTE)

Este projeto usa variáveis de ambiente para proteger suas credenciais Firebase. **NUNCA** faça commit de chaves de API no código.

**Setup Local:**
```bash
# 1. Copie o arquivo de exemplo
cp .env.example .env

# 2. Preencha com suas credenciais do Firebase
# Edite o arquivo .env com suas chaves reais

# 3. Execute o script de build para gerar os arquivos de configuração
./build-config.sh
```

**Setup para Deploy (Netlify/Vercel):**

1. Vá para as configurações do seu projeto
2. Adicione as variáveis de ambiente:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

3. Configure o comando de build: `./build-config.sh`

**⚠️ Segurança Adicional:**
- Restrinja sua API key no [Google Cloud Console](https://console.developers.google.com/apis/credentials)
- Configure regras de segurança no Firestore
- Leia o arquivo [SECURITY.md](./SECURITY.md) para instruções completas

### Firebase Security Rules

Certifique-se de configurar as regras do Firebase para aceitar requisições do novo domínio e proteger seus dados.

## 🔒 Segurança

Para informações sobre segurança, incluindo:
- Como configurar chaves de API corretamente
- Como revogar chaves comprometidas
- Melhores práticas de segurança
- Resposta a incidentes

Consulte nossa [Política de Segurança](./SECURITY.md).

## 📧 Suporte

Para suporte técnico, entre em contato com a equipe de desenvolvimento.