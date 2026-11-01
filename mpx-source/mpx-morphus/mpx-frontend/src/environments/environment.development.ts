export const environment = {
  production: false,
  googleClientId: '744060506745-kir14ejar4q12d6dbjo9mgab6q5750j9.apps.googleusercontent.com',
  auth0: {
    domain: 'www.morphus.me',
    clientId: 'Og0Iwuw9Z4l3dRC9ZjrZZCNEkXMZUO9n',
    callbackPath: '/login/callback',
    authorizationParams: {
      audience: 'https://morphus.me', // 🧙‍♂️ A tranca mágica que faltava!
    },
  },
  // 🚀 Ambiente Local apontando para a API .NET rodando na sua máquina:
  apiUrl: 'http://localhost:5248',
};
