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