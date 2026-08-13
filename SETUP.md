# 📋 Setup Completo - Recife Vital

Guia passo a passo para rodar o app com o Supabase.

## Pré-requisitos

- Node.js 16+
- Conta no Supabase (https://supabase.com)
- Git

## Etapa 1: Clonar e instalar

```bash
cd recife-vital
npm install
```

## Etapa 2: Configurar credenciais do Supabase

1. Vá para https://supabase.com e crie um projeto novo
2. Copie a URL do projeto e a chave anon (Settings > API)
3. Abra `.env` e preencha:

```
VITE_SUPABASE_URL=https://seu_projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anon_aqui
```

## Etapa 3: Criar as tabelas no Supabase

1. No painel do Supabase, clique em "SQL Editor"
2. Crie uma nova query
3. Cole todo o conteúdo de `supabase/schema.sql`
4. Clique em "Run"

**Resultado esperado:** Nenhum erro. As tabelas `profiles` e `appointments` são criadas.

## Etapa 4: Configurar autenticação

1. No Supabase, vá para Authentication > Providers
2. Ative "Email" (já vem ativado por padrão)
3. Configure "Email Confirmations" se desejar (opcional)

## Etapa 5: Validar setup

```bash
bash setup-validate.sh
```

Se aparecer `✅ Setup validado!`, continue. Se houver erro, execute:

```bash
npm install
npm run build
```

## Etapa 6: Rodar localmente

```bash
npm run dev
```

O app abre em `http://localhost:3000`.

## Etapa 7: Testar fluxo completo

1. **Cadastro:**
   - Clique em "Cadastre-se"
   - Preencha nome, email e senha
   - Clique "Cadastrar"
   - Resultado: você entra no app

2. **Agendamento:**
   - Clique na aba "Agenda"
   - Preencha tipo, data, horário
   - Clique "Buscar unidade" e escolha uma
   - Clique "Agendar"
   - Resultado: consulta aparece na lista

3. **Confirmar presença:**
   - Em uma consulta pendente, clique "Confirmar"
   - Clique "Confirmar" no modal
   - Resultado: consulta marca como confirmada e ganha pontos

## Troubleshooting

### "Não consegui fazer login"
- Verifique se as credenciais do .env estão corretas
- Certifique-se de que a tabela `profiles` foi criada
- Tente criar uma nova conta em vez de fazer login

### "Mensagem de erro ao agendar"
- Verifique se a tabela `appointments` existe
- Confira se o campo `user_id` referencia `profiles(id)` corretamente
- Veja o console do navegador (F12) para mais detalhes

### "App rodando mas dados não sincronizam"
- Certifique-se de que as políticas RLS estão ativadas em `profiles` e `appointments`
- Verifique se você está logado com Supabase (não modo local)
- Consulte a aba "Logs" no painel Supabase

## Build para produção

```bash
npm run build
```

A saída está em `dist/`. Você pode fazer deploy em Vercel, Netlify ou outro host.

## Para resetar o banco (desenvolvimento)

No SQL Editor do Supabase:

```sql
drop table if not exists public.appointments cascade;
drop table if not exists public.profiles cascade;
```

Depois rode o schema.sql novamente.
