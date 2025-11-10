# Security Policy

## 🔒 Reporting Security Vulnerabilities

If you discover a security vulnerability in this project, please report it by emailing the maintainers directly. **Do not open a public issue.**

## 🛡️ Security Best Practices

### Firebase Configuration

This project uses Firebase for authentication and database services. To protect your Firebase credentials:

#### 1. Environment Variables Setup

All Firebase configuration should be stored in environment variables, **never hardcoded** in source files.

**For Local Development:**
```bash
# Copy the example file
cp .env.example .env

# Edit .env with your actual credentials (this file is gitignored)
# DO NOT commit the .env file
```

**For Production Deployment:**

- **Netlify**: Go to Site Settings → Environment Variables
- **Vercel**: Go to Project Settings → Environment Variables
- **GitHub Pages**: Use GitHub Secrets and a build action

Add the following environment variables:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`

#### 2. Generate and Secure Your Firebase API Key

**Creating a New API Key:**

1. Go to [Google Cloud Console](https://console.developers.google.com/apis/credentials)
2. Select your Firebase project
3. Click "Create Credentials" → "API Key"
4. **Immediately restrict the key** (see below)

**Restricting Your API Key:**

🚨 **CRITICAL**: Always restrict your Firebase API keys to prevent unauthorized use.

1. In Google Cloud Console → Credentials
2. Click on your API key
3. Under "Application restrictions":
   - Choose "HTTP referrers (web sites)"
   - Add your domains:
     ```
     https://yourdomain.com/*
     https://*.netlify.app/*
     https://*.vercel.app/*
     http://localhost:*
     ```

4. Under "API restrictions":
   - Choose "Restrict key"
   - Select only the APIs you need:
     - Firebase Authentication API
     - Cloud Firestore API
     - Firebase Storage API
     - Identity Toolkit API

5. Click "Save"

#### 3. Firebase Security Rules

Ensure your Firestore and Storage have proper security rules:

**Firestore Rules Example:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Require authentication for all reads/writes
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
    
    // More specific rules for your collections
    match /usuarios_admin/{userId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

#### 4. Rotate/Revoke Compromised Keys

**If your API key has been exposed:**

1. **Immediately revoke the compromised key** in Google Cloud Console:
   - Go to [Credentials](https://console.developers.google.com/apis/credentials)
   - Delete the exposed key

2. **Check for unauthorized usage**:
   - Review Firebase Console → Usage and Billing
   - Check Authentication → Users for suspicious accounts
   - Review Firestore for unauthorized data

3. **Generate a new key** with proper restrictions (see above)

4. **Update your environment variables** in all deployment platforms

5. **Optional but recommended**: Remove the key from git history:
   ```bash
   # Using git-filter-repo (recommended)
   git filter-repo --replace-text <(echo "YOUR-EXPOSED-KEY==>***REMOVED***")
   
   # Or using BFG Repo-Cleaner
   bfg --replace-text <(echo "YOUR-EXPOSED-KEY==>***REMOVED***")
   
   # Force push to remote (⚠️ coordinate with team!)
   git push --force --all
   ```

   ⚠️ **Warning**: Rewriting git history requires coordination with all collaborators and may break existing clones.

### Building with Environment Variables

Before deploying, run the build script to inject environment variables:

```bash
# Make sure environment variables are set
export VITE_FIREBASE_API_KEY="your-key"
export VITE_FIREBASE_AUTH_DOMAIN="your-domain"
# ... other variables

# Run the build script
./build-config.sh
```

This will generate the config files with actual values from environment variables.

## 🔍 Automated Security Scanning

This repository includes automated security scanning:

### Detect Secrets Workflow

- Runs on every push and pull request
- Scans for hardcoded secrets and high-entropy strings
- Prevents commits containing exposed credentials
- Located at: `.github/workflows/detect-secrets.yml`

### What is Checked

1. **Hardcoded API Keys**: Detects Firebase and other API keys in code
2. **High Entropy Strings**: Identifies potential secrets based on randomness
3. **Firebase Configuration**: Ensures placeholders are used instead of real values
4. **Common Secret Patterns**: AWS keys, private keys, tokens, etc.

### Running Locally

Install and run detect-secrets before committing:

```bash
# Install
pip install detect-secrets

# Scan your code
detect-secrets scan --baseline .secrets.baseline

# Audit findings
detect-secrets audit .secrets.baseline
```

## 📋 Security Checklist

Before deploying to production:

- [ ] All Firebase credentials are stored in environment variables
- [ ] `.env` file is in `.gitignore` (never committed)
- [ ] Firebase API key is restricted to your domains only
- [ ] Firestore security rules are properly configured
- [ ] Firebase Authentication is enabled with appropriate providers
- [ ] Run `./build-config.sh` to generate config from env vars
- [ ] Test the application with production credentials in a staging environment
- [ ] Enable Firebase App Check for additional security
- [ ] Review Firebase billing quotas and alerts
- [ ] Set up monitoring for suspicious activity

## 🚨 Incident Response

If you suspect a security breach:

1. **Immediately**: Revoke all Firebase API keys
2. **Audit**: Check Firebase Console for unauthorized access
3. **Rotate**: Generate new keys with stricter restrictions
4. **Notify**: Inform all team members and users if necessary
5. **Investigate**: Review logs and firestore data for suspicious activity
6. **Document**: Record the incident and response steps taken
7. **Improve**: Update security measures to prevent recurrence

## 📞 Contact

For security concerns, contact the repository maintainers:
- **GitHub**: [@Samukajr](https://github.com/Samukajr)

## 🔄 Security Updates

This document was last updated: 2025-01-10

Please review this security policy regularly and keep your dependencies up to date.
