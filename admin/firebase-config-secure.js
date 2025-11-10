// Auto-generated Firebase configuration
// DO NOT EDIT - Generated from environment variables during build
// Run ./build-config.sh to regenerate this file

window.firebaseConfig = {
  apiKey: "PLACEHOLDER_WILL_BE_REPLACED_BY_BUILD",
  authDomain: "PLACEHOLDER_WILL_BE_REPLACED_BY_BUILD",
  projectId: "PLACEHOLDER_WILL_BE_REPLACED_BY_BUILD",
  storageBucket: "PLACEHOLDER_WILL_BE_REPLACED_BY_BUILD",
  messagingSenderId: "PLACEHOLDER_WILL_BE_REPLACED_BY_BUILD",
  appId: "PLACEHOLDER_WILL_BE_REPLACED_BY_BUILD"
};

// Detectar ambiente e inicializar Firebase
// Inicialização única do Firebase
let firebaseApp;
if (!window._firebaseApp) {
  console.log('🔥 Inicializando Firebase...');
  firebaseApp = firebase.initializeApp(window.firebaseConfig);
  window._firebaseApp = firebaseApp;
  console.log('✅ Firebase inicializado com sucesso');
} else {
  firebaseApp = window._firebaseApp;
  console.log('ℹ️ Firebase já estava inicializado');
}

// Configurar instâncias globais
window.auth = firebase.auth();
window.db = firebase.firestore();

console.log('🔑 Auth configurado:', !!window.auth);
console.log('🗄️ Firestore configurado:', !!window.db);