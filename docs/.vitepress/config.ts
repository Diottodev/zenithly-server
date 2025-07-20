import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Zenithly Server',
  description: 'Documentação do Servidor Zenithly',
  lang: 'pt-BR',
  base: '/docs/',
  themeConfig: {
    nav: [
      { text: 'Início', link: '/' },
      { text: 'Deployment', link: '/DEPLOYMENT' },
      { text: 'Guia OAuth Frontend', link: '/FRONTEND_OAUTH_GUIDE' },
      { text: 'Integrações', link: '/INTEGRATIONS' },
      {
        text: 'Resumo da Implementação OAuth',
        link: '/OAUTH_IMPLEMENTATION_SUMMARY',
      },
      { text: 'Instruções de Setup', link: '/SETUP-INSTRUCTIONS' },
      { text: 'Testes', link: '/TESTS_README' },
    ],
    sidebar: [
      {
        text: 'Documentação',
        items: [
          { text: 'Deployment', link: '/DEPLOYMENT' },
          { text: 'Guia OAuth Frontend', link: '/FRONTEND_OAUTH_GUIDE' },
          { text: 'Integrações', link: '/INTEGRATIONS' },
          {
            text: 'Resumo da Implementação OAuth',
            link: '/OAUTH_IMPLEMENTATION_SUMMARY',
          },
          { text: 'Instruções de Setup', link: '/SETUP-INSTRUCTIONS' },
          { text: 'Testes', link: '/TESTS_README' },
        ],
      },
    ],
  },
});
