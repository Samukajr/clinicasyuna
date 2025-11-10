#!/bin/bash
# Build script to inject environment variables into Firebase config files

echo "🔧 Building Firebase configuration from environment variables..."

# Check if environment variables are set
if [ -z "$VITE_FIREBASE_API_KEY" ]; then
  echo "⚠️  Warning: VITE_FIREBASE_API_KEY not set, using placeholder"
  VITE_FIREBASE_API_KEY="your-api-key-here"
fi

if [ -z "$VITE_FIREBASE_AUTH_DOMAIN" ]; then
  echo "⚠️  Warning: VITE_FIREBASE_AUTH_DOMAIN not set, using placeholder"
  VITE_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
fi

if [ -z "$VITE_FIREBASE_PROJECT_ID" ]; then
  echo "⚠️  Warning: VITE_FIREBASE_PROJECT_ID not set, using placeholder"
  VITE_FIREBASE_PROJECT_ID="your-project-id"
fi

if [ -z "$VITE_FIREBASE_STORAGE_BUCKET" ]; then
  echo "⚠️  Warning: VITE_FIREBASE_STORAGE_BUCKET not set, using placeholder"
  VITE_FIREBASE_STORAGE_BUCKET="your-project.firebasestorage.app"
fi

if [ -z "$VITE_FIREBASE_MESSAGING_SENDER_ID" ]; then
  echo "⚠️  Warning: VITE_FIREBASE_MESSAGING_SENDER_ID not set, using placeholder"
  VITE_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
fi

if [ -z "$VITE_FIREBASE_APP_ID" ]; then
  echo "⚠️  Warning: VITE_FIREBASE_APP_ID not set, using placeholder"
  VITE_FIREBASE_APP_ID="your-app-id"
fi

# Function to generate config file
generate_config() {
  local output_file=$1
  local module_type=$2
  
  if [ "$module_type" = "window" ]; then
    # For files that use window.firebaseConfig
    cat > "$output_file" << EOF
// Auto-generated Firebase configuration
// DO NOT EDIT - Generated from environment variables during build

window.firebaseConfig = {
  apiKey: "$VITE_FIREBASE_API_KEY",
  authDomain: "$VITE_FIREBASE_AUTH_DOMAIN",
  projectId: "$VITE_FIREBASE_PROJECT_ID",
  storageBucket: "$VITE_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "$VITE_FIREBASE_MESSAGING_SENDER_ID",
  appId: "$VITE_FIREBASE_APP_ID"
};
EOF
  elif [ "$module_type" = "const" ]; then
    # For files that use const firebaseConfig
    cat > "$output_file" << EOF
// Auto-generated Firebase configuration
// DO NOT EDIT - Generated from environment variables during build

const firebaseConfig = {
  apiKey: "$VITE_FIREBASE_API_KEY",
  authDomain: "$VITE_FIREBASE_AUTH_DOMAIN",
  projectId: "$VITE_FIREBASE_PROJECT_ID",
  storageBucket: "$VITE_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "$VITE_FIREBASE_MESSAGING_SENDER_ID",
  appId: "$VITE_FIREBASE_APP_ID"
};
EOF
  else
    # For ES6 modules
    cat > "$output_file" << EOF
// Auto-generated Firebase configuration
// DO NOT EDIT - Generated from environment variables during build

const firebaseConfig = {
  apiKey: "$VITE_FIREBASE_API_KEY",
  authDomain: "$VITE_FIREBASE_AUTH_DOMAIN",
  projectId: "$VITE_FIREBASE_PROJECT_ID",
  storageBucket: "$VITE_FIREBASE_STORAGE_BUCKET",
  messagingSenderId: "$VITE_FIREBASE_MESSAGING_SENDER_ID",
  appId: "$VITE_FIREBASE_APP_ID"
};

export default firebaseConfig;
EOF
  fi
  
  echo "✅ Generated: $output_file"
}

# Generate config files for each location
echo ""
echo "Generating configuration files..."
generate_config "firebase-config-secure.js" "module"
generate_config "admin/firebase-config-secure.js" "window"
generate_config "acompanhantes/firebase-config-secure.js" "module"

echo ""
echo "✅ Build complete! Firebase configuration files generated."
echo ""
echo "⚠️  IMPORTANT: Make sure environment variables are set in your deployment platform:"
echo "   - Netlify: Site settings > Environment variables"
echo "   - Vercel: Project settings > Environment Variables"
echo ""
