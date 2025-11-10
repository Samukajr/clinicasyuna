# 🚀 Deployment Guide - Secure Firebase Configuration

This guide explains how to deploy the YUNA Healthcare System with secure Firebase configuration.

## 📋 Prerequisites

Before deploying, you must:

1. ✅ Have a Firebase project created
2. ✅ Have revoked any previously exposed API keys
3. ✅ Have generated a new, restricted Firebase API key
4. ✅ Have your Firebase credentials ready

## 🔧 Local Development Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/Samukajr/clinicasyuna.git
cd clinicasyuna
```

### Step 2: Configure Environment Variables

```bash
# Copy the example file
cp .env.example .env

# Edit .env with your actual Firebase credentials
nano .env  # or use your preferred editor
```

Add your Firebase credentials to `.env`:
```env
VITE_FIREBASE_API_KEY=your-actual-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Step 3: Generate Configuration Files

```bash
# Make the build script executable (if not already)
chmod +x build-config.sh

# Generate config files from environment variables
./build-config.sh
```

### Step 4: Start Local Development Server

```bash
# Using Python
python -m http.server 3000

# Or using Node.js
npx http-server -p 3000
```

Access at: http://localhost:3000

## ☁️ Production Deployment

### Option 1: Deploy to Netlify

#### Via Web Interface:

1. **Login to Netlify**
   - Go to https://app.netlify.com
   - Login with GitHub

2. **Import Project**
   - Click "New site from Git"
   - Select "GitHub"
   - Choose `Samukajr/clinicasyuna` repository
   - Select branch: `main`

3. **Configure Build Settings**
   - **Build command**: `./build-config.sh`
   - **Publish directory**: `.`
   - Click "Show advanced" → "New variable"

4. **Add Environment Variables**
   Add each of these variables with your Firebase credentials:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

5. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete

#### Via Netlify CLI:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize site
netlify init

# Set environment variables
netlify env:set VITE_FIREBASE_API_KEY "your-api-key"
netlify env:set VITE_FIREBASE_AUTH_DOMAIN "your-project.firebaseapp.com"
netlify env:set VITE_FIREBASE_PROJECT_ID "your-project-id"
netlify env:set VITE_FIREBASE_STORAGE_BUCKET "your-project.firebasestorage.app"
netlify env:set VITE_FIREBASE_MESSAGING_SENDER_ID "your-sender-id"
netlify env:set VITE_FIREBASE_APP_ID "your-app-id"

# Deploy
netlify deploy --prod
```

### Option 2: Deploy to Vercel

#### Via Web Interface:

1. **Login to Vercel**
   - Go to https://vercel.com
   - Login with GitHub

2. **Import Project**
   - Click "New Project"
   - Import `Samukajr/clinicasyuna`
   - Select branch: `main`

3. **Configure Build Settings**
   - **Build Command**: `./build-config.sh`
   - **Output Directory**: `.`

4. **Add Environment Variables**
   - Go to "Environment Variables" section
   - Add each variable (same as Netlify list above)

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

#### Via Vercel CLI:

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy (first time)
vercel

# Set environment variables in dashboard, then redeploy
vercel --prod
```

### Option 3: GitHub Pages (Advanced)

GitHub Pages requires a GitHub Actions workflow to build and inject environment variables.

1. **Add GitHub Secrets**
   - Go to repository Settings → Secrets and variables → Actions
   - Add each Firebase credential as a secret

2. **Create Workflow**
   Create `.github/workflows/deploy-pages.yml`:
   ```yaml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     build-and-deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         
         - name: Set environment variables
           run: |
             export VITE_FIREBASE_API_KEY="${{ secrets.FIREBASE_API_KEY }}"
             export VITE_FIREBASE_AUTH_DOMAIN="${{ secrets.FIREBASE_AUTH_DOMAIN }}"
             export VITE_FIREBASE_PROJECT_ID="${{ secrets.FIREBASE_PROJECT_ID }}"
             export VITE_FIREBASE_STORAGE_BUCKET="${{ secrets.FIREBASE_STORAGE_BUCKET }}"
             export VITE_FIREBASE_MESSAGING_SENDER_ID="${{ secrets.FIREBASE_MESSAGING_SENDER_ID }}"
             export VITE_FIREBASE_APP_ID="${{ secrets.FIREBASE_APP_ID }}"
             ./build-config.sh
         
         - name: Deploy to GitHub Pages
           uses: JamesIves/github-pages-deploy-action@v4
           with:
             folder: .
             branch: gh-pages
   ```

