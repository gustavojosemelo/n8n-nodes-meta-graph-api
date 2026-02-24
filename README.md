# n8n-nodes-meta-graph-api

**Node customizado para Meta Graph API no n8n com paginação automática e batching.**

> ⚠️ **Versão Beta (0.0.4)** — Em desenvolvimento ativo. Feedbacks e contribuições são bem-vindos.

---

## O Problema

O node oficial do n8n para Facebook Graph API **não resolve paginação automaticamente**. Quando a API retorna dados paginados com cursor `next`, você é obrigado a criar loops manuais com "Loop Over Items" para buscar todas as páginas — mesmo para operações simples como listar anúncios de uma conta.

Além disso, contas com muitos dados frequentemente recebem o erro:

> *"The service was not able to process your request. Please reduce the amount of data you're asking for."*

Esse node resolve esses problemas.

---

## O que este node faz

- **Paginação automática**: segue os cursores `next` da Graph API automaticamente, coletando todos os resultados em uma única execução — sem loops no n8n
- **Batching com intervalo**: define um delay entre requisições de cada página para respeitar os rate limits da API
- **Limite de páginas**: controle quantas páginas buscar para evitar explosão de dados em contas grandes
- **Output flexível**: receba cada registro como item individual (ideal para processar depois) ou o JSON cru da API
- **Campo Fields simplificado**: escreva os campos como texto simples separado por vírgulas, sem precisar de collections
- **Versões atualizadas**: suporta da v18.0 até a v24.0 (mais recente, lançada em outubro 2025)

---

## Comparativo com o node oficial

| Feature | Node Oficial (n8n) | Este Node |
|---|:---:|:---:|
| GET / POST / DELETE | ✅ | ✅ |
| Autenticação por Token | ✅ | ✅ |
| Upload de arquivos binários | ✅ | ✅ |
| Query Parameters | ✅ | ✅ |
| **Paginação automática (cursor next)** | ❌ | ✅ |
| **Limite de páginas** | ❌ | ✅ |
| **Batch interval (rate limit)** | ❌ | ✅ |
| **Output individual por registro** | ❌ | ✅ |
| **Campo Fields simplificado** | ❌ | ✅ |
| Versões v18 até v24 | Parcial | ✅ |

---

## Instalação

### Community Nodes (n8n Cloud ou Self-hosted)

1. Vá em **Settings → Community Nodes**
2. Clique em **Install a community node**
3. Digite: `n8n-nodes-meta-graph-api`
4. Clique em **Install**
5. Reinicie o n8n se necessário

### Instalação manual (Self-hosted)

```bash
# Na pasta de dados do n8n (geralmente ~/.n8n)
cd ~/.n8n
npm install n8n-nodes-meta-graph-api

# Reinicie o n8n
pm2 restart n8n
# ou
systemctl restart n8n
```

### Docker

```dockerfile
RUN cd /home/node/.n8n && npm install n8n-nodes-meta-graph-api
```

### Build local (desenvolvimento)

```bash
git clone <repo-url>
cd n8n-nodes-meta-graph-api
npm install
npm run build

# Linkar para testar localmente
npm link
cd ~/.n8n
npm link n8n-nodes-meta-graph-api
```

---

## Configuração da Credencial

1. No n8n, vá em **Credentials → New Credential**
2. Busque por **Meta Graph API**
3. Cole seu **Access Token**

