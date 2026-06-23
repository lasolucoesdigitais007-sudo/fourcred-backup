# Estrutura do Firestore - FourCred

## 1. Collections

### 1.1 `clients`
**Armazena:** Dados únicos de clientes/proponentes (principal)

**Documento ID:** CPF de P1 sem formatação (ex: `12345678900`)

**Campos principais:**
```typescript
{
  // Identificação
  cpf: string;                    // CPF do P1 (único)
  fullName: string;               // Nome completo de P1
  email: string;                  // Email principal
  phoneMobile: string;            // Telefone celular
  
  // Dados P2 (se houver)
  hasP2: boolean;
  p2Relationship?: string;        // "Cônjuge", "Parceiro", etc.
  
  // Contato para atualizações
  preferredContact: string;       // "email" | "phone" | "sms"
  
  // Controle
  createdAt: Timestamp;           // Data de criação
  updatedAt: Timestamp;           // Última atualização
  status: string;                 // "pendente" | "analise" | "aprovado" | "rejeitado"
  
  // Última submissão
  latestSubmissionId?: string;    // referência ao documento em submissions
}
```

**Índices necessários:**
- `status` (Ascending)
- `updatedAt` (Descending)
- `createdAt` (Descending)

---

### 1.2 `submissions`
**Armazena:** Histórico completo de cada submissão de formulário

**Documento ID:** Auto-gerado

**Campos principais:**
```typescript
{
  // Referência ao cliente
  clientId: string;               // CPF P1 (para buscar cliente)
  
  // Proponentes (completos)
  p1: Proponent;
  hasP2: boolean;
  p2Relationship?: string;
  p2?: Proponent;
  
  // Análise de Crédito
  creditAnalysis: {
    usedFgts: string;
    fgtsSubsidy: string;
    ownsProperty: string;
    propertyAddress?: string;
    propertyFraction?: number;
    otherAssets: string;
  };
  
  // Operação
  operation: {
    targetPropertyAddress: string;
    parkingSpaces: string;
    saleValue: number;
    downPayment: number;
    useFgts: string;
    fgtsValue?: number;
    financingValue: number;
    termYears: number;
    amortizationSystem: string;
  };
  
  // Status
  acceptedTerms: boolean;
  
  // Timestamps
  submittedAt: Timestamp;
  createdAt: Timestamp;
}
```

**Índices necessários:**
- `clientId` (Ascending) + `submittedAt` (Descending) - para listar por cliente
- `submittedAt` (Descending) - para listar todas as submissões recentes

---

### 1.3 `properties` (Optional - para rastrear imóveis)
**Armazena:** Imóveis alvo únicos

**Documento ID:** Hash ou endereço normalizado

**Campos principais:**
```typescript
{
  address: string;
  city: string;
  state: string;
  zipCode: string;
  saleValue: number;
  
  // Rastreamento
  submissionsCount: number;       // Quantas submissões para este imóvel
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

---

## 2. Subcollections

### 2.1 `clients/{clientId}/submissions`
**Alternativa a um índice composto:** Armazena submissões de um cliente específico

```
clients/
  └── 12345678900/
      └── submissions/
          ├── submissionId1 {...}
          ├── submissionId2 {...}
```

**Vantagem:** Menos leitura de documentos ao consultar histórico de um cliente
**Desvantagem:** Consultas mais complexas entre clientes

---

### 2.2 `clients/{clientId}/documents` (Opcional)
**Para armazenar:** Anexos, scans de RG/CPF, comprovante de renda

```
clients/
  └── 12345678900/
      └── documents/
          ├── rg.pdf {...metadata...}
          ├── cpf.pdf {...metadata...}
          ├── salary_proof.pdf {...metadata...}
