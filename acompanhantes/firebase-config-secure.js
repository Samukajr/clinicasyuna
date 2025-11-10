// Auto-generated Firebase configuration
// DO NOT EDIT - Generated from environment variables during build
// Run ./build-config.sh to regenerate this file

const firebaseConfigDev = {
  apiKey: "PLACEHOLDER_WILL_BE_REPLACED_BY_BUILD",
  authDomain: "PLACEHOLDER_WILL_BE_REPLACED_BY_BUILD",
  projectId: "PLACEHOLDER_WILL_BE_REPLACED_BY_BUILD",
  storageBucket: "PLACEHOLDER_WILL_BE_REPLACED_BY_BUILD",
  messagingSenderId: "PLACEHOLDER_WILL_BE_REPLACED_BY_BUILD",
  appId: "PLACEHOLDER_WILL_BE_REPLACED_BY_BUILD"
};

// Configuração para produção (substitua pelos valores do seu projeto de produção)
const firebaseConfigProd = {
  apiKey: "PLACEHOLDER_WILL_BE_REPLACED_BY_BUILD",
  authDomain: "PLACEHOLDER_WILL_BE_REPLACED_BY_BUILD",
  projectId: "PLACEHOLDER_WILL_BE_REPLACED_BY_BUILD",
  storageBucket: "PLACEHOLDER_WILL_BE_REPLACED_BY_BUILD",
  messagingSenderId: "PLACEHOLDER_WILL_BE_REPLACED_BY_BUILD",
  appId: "PLACEHOLDER_WILL_BE_REPLACED_BY_BUILD"
};

// Detectar ambiente
const isProduction = window.location.hostname !== 'localhost' && 
                    window.location.hostname !== '127.0.0.1';

// Exportar configuração baseada no ambiente
export const firebaseConfig = isProduction ? firebaseConfigProd : firebaseConfigDev;

// Log de segurança (remover em produção final)
if (!isProduction) {
  console.log('🔧 Firebase configurado para DESENVOLVIMENTO');
} else {
  console.log('🔒 Firebase configurado para PRODUÇÃO');
}