**Como gerar um token:**
- Acesse o [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
- Selecione seu App
- Selecione as permissões necessárias
- Clique em **Generate Access Token**

> 💡 Para tokens de longa duração, use o endpoint de troca de token da API.

---

## Parâmetros do Node

| Parâmetro | Tipo | Descrição |
|---|---|---|
| **Host URL** | Select | `graph.facebook.com` (padrão) ou `graph-video.facebook.com` (uploads de vídeo) |
| **HTTP Request Method** | Select | `GET`, `POST` ou `DELETE` |
| **Graph API Version** | Select | v18.0 até v24.0 |
| **Node** | String | O ID ou path do objeto. Ex: `me`, `act_123456789`, `page-id` |
| **Edge** | String | A coleção ligada ao node. Ex: `ads`, `campaigns`, `insights`, `posts` |
| **Fields** | String | Campos a retornar, separados por vírgula |
| **Limit per Page** | Number | Registros por página (padrão: 25) |
| **Auto-Pagination** | Boolean | Seguir cursores `next` automaticamente (padrão: ativado) |
| **Max Pages** | Number | Limite de páginas. 0 = sem limite |
| **Options → Query Parameters** | Key/Value | Parâmetros extras na query string |
| **Options → Query Parameters JSON** | JSON | Parâmetros extras como objeto JSON |
| **Options → Batch Interval (ms)** | Number | Delay entre páginas em milissegundos |
| **Options → Output Mode** | Select | `Individual Items` ou `Raw Response` |

---

## Exemplos de Uso

### 1. Listar TODOS os anúncios de uma conta de ads

Sem este node, você precisaria de um loop no n8n. Com ele, basta:

| Campo | Valor |
|---|---|
| Node | `act_123456789` |
| Edge | `ads` |
| Fields | `id,name,effective_status,adcreatives{title,body,thumbnail_url}` |
| Limit per Page | `25` |
| Auto-Pagination | ✅ |

> Retorna TODOS os anúncios, independente de quantas páginas existam. Cada anúncio vira um item separado na saída.

---

### 2. Buscar campanhas ativas

| Campo | Valor |
|---|---|
| Node | `act_123456789` |
| Edge | `campaigns` |
| Fields | `id,name,status,objective,daily_budget,lifetime_budget` |
| Options → Query Parameters | `effective_status` = `['ACTIVE']` |

---

### 3. Insights de anúncios com rate limit

| Campo | Valor |
|---|---|
| Node | `act_123456789` |
| Edge | `insights` |
| Fields | `campaign_name,ad_name,impressions,clicks,spend,cpc,ctr` |
| Limit per Page | `50` |
| Options → Query Parameters | `date_preset` = `last_30d`, `level` = `ad` |
| Options → Batch Interval | `1000` |

> Busca insights com 1 segundo de intervalo entre cada página para não estourar rate limit.

---

### 4. Posts de uma página do Facebook

| Campo | Valor |
|---|---|
| Node | `{page-id}` |
| Edge | `posts` |
| Fields | `id,message,created_time,full_picture,shares,likes.summary(true)` |
| Max Pages | `10` |

---

### 5. Listar públicos personalizados

| Campo | Valor |
|---|---|
| Node | `act_123456789` |
| Edge | `customaudiences` |
| Fields | `id,name,approximate_count,data_source,delivery_status` |

---

### 6. Buscar criativos de anúncios

| Campo | Valor |
|---|---|
| Node | `act_123456789` |
| Edge | `adcreatives` |
| Fields | `id,name,title,body,image_url,thumbnail_url,call_to_action_type` |

---

### 7. Mídia do Instagram

| Campo | Valor |
|---|---|
| Method | `GET` |
| Node | `{ig-user-id}` |
| Edge | `media` |
| Fields | `id,caption,media_type,media_url,timestamp,like_count,comments_count` |

---

### 8. Publicar um post (POST)

| Campo | Valor |
|---|---|
| Method | `POST` |
| Node | `{page-id}` |
| Edge | `feed` |
| Options → Query Parameters | `message` = `Meu post automático!` |

---

### 9. Resposta crua da API (debug)

| Campo | Valor |
|---|---|
| Node | `act_123456789` |
| Edge | `ads` |
| Fields | `id,name` |
| Limit per Page | `5` |
| Options → Output Mode | `Raw Response` |

> Retorna o JSON completo incluindo `paging`, `cursors`, etc. Útil para debug.

---

## Como funciona a paginação

A Graph API retorna dados paginados assim:

```json
{
  "data": [
    { "id": "123", "name": "Anúncio 1" },
    { "id": "456", "name": "Anúncio 2" }
  ],
  "paging": {
    "cursors": {
      "before": "QVFIu...",
      "after": "QVFIu..."
    },
    "next": "https://graph.facebook.com/v24.0/act_.../ads?fields=id,name&limit=25&after=QVFIu..."
  }
}
```

O node oficial retorna **apenas a primeira página**. Este node:

1. Faz a requisição inicial
2. Coleta os registros do campo `data`
3. Verifica se existe `paging.next`
4. Se sim, faz a próxima requisição usando a URL `next` (que já contém todos os parâmetros e cursores)
5. Repete até não haver mais páginas ou atingir o `Max Pages`
6. Retorna todos os registros como itens individuais

---

## Versões da API suportadas

| Versão | Status | Lançamento |
|---|---|---|
| **v24.0** | ✅ Mais recente | Outubro 2025 |
| v23.0 | ✅ Suportada | Maio 2025 |
| v22.0 | ✅ Suportada | Janeiro 2025 |
| v21.0 | ✅ Suportada | Outubro 2024 |
| v20.0 | ⚠️ Pode ser depreciada em breve | Maio 2024 |
| v19.0 | ⚠️ Pode ser depreciada em breve | Janeiro 2024 |
| v18.0 | ⚠️ Pode ser depreciada em breve | Setembro 2023 |

> A Meta deprecia versões antigas regularmente. Use sempre a versão mais recente possível.

---

## Dicas

- **Erro "reduce the amount of data"**: diminua o `Limit per Page` para 10-25 e deixe a paginação automática buscar tudo em páginas menores
- **Rate limit (error 32/17)**: use o `Batch Interval` com 500-2000ms entre páginas
- **Contas muito grandes**: use `Max Pages` para limitar o volume de dados
- **Debug**: use `Output Mode: Raw Response` para ver a resposta completa da API
- **Fields aninhados**: funciona normalmente, ex: `adcreatives{title,body,image_url}`

---

## Estrutura do Projeto

```
n8n-nodes-meta-graph-api/
├── credentials/
│   └── MetaGraphApi.credentials.ts
├── nodes/
│   └── MetaGraphApi/
│       ├── MetaGraphApi.node.ts
│       └── meta.svg
├── package.json
├── tsconfig.json
├── gulpfile.js
└── README.md
```

---

## Roadmap

- [ ] Suporte a Batch API nativa da Meta (endpoint `/batch`)
- [ ] Retry automático em caso de rate limit (HTTP 429)
- [ ] Suporte a webhooks em tempo real
- [ ] Paginação por offset (para endpoints que não usam cursor)
- [ ] Templates prontos para casos de uso comuns

---

## Contribuição

Pull requests são bem-vindos! Para mudanças grandes, abra uma issue primeiro.

```bash
git clone <repo-url>
cd n8n-nodes-meta-graph-api
npm install
npm run dev  # watch mode
```

---

## Licença

MIT

---

## Links Úteis

- [Meta Graph API — Documentação Oficial](https://developers.facebook.com/docs/graph-api/)
- [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
- [Changelog da Graph API](https://developers.facebook.com/docs/graph-api/changelog)
- [n8n — Creating Nodes](https://docs.n8n.io/integrations/creating-nodes/)
- [n8n — Community Nodes](https://docs.n8n.io/integrations/community-nodes/)