```

---

## 3. Índices Necessários

| Collection | Campo 1 | Ordem 1 | Campo 2 | Ordem 2 | Propósito |
|-----------|---------|--------|---------|--------|-----------|
| `submissions` | `clientId` | ↑ | `submittedAt` | ↓ | Listar submissões por cliente, ordenadas por data |
| `submissions` | `status` | ↑ | `updatedAt` | ↓ | Filtrar por status e listar mais recentes |
| `clients` | `status` | ↑ | `updatedAt` | ↓ | Dashboard: listar por status |
| `clients` | `createdAt` | ↓ | - | - | Listar novos clientes |
| `properties` | `saleValue` | ↑ | `updatedAt` | ↓ | Range query por preço |

**Para criar no Firestore Console:**
1. Acesse Firestore → Índices
2. Crie índices compostos conforme acima

---

## 4. Regras de Segurança

```firestore
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    
    // Função helper: verificar se é admin
    function isAdmin() {
      return get(/databases/$(database)/documents/admins/$(request.auth.uid)).data.role == 'admin';
    }
    
    // === CLIENTS ===
    match /clients/{clientId} {
      // Apenas admins podem ler/escrever clientes
      allow read, write: if isAdmin();
      
      // Subcollection: submissions
      match /submissions/{submissionId} {
        allow read, write: if isAdmin();
      }
      
      // Subcollection: documents
      match /documents/{documentId} {
        allow read, write: if isAdmin();
      }
    }
    
    // === SUBMISSIONS ===
    match /submissions/{submissionId} {
      // Apenas admins podem ler
      allow read: if isAdmin();
      
      // Qualquer um pode escrever (POST do formulário)
      allow create: if request.resource.data.keys().hasAll([
        'clientId', 'p1', 'submittedAt', 'createdAt'
      ]);
      
      // Apenas admins podem atualizar
      allow update: if isAdmin();
      
      // Apenas admins podem deletar
      allow delete: if isAdmin();
    }
    
    // === PROPERTIES ===
    match /properties/{propertyId} {
      // Leitura pública
      allow read: if true;
      
      // Apenas admins podem escrever
      allow write: if isAdmin();
    }
    
    // === ADMINS (configuração) ===
    match /admins/{userId} {
      allow read, write: if isAdmin();
    }
  }
}
```

---

## 5. Exemplos de Documentos

### 5.1 Documento em `clients/12345678900`

```json
{
  "cpf": "123.456.789-00",
  "fullName": "Ricardo Mendes Santos",
  "email": "ricardo.mendes@email.com",
  "phoneMobile": "(11) 98765-4321",
  "hasP2": true,
  "p2Relationship": "Cônjuge",
  "preferredContact": "email",
  "createdAt": "2026-06-23T10:30:00Z",
  "updatedAt": "2026-06-23T15:45:22Z",
  "status": "analise",
  "latestSubmissionId": "submission_abc123def456"
}
```

---

### 5.2 Documento em `submissions/submission_abc123def456`

```json
{
  "clientId": "12345678900",
  "p1": {
    "fullName": "Ricardo Mendes Santos",
    "cpf": "123.456.789-00",
    "rg": "12.345.678-x",
    "gender": "M",
    "nationality": "Brasileira",
    "placeOfBirth": "São Paulo - SP",
    "dob": "1985-05-15",
    "motherName": "Maria Mendes Santos",
    "maritalStatus": "casado",
    "childrenCount": "2",
    "email": "ricardo.mendes@email.com",
    "phoneMobile": "(11) 98765-4321",
    "educationLevel": "superior_comp",
    "residenceType": "alugada",
    "residenceTime": "5",
    "street": "Rua das Flores",
    "number": "123",
    "complement": "Apto 45",
    "neighborhood": "Bela Vista",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01311-000",
    "hasFinancing": "nao",
    "hasLoan": "nao",
    "profession": "Engenheiro Civil",
    "company": "Construtora XYZ",
    "isOwner": "nao",
    "currentRole": "Engenheiro Sênior",
    "serviceTime": "48",
    "salary": 12500.00,
    "admissionDate": "2020-01-10",
    "otherIncomes": 1200,
    "otherIncomesOrigin": "Aluguéis"
  },
  "hasP2": true,
  "p2Relationship": "Cônjuge",
  "p2": {
    "fullName": "Ana Paula Oliveira Mendes",
    "cpf": "098.765.432-11",
    "rg": "23.456.789-y",
    "gender": "F",
    "nationality": "Brasileira",
    "placeOfBirth": "Campinas - SP",
    "dob": "1988-08-22",
    "motherName": "Josefina Oliveira",
    "maritalStatus": "casado",
    "childrenCount": "2",
    "email": "ana.paula@email.com",
    "phoneMobile": "(11) 91234-5678",
    "educationLevel": "superior_comp",
    "residenceType": "alugada",
    "residenceTime": "5",
    "street": "Rua das Flores",
    "number": "123",
    "complement": "Apto 45",
    "neighborhood": "Bela Vista",
    "city": "São Paulo",
    "state": "SP",
    "zipCode": "01311-000",
    "hasFinancing": "nao",
    "hasLoan": "nao",
    "profession": "Arquiteta",
    "company": "Estúdio Novo",
    "isOwner": "nao",
    "currentRole": "Sócia Diretora",
    "serviceTime": "36",
    "salary": 8000.00,
    "admissionDate": "2018-03-15"
  },
  "creditAnalysis": {
    "usedFgts": "sim",
    "fgtsSubsidy": "nao",
    "ownsProperty": "nao",
    "propertyAddress": null,
    "propertyFraction": null,
    "otherAssets": "Poupança ativa de R$ 95.000"
  },
  "operation": {
    "targetPropertyAddress": "Av. Paulista, 1200 - Apto 142, Jardim Paulista, SP",
    "parkingSpaces": "2",
    "saleValue": 890000.00,
    "downPayment": 390000.00,
    "useFgts": "sim",
    "fgtsValue": 45000.00,
    "financingValue": 500000.00,
    "termYears": 35,
    "amortizationSystem": "sac"
  },
  "acceptedTerms": true,
  "submittedAt": "2026-06-23T15:45:22Z",
  "createdAt": "2026-06-23T15:45:22Z"
}
```

---

### 5.3 Documento em `properties/av-paulista-1200-apto-142`

```json
{
  "address": "Av. Paulista, 1200",
  "complement": "Apto 142",
  "neighborhood": "Jardim Paulista",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01311-100",
  "saleValue": 890000.00,
  "submissionsCount": 3,
  "createdAt": "2026-06-20T08:00:00Z",
  "updatedAt": "2026-06-23T15:45:22Z"
}
```

---

## 6. Fluxo de Dados

```
Frontend (ClientForm.tsx)
    ↓
POST /api/submissions (server.ts)
    ↓
Firestore:
  ├── submissions/{auto-id} ← novo documento
  └── clients/{cpf} ← atualiza ou cria
         └── latestSubmissionId referencia
```

---

## 7. Queries Esperadas

### 7.1 Listar submissões de um cliente
```
db.collection('submissions')
  .where('clientId', '==', '12345678900')
  .orderBy('submittedAt', 'desc')
  .limit(10)
```

### 7.2 Dashboard: Clientes em análise (recentes)
```
db.collection('clients')
  .where('status', '==', 'analise')
  .orderBy('updatedAt', 'desc')
  .limit(20)
```

### 7.3 Listar imóveis com submissões
```
db.collection('properties')
  .where('submissionsCount', '>', 0)
  .orderBy('saleValue', 'asc')
```

---

## 8. Próximos Passos

1. **Criar o banco de dados Firestore** no Firebase Console (modo produção ou teste)
2. **Implementar índices compostos** conforme tabela acima
3. **Definir regras de segurança** (copiar do item 4)
4. **Testar submissão** do formulário via `/api/submissions`
5. **Verificar collections** no Firestore Console após primeira submissão
6. **Implementar Admin Dashboard** com as queries do item 7
