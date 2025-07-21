import { defineConfig } from 'vitepress';

export default defineConfig({
  title: 'Zenithly Server Docs',
  description: 'Documentação completa do Zenithly Server',
  lang: 'pt-BR',
  base: '/docs/',
  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'API Reference', link: '/api/' },
      { text: 'Frontend Guide', link: '/frontend-guide/' },
    ],
    sidebar: [
      {
        text: 'Introdução',
        items: [
          { text: 'Visão Geral', link: '/' },
        ],
      },
      {
        text: 'API Reference',
        items: [
          { text: 'Autenticação', link: '/api/auth' },
          { text: 'Usuários', link: '/api/user' },
          { text: 'Integrações', link: '/api/integrations' },
          { text: 'Gmail', link: '/api/gmail' },
          { text: 'Google Calendar', link: '/api/google-calendar' },
          { text: 'Outlook', link: '/api/outlook' },
          { text: 'Outlook Calendar', link: '/api/outlook-calendar' },
          { text: 'Notas', link: '/api/notes' },
          { text: 'Tarefas', link: '/api/tasks' },
          { text: 'Senhas', link: '/api/passwords' },
        ],
      },
      {
        text: 'Guia de Integração Frontend',
        items: [
          { text: 'Visão Geral', link: '/frontend-guide/' },
          { text: 'Autenticação', link: '/frontend-guide/authentication' },
          { text: 'Tratamento de Erros', link: '/frontend-guide/error-handling' },
        ],
      },
    ],
    footer: {
      message: 'Gerado com VitePress',
      copyright: 'Copyright © 2025 Diottodev',
    },
  },
});