# Guia de Configuração do Firestore - FourCred

## 1. Criar o Banco de Dados Firestore

### No Firebase Console:
1. Acesse: https://console.firebase.google.com
2. Selecione projeto: **fourcred-7b33d**
3. No menu esquerdo, clique em **Firestore Database**
4. Clique em **Criar banco de dados**
5. Escolha:
   - **Localização**: `Southamerica (São Paulo)` ou `us-east1`
   - **Modo inicial**: 
     - **Desenvolvimento** (para testes - sem restrições)
     - **Produção** (com regras de segurança)
6. Clique **Criar**

Aguarde ~1 minuto para inicializar.

---

## 2. Definir Regras de Segurança

### No Firestore Console:
1. Clique na aba **Regras**
2. Copie todo o conteúdo do arquivo [firestore.rules](./firestore.rules)
3. Cole no editor de regras
4. Clique **Publicar**

> **Nota:** Em desenvolvimento, você pode usar as regras padrão (permitir tudo) temporariamente para testar.

---

## 3. Criar Índices Compostos

### Para cada índice abaixo:

1. Clique na aba **Índices**
2. Clique **Criar índice**
3. Preencha os campos conforme tabela:

#### Índice 1: Submissões por Cliente
- **Coleção**: `submissions`
- **Campo 1**: `clientId` | Ascending (↑)
- **Campo 2**: `submittedAt` | Descending (↓)
- Clique **Criar índice**

#### Índice 2: Status com Data
- **Coleção**: `submissions`
- **Campo 1**: `status` | Ascending (↑)
- **Campo 2**: `updatedAt` | Descending (↓)
- Clique **Criar índice**

#### Índice 3: Clientes por Status
- **Coleção**: `clients`
- **Campo 1**: `status` | Ascending (↑)
- **Campo 2**: `updatedAt` | Descending (↓)
- Clique **Criar índice**

#### Índice 4: Propriedades por Preço
- **Coleção**: `properties`
- **Campo 1**: `saleValue` | Ascending (↑)
- **Campo 2**: `updatedAt` | Descending (↓)
- Clique **Criar índice**

**Status esperado:** Os índices ficarão em construção por alguns minutos e depois aparecerão como "Ativado" (verde).

---

## 4. Criar Documento Admin Inicial

### No Firestore Console:
1. Clique **+ Criar** para nova coleção
2. **Nome da coleção**: `admins`
3. **ID do documento**: (gerar ID automático ou digitar `seu-user-id`)
4. Adicione campo:
   - **Campo**: `role`
   - **Tipo**: String
   - **Valor**: `admin`
5. Clique **Salvar**

**Exemplo:**
```
admins/
  └── seu-user-id {
      role: "admin"
    }
```

---

## 5. Testar a Integração

### Via Frontend:

1. No terminal, execute:
   ```bash
   npm run dev
   ```

2. Abra http://localhost:3000

3. Preencha o formulário ClientForm e clique **Enviar**

4. Se bem-sucedido, você verá um alerta: `"Ficha cadastral enviada com sucesso!"`

5. No Firestore Console, você verá:
   - ✅ Nova coleção `submissions` com um documento
   - ✅ Nova coleção `clients` com um documento

### Via cURL (teste direto da API):

```bash
curl -X POST http://localhost:3000/api/submissions \
  -H "Content-Type: application/json" \
  -d '{
    "id": "test123",
    "submittedAt": "2026-06-23T10:30:00Z",
    "p1": {
      "fullName": "Teste Silva",
      "cpf": "111.222.333-44",
      "email": "teste@email.com",
      "phoneMobile": "(11) 99999-9999",
      "rg": "12.345.678-x",
      "gender": "M",
      "nationality": "Brasileira",
      "placeOfBirth": "São Paulo - SP",
      "dob": "1990-01-15",
      "motherName": "Mae Silva",
      "maritalStatus": "solteiro",
      "childrenCount": "0",
      "educationLevel": "superior_comp",
      "residenceType": "alugada",
      "residenceTime": "3",
      "street": "Rua Teste",
      "number": "100",
      "neighborhood": "Centro",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01000-000",
      "hasFinancing": "nao",
      "hasLoan": "nao",
      "profession": "Programador",
      "company": "Tech XYZ",
      "isOwner": "nao",
      "currentRole": "Dev",
      "serviceTime": "24",
      "salary": 5000,
      "admissionDate": "2022-01-10"
    },
    "hasP2": false,
    "usedFgts": "nao",
    "fgtsSubsidy": "nao",
    "ownsProperty": "nao",
    "otherAssets": "Nenhum",
    "targetPropertyAddress": "Av. Paulista, 1000, São Paulo",
    "parkingSpaces": "1",
    "saleValue": 500000,
    "downPayment": 100000,
    "useFgts": "nao",
    "financingValue": 400000,
    "termYears": 30,
    "amortizationSystem": "sac",
    "acceptedTerms": true
  }'
```

**Resposta esperada:**
```json
{
  "id": "ABC123XYZ456..."
}
```

---

## 6. Verificar no Firestore Console

Depois de uma submissão bem-sucedida:

### Collections criadas:
```
firestore-database/
  ├── submissions/
  │   └── {auto-id} {
  │       clientId: "11122233344"
  │       p1: {...}
  │       hasP2: false
  │       ...
  │     }
  │
  ├── clients/
  │   └── 11122233344 {
  │       cpf: "111.222.333-44"
  │       fullName: "Teste Silva"
  │       email: "teste@email.com"
  │       status: "pendente"
  │       createdAt: Timestamp
  │       updatedAt: Timestamp
  │     }
  │
  └── admins/
      └── seu-user-id {
          role: "admin"
        }
```

---

## 7. Implementar Admin Dashboard (Próximo)

Para ver/gerenciar clientes e submissões, recomenda-se criar uma página AdminDashboard com:

1. Listar clientes por status
2. Filtrar por data de submissão
3. Visualizar detalhes de cliente
4. Aprovar/Rejeitar solicitações

---

## 8. Troubleshooting

### ❌ Erro: "Firestore não está configurado"
- [ ] Verifique `.env` contém `FIREBASE_SERVICE_ACCOUNT_PATH=./firebase-service-account.json`
- [ ] Confirme arquivo `firebase-service-account.json` existe na raiz do projeto
- [ ] Teste: `npm run dev`

### ❌ Erro: "Permission denied"
- [ ] Verifique regras de segurança estão publicadas
- [ ] Se em desenvolvimento, use modo permissivo temporariamente
- [ ] Confirme que documento admin foi criado

### ❌ Submissão falha silenciosamente
- [ ] Verifique console do navegador (F12) para erros
- [ ] Verifique logs do servidor: `npm run dev` output
- [ ] Teste a rota `/api/health` para verificar servidor

### ✅ Tudo funcionando?
Parabéns! Agora você pode:
- Implementar queries para Admin Dashboard
- Adicionar validações mais complexas
- Integrar com serviços de análise de crédito