3. **Enable GitHub Pages**
   - Settings → Pages
   - Source: Deploy from branch
   - Branch: `gh-pages`

## 🔒 Post-Deployment Security

After deploying, verify security:

### 1. Test Firebase Connection
- Open your deployed site
- Check browser console for Firebase initialization
- Try logging in

### 2. Verify No Exposed Secrets
```bash
# Check your deployed site source code (view page source)
# Search for "PLACEHOLDER" - should NOT appear
# Search for "AIzaSy" - should find your restricted key only
```

### 3. Restrict Your API Key

⚠️ **CRITICAL**: Restrict your Firebase API key in Google Cloud Console:

1. Go to https://console.developers.google.com/apis/credentials
2. Select your API key
3. Add **Application restrictions** → HTTP referrers:
   ```
   https://your-actual-domain.com/*
   https://*.netlify.app/*
   https://*.vercel.app/*
   http://localhost:*
   ```
4. Add **API restrictions** → Restrict key to:
   - Cloud Firestore API
   - Firebase Authentication API
   - Identity Toolkit API
   - Token Service API

### 4. Configure Firebase Security Rules

Update Firestore rules to secure your data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /usuarios_admin/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /usuarios_equipe/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /solicitacoes/{solicitacaoId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null;
    }
  }
}
```

### 5. Enable Firebase App Check (Recommended)

1. Go to Firebase Console → App Check
2. Register your web app
3. Enable reCAPTCHA v3 or reCAPTCHA Enterprise
4. Update your code to use App Check

## 🔄 Updating Credentials

To rotate Firebase credentials:

1. Generate new Firebase API key in Google Cloud Console
2. Update environment variables in deployment platform:
   - **Netlify**: Site Settings → Environment variables → Edit
   - **Vercel**: Project Settings → Environment Variables → Edit
3. Redeploy (usually automatic after env var change)
4. Delete old API key from Google Cloud Console

## 🐛 Troubleshooting

### Build Fails

**Error**: `build-config.sh: Permission denied`
```bash
# Make script executable
chmod +x build-config.sh
git add build-config.sh
git commit -m "Make build script executable"
git push
```

**Error**: Environment variables not set
- Verify variables are added in deployment platform
- Check variable names match exactly (case-sensitive)
- Redeploy after adding variables

### Firebase Connection Fails

**Symptom**: Console shows Firebase initialization errors

1. Check browser console for specific error
2. Verify API key is not restricted to wrong domains
3. Check Firebase project ID matches
4. Verify authDomain is correct

**Symptom**: "PLACEHOLDER" appears in production

1. Verify build script ran during deployment
2. Check build logs in deployment platform
3. Verify environment variables are set correctly
4. Ensure build command is `./build-config.sh`

### API Key Still Exposed

If you accidentally commit credentials:

1. **Immediately revoke the key** in Google Cloud Console
2. Generate a new restricted key
3. Update environment variables
4. Remove from git history:
   ```bash
   git filter-repo --replace-text <(echo "YOUR-EXPOSED-KEY==>***REMOVED***")
   git push --force --all
   ```

## 📞 Support

For deployment issues:
- Review [SECURITY.md](./SECURITY.md)
- Check GitHub Issues
- Contact repository maintainers

## ✅ Deployment Checklist

Before going live:

- [ ] Firebase API key is restricted to production domains
- [ ] Environment variables set in deployment platform
- [ ] Build script runs successfully
- [ ] Firebase connection works in production
- [ ] No "PLACEHOLDER" strings in production
- [ ] Firestore security rules configured
- [ ] Firebase Authentication enabled
- [ ] Tested login/logout functionality
- [ ] Tested creating and viewing solicitações
- [ ] PWA installs correctly on mobile
- [ ] Set up monitoring and alerts
- [ ] Documented credentials location for team

---

**Last Updated**: 2025-01-10
