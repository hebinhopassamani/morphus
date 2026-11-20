export const environment = {
  production: false,
  googleClientId: '744060506745-kir14ejar4q12d6dbjo9mgab6q5750j9.apps.googleusercontent.com',
  auth0: {
    domain: 'www.morphus.one',
    clientId: 'Og0Iwuw9Z4l3dRC9ZjrZZCNEkXMZUO9n',
    callbackPath: '/login/callback',
    authorizationParams: {
      audience: 'https://morphus.one', // 🧙‍♂️ A tranca mágica que faltava!
    },
  },
  // 🚀 Ambiente de Homologação (Colorado) apontando para a API via Caddy HTTPS:
  apiUrl: 'https://homolog.morphus.one/api/v1',
};
