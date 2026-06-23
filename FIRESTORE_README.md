# 📚 Documentação Firestore - FourCred

## 📋 Índice Rápido

### 1. **[FIRESTORE_SCHEMA.md](./FIRESTORE_SCHEMA.md)** - Estrutura do Banco
- Collections e subcollections
- Estrutura de documentos
- Índices necessários
- Exemplos de dados
- Queries esperadas

### 2. **[FIRESTORE_SETUP.md](./FIRESTORE_SETUP.md)** - Guia de Instalação
- Criar banco de dados no Firebase Console
- Configurar regras de segurança
- Criar índices (passo-a-passo)
- Testar integração
- Troubleshooting

### 3. **[firestore.rules](./firestore.rules)** - Regras de Segurança
- Controle de acesso por role
- Validação de dados
- Política de leitura/escrita

### 4. **[src/lib/firestoreQueries.ts](./src/lib/firestoreQueries.ts)** - Funções Prontas
- `saveSubmission()` - salvar formulário
- `getClientSubmissions()` - listar por cliente
- `getClientsByStatus()` - dashboard
- `updateClientStatus()` - alterar status
- `searchClients()` - buscar
- Helpers de formatação

---

## 🚀 Quick Start (5 minutos)

### Passo 1: Criar Banco de Dados
```
1. Firebase Console → Firestore Database
2. Clique: "Criar banco de dados"
3. Localização: Southamerica (São Paulo) ou us-east1
4. Modo: Desenvolvimento (por enquanto)
5. Aguarde inicializar
```

### Passo 2: Copiar Regras de Segurança
```
1. Firestore → Regras
2. Copie conteúdo de firestore.rules
3. Clique: Publicar
```

### Passo 3: Criar Índices (5-10 min mais tarde)
```
1. Firestore → Índices
2. Crie 4 índices conforme FIRESTORE_SETUP.md
3. Aguarde status "Ativado" (verde)
```

### Passo 4: Testar Submissão
```bash
npm run dev
# Abra http://localhost:3000
# Preencha formulário e envie
```

### Passo 5: Verificar Dados
```
Firebase Console → Firestore
Você deve ver:
- ✅ collections/submissions/
- ✅ collections/clients/
```

---

## 📊 Estrutura Visual

```
Firestore (fourcred-7b33d)
│
├── 📄 submissions (histórico de todas as submissões)
│   └── {auto-id}
│       ├── clientId: "12345678900"
│       ├── p1: {...dados proponente 1...}
│       ├── p2: {...dados proponente 2...}
│       ├── creditAnalysis: {...}
│       ├── operation: {...}
│       └── submittedAt: Timestamp
│
├── 👤 clients (dados únicos de clientes)
│   └── 12345678900 (cpf sem formatação)
│       ├── cpf: "123.456.789-00"
│       ├── fullName: "Ricardo Mendes"
│       ├── email: "ricardo@email.com"
│       ├── status: "pendente" | "analise" | "aprovado" | "rejeitado"
│       ├── latestSubmissionId: "submission_id"
│       ├── 📎 documents/ (subcollection)
│       │   ├── rg {...}
│       │   ├── cpf {...}
│       │   └── salary_proof {...}
│       └── 📋 submissions/ (subcollection)
│           └── {auto-id} {...}
│
├── 🏠 properties (imóveis únicos)
│   └── "av-paulista-1200-apto-142"
│       ├── address: "Av. Paulista, 1200"
│       ├── saleValue: 890000
│       ├── submissionsCount: 3
│       └── updatedAt: Timestamp
│
└── 🔐 admins (controle de acesso)
    └── {user-id}
        └── role: "admin"
```

---

## 📝 Fluxo de Dados

```
┌─────────────────────────────────────────────────────────────────┐
│ Frontend: ClientForm.tsx                                        │
│ - Usuário preenche formulário                                   │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ Backend: POST /api/submissions (server.ts)                      │
│ - Valida dados                                                  │
│ - Extrai CPF do P1                                             │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ Firestore:                                                      │
│ 1. Cria documento em submissions/{auto-id}                      │
│ 2. Cria/atualiza documento em clients/{cpf}                     │
│ 3. Atualiza contador em properties/{property-id}                │
└──────────────────────────┬──────────────────────────────────────┘
                           │
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ Response: {id: "ABC123XYZ456..."}                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔍 Queries Mais Comuns

### Dashboard: Ver clientes pendentes
```typescript
import { getClientsByStatus } from '@/lib/firestoreQueries';

const pendingClients = await getClientsByStatus('pendente', 20);
```

### Dashboard: Contar por status
```typescript
import { getClientCountByStatus } from '@/lib/firestoreQueries';

const counts = await getClientCountByStatus();
// { pendente: 5, analise: 3, aprovado: 2, rejeitado: 1 }
```

### Dashboard: Ver submissões de um cliente
```typescript
import { getClientSubmissions } from '@/lib/firestoreQueries';

const submissions = await getClientSubmissions('12345678900');
```

### Dashboard: Buscar cliente por nome
```typescript
import { searchClients } from '@/lib/firestoreQueries';

const results = await searchClients('Ricardo');
```

---

## 🛡️ Segurança

### Regras aplicadas:
- ✅ Submissões podem ser criadas por qualquer um (formulário público)
- ✅ Clientes só podem ser lidos/escritos por admins
- ✅ Propriedades são de leitura pública
- ✅ Máximo 5MB por documento
- ✅ Validação de campos obrigatórios

### Para usar com autenticação:
1. Configure Firebase Auth no projeto
2. Altere `request.auth == null` para `request.auth != null` em firestore.rules
3. Implemente login no frontend

---

## 🎯 Próximos Passos

### Fase 1: Integração (Hoje)
- [x] Estrutura Firestore definida
- [x] Regras de segurança criadas
- [x] Queries prontas
- [ ] Banco de dados criado no Firebase Console
- [ ] Testes com submissão real

### Fase 2: Admin Dashboard (Próximo)
- [ ] Criar página AdminDashboard.tsx
- [ ] Listar clientes por status
- [ ] Filtros e busca
- [ ] Aprovar/rejeitar solicitações
- [ ] Exportar para PDF

### Fase 3: Analytics (Futuro)
- [ ] Dashboard com KPIs
- [ ] Gráficos de submissões por dia/mês
- [ ] Análise de aprovação
- [ ] Relatórios por imóvel

---

## ❓ Dúvidas?

Consulte:
1. **Estrutura?** → [FIRESTORE_SCHEMA.md](./FIRESTORE_SCHEMA.md)
2. **Como configurar?** → [FIRESTORE_SETUP.md](./FIRESTORE_SETUP.md)
3. **Queries?** → [src/lib/firestoreQueries.ts](./src/lib/firestoreQueries.ts)
4. **Segurança?** → [firestore.rules](./firestore.rules)

---

## 📞 Checklist de Implementação

- [ ] Ler [FIRESTORE_SCHEMA.md](./FIRESTORE_SCHEMA.md)
- [ ] Executar passo-a-passo de [FIRESTORE_SETUP.md](./FIRESTORE_SETUP.md)
- [ ] Testar submissão do formulário
- [ ] Verificar dados no Firestore Console
- [ ] Criar página AdminDashboard
- [ ] Implementar queries do [firestoreQueries.ts](./src/lib/firestoreQueries.ts)

---

**Última atualização:** 2026-06-23
