# Zenithly Server

![Zenithly Logo](https://github.com/DiottoDev/zenithly-server/assets/102909024/11222222-3333-4444-5555-666666666666)

O Zenithly Server é o backend robusto e escalável para a aplicação Zenithly, projetado para gerenciar diversas funcionalidades como autenticação de usuários, gerenciamento de notas, senhas, tarefas e integrações com serviços de terceiros como Google Calendar e Outlook. Construído com foco em performance e segurança, este servidor oferece uma API RESTful completa para suportar as operações do frontend.

## Funcionalidades

- **Autenticação e Autorização**: Sistema completo de registro, login, recuperação de senha e autenticação baseada em JWT.
- **Gerenciamento de Usuários**: Criação, leitura, atualização e exclusão de perfis de usuário.
- **Notas**: Funcionalidades para criar, organizar e gerenciar notas pessoais.
- **Senhas**: Armazenamento seguro e gerenciamento de senhas com criptografia.
- **Tarefas**: Criação e acompanhamento de tarefas e listas de afazeres.
- **Integrações**: Conexão com APIs externas como Google Calendar e Outlook para sincronização de eventos e dados.
- **Segurança**: Implementação de melhores práticas de segurança, incluindo criptografia de dados sensíveis e proteção contra ataques comuns.
- **Validação de Dados**: Validação rigorosa de todas as entradas para garantir a integridade dos dados.

## Tecnologias Utilizadas

O Zenithly Server é construído com um conjunto de tecnologias modernas e eficientes:

- **Node.js**: Ambiente de execução JavaScript assíncrono e orientado a eventos.
- **Fastify**: Framework web rápido e de baixo overhead para Node.js, focado em performance e experiência do desenvolvedor.
- **Drizzle ORM**: ORM TypeScript de próxima geração para bancos de dados relacionais, oferecendo tipagem segura e alta performance.
- **PostgreSQL**: Banco de dados relacional robusto e de código aberto.
- **Valibot**: Biblioteca de validação de dados leve e poderosa.
- **bcryptjs**: Para hashing seguro de senhas.
- **jsonwebtoken (JWT)**: Para autenticação baseada em tokens.
- **googleapis**: SDK oficial do Google para integração com serviços Google (e.g., Google Calendar).
- **biome**: Ferramenta de linting e formatação para manter a qualidade e consistência do código.
- **Vitest**: Framework de testes rápido e moderno para JavaScript/TypeScript.
- **VitePress**: Gerador de site estático para a documentação do projeto.

## Arquitetura

O projeto segue uma arquitetura modular, com a API organizada em rotas, handlers e schemas. A camada de banco de dados é abstraída pelo Drizzle ORM, garantindo uma interação segura e tipada com o PostgreSQL. A estrutura de pastas é organizada para facilitar a manutenção e a escalabilidade:

```
src/
├── auth.ts             # Lógica de autenticação
├── env.ts              # Variáveis de ambiente
├── server.ts           # Configuração principal do servidor Fastify
├── db/                 # Configuração do banco de dados e schemas Drizzle
│   ├── connection.ts
│   ├── drizzle/
│   └── migrations/
├── http/               # Definições de rotas, handlers e schemas da API
│   ├── handlers/
│   ├── routes/
│   └── schemas/
├── middleware/         # Middlewares Fastify
├── plugins/            # Plugins Fastify
└── utils/              # Funções utilitárias
```

## Rotas da API (Visão Geral)

O servidor expõe as seguintes categorias de rotas:

- `/auth`: Registro, login, logout, refresh de token, recuperação de senha.
- `/users`: Gerenciamento de perfis de usuário.
- `/notes`: Operações CRUD para notas.
- `/passwords`: Operações CRUD para senhas seguras.
- `/tasks`: Operações CRUD para tarefas.
- `/integrations`: Gerenciamento de integrações com serviços externos.
- `/gmail`: Integração com a API do Gmail.
- `/google-calendar`: Integração com a API do Google Calendar.
- `/outlook`: Integração com a API do Outlook.
- `/outlook-calendar`: Integração com a API do Outlook Calendar.

Detalhes completos de cada rota, incluindo métodos HTTP, parâmetros, corpos de requisição/resposta e exemplos, podem ser encontrados na [documentação da API](#documentação).

## Instalação e Uso

Para configurar e rodar o projeto localmente, siga os passos abaixo:

### Pré-requisitos

- Node.js (versão 18 ou superior)
- yarn (gerenciador de pacotes)
- PostgreSQL (servidor de banco de dados)

### Passos

1.  **Clone o repositório:**

    ```bash
    git clone https://github.com/DiottoDev/zenithly-server.git
    cd zenithly-server
    ```

2.  **Instale as dependências:**

    ```bash
    yarn install
    ```

3.  **Configure as variáveis de ambiente:**
    Crie um arquivo `.env` na raiz do projeto, baseado no `.env.example`, e preencha com suas configurações de banco de dados e outras chaves de API necessárias.

    ```dotenv
    # Exemplo de .env
    DATABASE_URL="postgresql://user:password@localhost:5432/zenithly_db"
    JWT_SECRET="sua_chave_secreta_jwt"
    GOOGLE_CLIENT_ID="seu_client_id_google"
    GOOGLE_CLIENT_SECRET="seu_client_secret_google"
    # ... outras variáveis
    ```

4.  **Configure o banco de dados:**
    Certifique-se de que seu servidor PostgreSQL esteja rodando. Em seguida, execute as migrações para criar as tabelas necessárias:

    ```bash
    yarn run db:migrate
    ```

5.  **Popule o banco de dados (opcional):**
    Se desejar popular o banco de dados com dados de exemplo, execute:

    ```bash
    yarn run db:seed
    ```

6.  **Inicie o servidor em modo de desenvolvimento:**

    ```bash
    yarn run dev
    ```

    O servidor estará disponível em `http://localhost:3000` (ou a porta configurada).

7.  **Inicie o servidor em modo de produção:**
    ```bash
    yarn run start
    ```

## Testes

Para rodar os testes do projeto, utilize os seguintes comandos:

- Rodar todos os testes:
  ```bash
  yarn run test
  ```
- Rodar testes em modo watch:
  ```bash
  yarn run test:watch
  ```
- Gerar relatório de cobertura de testes:
  ```bash
  yarn run test:coverage
  ```

## Documentação

A documentação completa da API e guias de uso estão disponíveis no diretório `docs/`. Para visualizá-la localmente:

1.  **Inicie o servidor de documentação:**

    ```bash
    yarn run docs:dev
    ```

    A documentação estará disponível em `http://localhost:5173` (ou a porta padrão do VitePress).

2.  **Construir a documentação para deploy:**

    ```bash
    yarn run docs:build
    ```

3.  **Visualizar a build da documentação:**
    ```bash
    yarn run docs:preview
    ```

## Contribuição

Contribuições são bem-vindas! Sinta-se à vontade para abrir issues e pull requests.

## Licença

Este projeto está licenciado sob a licença ISC.

---

Desenvolvido por DiottoDev
