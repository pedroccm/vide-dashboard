# Deploy - Aprendizados e Soluções

Este documento registra problemas encontrados durante deploys e suas soluções para aprendizado futuro.

## 🚨 Erro de Build #1 - TypeScript Unused Variables

### **Data:** 08/09/2024
### **Plataforma:** Netlify
### **Status:** ❌ ERRO

### **Erro Encontrado:**
```bash
11:54:58 AM: src/features/github/components/github-provider.tsx(1,8): error TS6133: 'React' is declared but its value is never read.
11:54:58 AM: src/features/github/components/github-provider.tsx(2,46): error TS6133: 'GitHubUser' is declared but its value is never read.
11:54:58 AM: src/features/github/components/repository-card.tsx(5,25): error TS6133: 'Eye' is declared but its value is never read.
11:54:58 AM: src/routes/api/auth/github/callback.tsx(3,1): error TS6133: 'toast' is declared but its value is never read.
```

### **Análise do Problema:**
- TypeScript detectou imports não utilizados
- O ESLint local não estava capturando esses problemas
- Build em produção tem configuração mais rigorosa

### **Causa Raiz:**
- Imports desnecessários deixados durante desenvolvimento
- Possível diferença entre configuração local vs produção

### **Solução Aplicada:**
```typescript
// Antes (imports desnecessários)
import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { GitHubConnection, GitHubRepository, GitHubUser } from '../data/types'
import { Eye, ExternalLink, Lock, Unlock, Archive, Circle } from 'lucide-react'
import { toast } from 'sonner'

// Depois (imports limpos)
import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'
import { GitHubConnection, GitHubRepository } from '../data/types'
import { ExternalLink, Lock, Unlock, Archive, Circle } from 'lucide-react'
// toast removido se não usado
```

### **Correções Específicas:**
1. **github-provider.tsx**: Removido `React` e `GitHubUser` não utilizados
2. **repository-card.tsx**: Removido `Eye` icon não utilizado
3. **callback.tsx**: Removido `toast` import não usado

### **Arquivos Corrigidos:**
- `src/features/github/components/github-provider.tsx`
- `src/features/github/components/repository-card.tsx`
- `src/routes/api/auth/github/callback.tsx`

### **Prevenção Futura:**
1. ✅ Executar `npm run build` localmente antes de push
2. ✅ Configurar ESLint para detectar imports não utilizados
3. ✅ Usar extensão do VS Code para highlight automático
4. ✅ Code review checklist incluindo imports limpos

---

## 🚨 Problema Potencial #2 - Variáveis de Ambiente

### **Data:** 08/09/2024
### **Plataforma:** Netlify
### **Status:** ⚠️ POSSÍVEL PROBLEMA

### **Problema Identificado:**
- Variáveis de ambiente não configuradas no Netlify
- `.env.local` não é enviado ao repositório (correto por segurança)
- GitHub OAuth pode falhar sem as variáveis

### **Variáveis Necessárias no Netlify:**
```bash
VITE_GITHUB_CLIENT_ID=Ov23li7HPBStIZDvFWOi
VITE_GITHUB_CLIENT_SECRET=e2a41bcef86b835cd2946ba24ebcaf2ed37735c4
VITE_GITHUB_REDIRECT_URI=https://vibeosdash.netlify.app/api/auth/github/callback
VITE_GITHUB_API_URL=https://api.github.com
VITE_APP_URL=https://vibeosdash.netlify.app
```

### **Como Configurar no Netlify:**
1. Ir para: Site Settings → Environment Variables
2. Adicionar cada variável individualmente
3. Fazer redeploy após adicionar

### **Solução Preventiva:**
- Sempre configurar env vars antes do primeiro deploy
- Documentar todas as variáveis necessárias
- Criar checklist de deploy

---

## 📚 Lições Aprendidas

### **Checklist de Deploy:**
- [ ] Executar `npm run build` localmente
- [ ] Verificar se não há imports não utilizados
- [ ] Configurar todas as variáveis de ambiente
- [ ] Testar OAuth callbacks em produção
- [ ] Verificar URLs de callback no GitHub App

### **Configurações Recomendadas:**

#### **ESLint Rules:**
```json
{
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "no-unused-imports": "error"
  }
}
```

#### **VS Code Settings:**
```json
{
  "typescript.preferences.removeUnusedImports": true,
  "editor.codeActionsOnSave": {
    "source.removeUnused": true
  }
}
```

---

## 🚨 Erro de Build #2 - TypeScript Unused Variable (Debug Tools)

### **Data:** 08/09/2024 - 12:24
### **Plataforma:** Netlify
### **Status:** ❌ ERRO

### **Erro Encontrado:**
```bash
12:24:09 PM: src/services/github-auth-temp.ts(8,7): error TS6133: 'isDevelopment' is declared but its value is never read.
```

### **Análise do Problema:**
- Variável `isDevelopment` declarada mas não utilizada no arquivo de debug
- Mesmo problema de imports/variáveis não utilizadas do Build #1
- Build em produção continua sendo mais rigoroso

### **Causa Raiz:**
- Código de debug criado rapidamente sem limpeza
- Variável `isDevelopment` importada mas não usada na lógica

### **Solução Aplicada:**
```typescript
// Antes (variável não utilizada)
const isDevelopment = import.meta.env.MODE === 'development'

// Depois (removida ou utilizada)
// Removida se não necessária, ou usada na lógica
```

### **Correção Específica:**
- **github-auth-temp.ts**: Remover variável `isDevelopment` não utilizada

### **Status da Correção:**
- ✅ **Status:** CORRIGIDO
- ✅ **Verificação:** Build local passou sem erros
- ⏱️ **Corrigido em:** 08/09/2024 12:26

### **Observação Importante:**
✅ **Variáveis de Ambiente Configuradas**: Netlify agora mostra as env vars sendo carregadas:
```
environment:
- VITE_APP_URL
- VITE_GITHUB_API_URL  
- VITE_GITHUB_CLIENT_ID
- VITE_GITHUB_CLIENT_SECRET
- VITE_GITHUB_REDIRECT_URI
```

---

## 🔄 Status de Correções

### **Build #1:**
- ❌ **Problema:** Imports não utilizados
- ✅ **Status:** CORRIGIDO
- ✅ **Verificação:** Build local passou sem erros
- ⏱️ **Corrigido em:** 08/09/2024 11:56

### **Build #2:**
- ❌ **Problema:** Variável não utilizada (isDevelopment)
- ✅ **Status:** CORRIGIDO
- ✅ **Verificação:** Build local passou sem erros  
- ⏱️ **Corrigido em:** 08/09/2024 12:26

### **Variáveis de Ambiente:**
- ✅ **Problema:** Env vars não configuradas
- ✅ **Status:** CONFIGURADO
- ✅ **Verificação:** Netlify mostra todas as variáveis carregadas

---

*Documento atualizado automaticamente a cada problema/solução encontrada.*