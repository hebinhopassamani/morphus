export const environment = {
  production: true,
  googleClientId: '744060506745-kir14ejar4q12d6dbjo9mgab6q5750j9.apps.googleusercontent.com',
  auth0: {
    domain: 'www.morphus.me',
    clientId: 'Og0Iwuw9Z4l3dRC9ZjrZZCNEkXMZUO9n',
    callbackPath: '/login/callback',
    authorizationParams: {
      audience: 'https://morphus.me', // 🧙‍♂️ A tranca mágica que faltava!
    },
  },
  // 🚀 Ambiente de Produção apontando para o mesmo domínio (roteado via Caddy /api/*):
  apiUrl: 'https://morphus.me',
};
