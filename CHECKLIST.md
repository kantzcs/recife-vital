# ✅ Checklist Final - Recife Vital

Seu projeto está pronto. Siga os passos abaixo para ativar o banco e testar:

## 📋 Checklist de Setup

### ☐ Etapa 1: Credenciais Supabase
- [ ] Crie um projeto em https://supabase.com
- [ ] Copie a URL do projeto (Settings > API > Project URL)
- [ ] Copie a chave anon (Settings > API > anon key)
- [ ] Preencha o arquivo `.env` com essas credenciais
- [ ] Verifique se não tem espaços extras e aspas

```bash
# Teste se as credenciais foram lidas:
npm run check-env
```

### ☐ Etapa 2: Banco de Dados
- [ ] Vá para https://app.supabase.com
- [ ] Entre no seu projeto
- [ ] Vá para "SQL Editor"
- [ ] Clique em "New Query"
- [ ] Abra o arquivo `supabase/schema.sql` deste projeto
- [ ] Copie TUDO do arquivo schema.sql
- [ ] Cole na query do Supabase
- [ ] Clique "Run" (não deve ter erros)

**Verificar:** As tabelas `profiles` e `appointments` aparecem em "Tables"

### ☐ Etapa 3: Autenticação
- [ ] No Supabase, vá para "Authentication"
- [ ] Vá para "Providers"
- [ ] Verifique se "Email" está ativado (ativado por padrão)
- [ ] Vá para "Policies"
- [ ] Verifique se row level security está ON para `profiles` e `appointments`

### ☐ Etapa 4: Validação Local
```bash
# Na raiz do projeto:
npm install              # Se não tiver rodado antes
bash setup-validate.sh   # Valida tudo
npm run dev             # Inicia o servidor
```

O app abre em `http://localhost:3000`

### ☐ Etapa 5: Testes Funcionais

**Teste 1 - Cadastro:**
1. Clique "Cadastre-se"
2. Preencha: nome, email único, senha (mín 6 caracteres)
3. Repita a senha
4. Clique "Cadastrar"
5. ✓ Deve entrar no app automaticamente

**Teste 2 - Agendamento:**
1. Clique na aba "Agenda"
2. Preencha: tipo, data, horário, local
3. Clique "Buscar unidade"
4. Escolha uma unidade de Recife
5. Clique "Agendar"
6. ✓ Deve aparecer na lista de "Pendências"

**Teste 3 - Confirmar Presença:**
1. Em uma consulta pendente, clique "Confirmar"
2. Clique "Confirmar" no modal
3. ✓ A consulta marca como confirmada
4. ✓ Ganha pontos na aba "Recompensas"

**Teste 4 - Excluir:**
1. Em uma consulta, clique "Excluir"
2. Clique "Confirmar" no modal
3. ✓ Consulta desaparece da lista

### ☐ Etapa 6: Validar Sincronização

1. Faça login
2. Agende uma consulta
3. Vá para Supabase > Table Editor > "appointments"
4. ✓ Deve ter uma nova linha com seus dados

Se não aparecer:
- Verifique se as políticas RLS estão corretas (ver TROUBLESHOOTING.md)
- Abra DevTools (F12) e procure por erros de rede

## 📁 Arquivos Importantes

| Arquivo | Descrição |
|---------|-----------|
| `src/App.jsx` | Lógica principal do app |
| `src/lib/supabase.js` | Configuração do Supabase |
| `.env` | Credenciais (não fazer commit) |
| `supabase/schema.sql` | Estrutura do banco |
| `SETUP.md` | Guia de setup completo |
| `TROUBLESHOOTING.md` | Soluções para problemas |
| `README.md` | Documentação geral |

## 🚀 Próximos Passos (Opcional)

Depois que tudo está funcionando:

1. **Deploy:** 
   ```bash
   npm run build
   # Envie a pasta `dist/` para Vercel, Netlify, etc
   ```

2. **Produção:** Configure novas variáveis de ambiente na plataforma de deploy

3. **Segurança:** Revise as políticas RLS no Supabase (ver schema.sql)

## ❓ Problemas?

- Leia `TROUBLESHOOTING.md` primeiro
- Ou execute `bash setup-validate.sh` para diagnosticar

## ✅ Status do Projeto

- **Build:** ✓ Compilando sem erros
- **Dependências:** ✓ Supabase JS SDK instalado
- **Config:** ✓ .env.example + setup scripts
- **Banco:** ✓ Schema SQL pronto
- **Autenticação:** ✓ Fluxo login/signup integrado
- **Mensagens:** ✓ Erros visíveis no UI
- **Documentação:** ✓ Completa

**Status geral:** 🟢 Pronto para testar com Supabase

---

**Dúvida?** Abra uma issue ou consulte TROUBLESHOOTING.md
