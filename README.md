# Recife Vital

Aplicativo de gestão de consultas e recompensas para Recife.

## Setup rápido

1. Instale as dependências:
   npm install

2. Configure o arquivo .env com as credenciais do Supabase:
   VITE_SUPABASE_URL=sua_url
   VITE_SUPABASE_ANON_KEY=sua_chave_anon

3. No painel do Supabase, rode o SQL em `supabase/schema.sql`.

4. Inicie o app:
   npm run dev

## Estrutura de banco

- `profiles`: dados do usuário
- `appointments`: agendamentos do usuário

## Regras de uso

- O app usa as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.
- Em modo local sem configuração, o app usa dados em memória.
- Nas consultas do Supabase, a relação é feita por `user_id` com `profiles.id`.

## Testes E2E

Instale as dependências com `npm install` e execute:

- `npm run cy:open` para abrir o Cypress.
- `npm run cy:run` para executar a suíte em modo headless.

O Cypress inicia seu próprio Vite em `http://127.0.0.1:3000`, sobrescrevendo as
variáveis do Supabase por uma URL local e uma chave fictícia. Os testes padrão
interceptam as respostas de autenticação e das tabelas; os tokens nas fixtures
são valores de teste, não permitem autenticação. Não é necessário enviar e-mail
nem acessar um projeto Supabase.

O teste de agendamento confere a requisição de criação e simula a leitura do
mesmo registro depois de recarregar. Ele verifica o comportamento da interface,
**não** a persistência real no banco. Não foi configurado um ambiente Supabase
exclusivo de testes nem incluído teste de integração real.

Para uma futura integração real, use um projeto Supabase separado de produção,
usuário e dados exclusivos de teste, credenciais fornecidas apenas ao processo
de execução (nunca em fixtures, arquivos versionados ou variáveis `VITE_*`) e
limpeza restrita aos registros criados pelo teste. O fluxo atual de confirmação
de cadastro é por e-mail; o app não implementa confirmação OTP.