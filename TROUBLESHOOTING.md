# 🐛 Guia de Troubleshooting - Recife Vital

## Problemas de Setup

### 1. "npm install falhou"

**Erro típico:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solução:**
```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run build
```

### 2. ".env não é lido"

**Sintomas:** App roda em modo local mesmo com .env preenchido

**Verificar:**
- O arquivo se chama `.env` (não `.env.local` ou `.env.development`)
- Está na raiz do projeto (ao lado de package.json)
- Tem exatamente este formato:
  ```
  VITE_SUPABASE_URL=https://seu_projeto.supabase.co
  VITE_SUPABASE_ANON_KEY=sua_chave_aqui
  ```
- Não tem espaços ou caracteres extras

**Solução:**
```bash
cat .env  # Verifique o conteúdo
npm run dev  # Reinicie o dev server
```

### 3. "Erro ao conectar com Supabase"

**Sintomas:** Erro no console: "Supabase URL or key is missing"

**Verificação:**
1. Verifique a URL em https://app.supabase.com/project/seu_projeto/settings/api
2. A chave precisa ser a `anon` (pública), não a `service_role`
3. Certifique-se de que não há aspas extras no .env

**Teste a conexão:**
```javascript
// No console do navegador (F12):
console.log(import.meta.env.VITE_SUPABASE_URL);
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY);
```

Ambos devem retornar valores, não `undefined`.

### 4. "Erro 401/403 ao fazer login"

**Causa:** Falta de configuração de autenticação no Supabase

**Solução:**
1. Vá para Supabase > Authentication > Providers
2. Verifique se "Email" está ativado
3. Vá para "Policies" e verifique se há políticas RLS conflitantes
4. Execute o script SQL do schema.sql novamente

### 5. "Agendamentos não aparecem após salvar"

**Causa:** Políticas RLS bloqueando leitura de dados

**Verificar:**
1. Supabase > Authentication > Policies
2. Verifique tabelas `profiles` e `appointments`
3. As políticas devem estar habilitadas (row level security ON)
4. Cada política deve ter a condição `auth.uid() = user_id`

**Testar acesso:**
No SQL Editor do Supabase:
```sql
-- Como usuário autenticado, isso deve retornar seus dados
select * from appointments;
```

Se retornar erro 403, as políticas estão bloqueando.

### 6. "Build falha com 'Cannot find module'"

**Solução:**
```bash
npm install
npm run build
```

Se persistir, verifique se há erros de sintaxe em `src/App.jsx`:
```bash
npm run build 2>&1 | grep -i error
```

### 7. "App roda mas não sincroniza com banco"

**Verificar ordem de passos:**

1. ✓ Configurou .env?
2. ✓ Rodou schema.sql no Supabase?
3. ✓ Habilitou autenticação por email?
4. ✓ Ativou RLS nas tabelas?

Se tudo estiver OK, verifique os Logs do Supabase:
1. Supabase > Logs > API
2. Procure por erros 401, 403, 500

## Limpeza e Reset

### Resetar banco (development)

```sql
-- No SQL Editor do Supabase:
drop table if not exists public.appointments cascade;
drop table if not exists public.profiles cascade;
```

Depois rode o schema.sql novamente.

### Limpar localStorage do app

```javascript
// No console do navegador:
localStorage.clear();
location.reload();
```

### Limpar cache Node

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

## Verificação Rápida

Copie e cole isto no console do navegador (F12) enquanto o app está rodando:

```javascript
console.log({
  env_url: import.meta.env.VITE_SUPABASE_URL ? '✓' : '✗',
  env_key: import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓' : '✗',
  page_title: document.title,
  app_mounted: !!document.querySelector('.app-shell') || !!document.querySelector('.auth-shell')
});
```

Todos os valores devem ser `✓` ou `true`.

## Debug avançado

### Ver requisições HTTP

1. Abra DevTools (F12)
2. Vá para "Network"
3. Faça login ou agenda uma consulta
4. Procure por requisições que começam com sua URL do Supabase
5. Clique e veja Request/Response

### Ver logs do Supabase

1. Vá para Supabase > Logs > API
2. Filtro por timestamp (últimas requisições)
3. Procure por erros 4xx ou 5xx

### Ativar logging no app

Edite `src/App.jsx` e adicione antes de operações Supabase:

```javascript
console.log('Tentando inserir agendamento...', { user_id: profileId, ...payload });
const { data, error } = await supabase.from('appointments').insert(...);
if (error) console.error('Erro:', error);
```

## Contato e Referências

- Docs Supabase: https://supabase.com/docs
- Issues React: https://github.com/facebook/react/issues
- Vite Docs: https://vitejs.dev
