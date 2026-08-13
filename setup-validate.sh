#!/bin/bash

# Script de validação do setup - rodar após configurar .env

echo "🔍 Verificando Recife Vital..."

# Verifica Node.js
echo "✓ Node.js:"
node --version

# Verifica dependências instaladas
echo ""
echo "✓ Dependências:"
if [ -d "node_modules/@supabase" ]; then
  echo "  - Supabase JS SDK instalado"
else
  echo "  ⚠ Supabase JS SDK não encontrado. Execute: npm install"
  exit 1
fi

# Verifica arquivo .env
echo ""
echo "✓ Configuração:"
if [ -f ".env" ]; then
  URL_SET=$(grep "VITE_SUPABASE_URL" .env | grep -v "SEU_PROJETO" | wc -l)
  KEY_SET=$(grep "VITE_SUPABASE_ANON_KEY" .env | grep -v "SUA_ANON_KEY" | wc -l)
  
  if [ "$URL_SET" -eq 1 ] && [ "$KEY_SET" -eq 1 ]; then
    echo "  - .env configurado ✓"
  else
    echo "  ⚠ .env incompleto. Verifique VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY"
    exit 1
  fi
else
  echo "  ⚠ .env não encontrado. Copie de .env.example e configure"
  exit 1
fi

# Verifica estrutura do projeto
echo ""
echo "✓ Estrutura de arquivos:"
FILES=("src/App.jsx" "src/lib/supabase.js" "supabase/schema.sql" "package.json")
for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "  - $file"
  fi
done

# Verifica build
echo ""
echo "✓ Build:"
if npm run build > /dev/null 2>&1; then
  echo "  - Build compilou sem erros ✓"
else
  echo "  ⚠ Build falhou. Verifique console acima"
  exit 1
fi

echo ""
echo "✅ Setup validado! Próximos passos:"
echo "   1. Vá para o painel do Supabase"
echo "   2. Execute o SQL em supabase/schema.sql"
echo "   3. Execute: npm run dev"
echo "   4. Teste login/cadastro em http://localhost:3000"
