#!/bin/bash
# Verification script to ensure no hardcoded secrets remain

echo "🔍 Verifying security configurations..."
echo ""

# Counter for issues
issues=0

# Check 1: No hardcoded Firebase API keys
echo "📋 Check 1: Looking for hardcoded Firebase API keys..."
if grep -r "apiKey.*:.*\"AIza" . --include="*.js" --include="*.html" --include="*.ts" --exclude-dir=node_modules --exclude-dir=.git | grep -v "PLACEHOLDER" | grep -v "your-api-key"; then
    echo "❌ FAIL: Found hardcoded Firebase API keys!"
    issues=$((issues + 1))
else
    echo "✅ PASS: No hardcoded Firebase API keys found"
fi
echo ""

# Check 2: Config files use placeholders
echo "📋 Check 2: Verifying config files use placeholders..."
files_to_check=(
    "firebase-config-secure.js"
    "admin/firebase-config-secure.js"
    "acompanhantes/firebase-config-secure.js"
    "acompanhantes/index.html"
    "admin/admin-panel.js"
    "admin/admin-panel-backup.js"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        if grep -q "PLACEHOLDER_WILL_BE_REPLACED_BY_BUILD" "$file" || grep -q "window.firebaseConfig" "$file"; then
            echo "✅ $file: Uses placeholders or references config"
        else
            echo "⚠️  $file: Might not use placeholders correctly"
            issues=$((issues + 1))
        fi
    else
        echo "⚠️  $file: File not found"
    fi
done
echo ""

# Check 3: .env is gitignored
echo "📋 Check 3: Checking .env is in .gitignore..."
if grep -q "^\.env$" .gitignore; then
    echo "✅ PASS: .env is in .gitignore"
else
    echo "❌ FAIL: .env is NOT in .gitignore"
    issues=$((issues + 1))
fi
echo ""

# Check 4: .env.example exists
echo "📋 Check 4: Checking .env.example exists..."
if [ -f ".env.example" ]; then
    echo "✅ PASS: .env.example exists"
else
    echo "❌ FAIL: .env.example does not exist"
    issues=$((issues + 1))
fi
echo ""

# Check 5: Build script exists and is executable
echo "📋 Check 5: Checking build script..."
if [ -f "build-config.sh" ]; then
    if [ -x "build-config.sh" ]; then
        echo "✅ PASS: build-config.sh exists and is executable"
    else
        echo "⚠️  WARNING: build-config.sh exists but is not executable"
        echo "   Run: chmod +x build-config.sh"
    fi
else
    echo "❌ FAIL: build-config.sh does not exist"
    issues=$((issues + 1))
fi
echo ""

# Check 6: Security documentation exists
echo "📋 Check 6: Checking security documentation..."
if [ -f "SECURITY.md" ]; then
    echo "✅ PASS: SECURITY.md exists"
else
    echo "❌ FAIL: SECURITY.md does not exist"
    issues=$((issues + 1))
fi
echo ""

# Check 7: GitHub workflow exists
echo "📋 Check 7: Checking GitHub Actions workflow..."
if [ -f ".github/workflows/detect-secrets.yml" ]; then
    echo "✅ PASS: detect-secrets workflow exists"
else
    echo "❌ FAIL: detect-secrets workflow does not exist"
    issues=$((issues + 1))
fi
echo ""

# Check 8: No .env file committed
echo "📋 Check 8: Ensuring .env file is not tracked by git..."
if git ls-files | grep -q "^\.env$"; then
    echo "❌ FAIL: .env file is tracked by git!"
    issues=$((issues + 1))
else
    echo "✅ PASS: .env file is not tracked by git"
fi
echo ""

# Final summary
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
if [ $issues -eq 0 ]; then
    echo "✅ All security checks passed! ($issues issues found)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    exit 0
else
    echo "❌ Security verification failed! ($issues issues found)"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    echo "Please fix the issues above before deploying."
    exit 1
fi
