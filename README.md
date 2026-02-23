# n8n-nodes-meta-graph-api

Custom n8n node for **Meta Graph API** with **automatic cursor pagination** and **batching**.

> Automatically follows `next` cursors — no more manual loops in n8n.

**[Português 🇧🇷](#português)** 

---

## The Problem

The official n8n Facebook Graph API node **does not handle pagination automatically**. When the API returns paginated data with a `next` cursor, you're forced to build manual loops with "Loop Over Items" just to fetch all pages — even for simple operations like listing ads.

On top of that, large accounts often get this error:

> *"The service was not able to process your request. Please reduce the amount of data you're asking for."*

This node solves both problems.

---

## Features

- **Auto-pagination** — follows `next` cursors automatically, collecting all results in a single execution
- **Batch interval** — configurable delay between page requests to respect API rate limits
- **Max pages limit** — control how many pages to fetch to avoid data explosion on large accounts
- **Flexible output** — get each record as an individual item or the raw API response
- **Simplified Fields** — write fields as a simple comma-separated string instead of collections
- **Up-to-date versions** — supports v18.0 through v24.0 (latest, released October 2025)

---

## Comparison with the official node

| Feature | Official n8n Node | This Node |
|---|:---:|:---:|
| GET / POST / DELETE | ✅ | ✅ |
| Token authentication | ✅ | ✅ |
| Binary file upload | ✅ | ✅ |
| Query Parameters | ✅ | ✅ |
| **Auto-pagination (next cursor)** | ❌ | ✅ |
| **Page limit** | ❌ | ✅ |
| **Batch interval (rate limit)** | ❌ | ✅ |
| **Individual item output** | ❌ | ✅ |
| **Simplified Fields input** | ❌ | ✅ |
| Versions v18 through v24 | Partial | ✅ |

---

## Installation

### Community Nodes (n8n Cloud or Self-hosted)

1. Go to **Settings → Community Nodes**
2. Click **Install a community node**
3. Enter: `n8n-nodes-meta-graph-api`
4. Click **Install**
5. Restart n8n if needed

### Manual (Self-hosted)

```bash
cd ~/.n8n
npm install n8n-nodes-meta-graph-api
# Restart n8n
```

### Docker

```dockerfile
RUN cd /home/node/.n8n && npm install n8n-nodes-meta-graph-api
```

### Local development

```bash
git clone https://github.com/nextcomunicacao/n8n-nodes-meta-graph-api.git
cd n8n-nodes-meta-graph-api
npm install
npm run build
npm link
cd ~/.n8n && npm link n8n-nodes-meta-graph-api
```

---

## Credential Setup

1. In n8n, go to **Credentials → New Credential**
2. Search for **Meta Graph API**
3. Paste your **Access Token**

Generate a token at the [Graph API Explorer](https://developers.facebook.com/tools/explorer/).

---

## Parameters

| Parameter | Type | Description |
|---|---|---|
| **Host URL** | Select | `graph.facebook.com` (default) or `graph-video.facebook.com` (video uploads) |
| **HTTP Request Method** | Select | `GET`, `POST`, or `DELETE` |
| **Graph API Version** | Select | v18.0 through v24.0 |
| **Node** | String | The object ID/path. E.g.: `me`, `act_123456789`, `page-id` |
| **Edge** | String | Collection attached to the node. E.g.: `ads`, `campaigns`, `insights` |
| **Fields** | String | Comma-separated fields to return |
| **Limit per Page** | Number | Records per page (default: 25) |
| **Auto-Pagination** | Boolean | Follow `next` cursors automatically (default: on) |
| **Max Pages** | Number | Max pages to fetch. 0 = unlimited |
| **Options → Query Parameters** | Key/Value | Extra query string parameters |
| **Options → Query Parameters JSON** | JSON | Extra parameters as JSON object |
| **Options → Batch Interval (ms)** | Number | Delay between pages in milliseconds |
| **Options → Output Mode** | Select | `Individual Items` or `Raw Response` |

---

## Usage Examples

### List ALL ads from an ad account

| Field | Value |
|---|---|
| Node | `act_123456789` |
| Edge | `ads` |
| Fields | `id,name,effective_status,adcreatives{title,body,thumbnail_url}` |
| Limit per Page | `25` |
| Auto-Pagination | ✅ |

### Ad insights with rate limit protection

| Field | Value |
|---|---|
| Node | `act_123456789` |
| Edge | `insights` |
| Fields | `campaign_name,ad_name,impressions,clicks,spend,cpc,ctr` |
| Options → Query Params | `date_preset=last_30d`, `level=ad` |
| Options → Batch Interval | `1000` |

### Active campaigns

| Field | Value |
|---|---|
| Node | `act_123456789` |
| Edge | `campaigns` |
| Fields | `id,name,status,objective,daily_budget` |
| Options → Query Params | `effective_status=['ACTIVE']` |

### Facebook Page posts

| Field | Value |
|---|---|
| Node | `{page-id}` |
| Edge | `posts` |
| Fields | `id,message,created_time,full_picture,shares` |
| Max Pages | `10` |

### Instagram media

| Field | Value |
|---|---|
| Node | `{ig-user-id}` |
| Edge | `media` |
| Fields | `id,caption,media_type,media_url,timestamp,like_count,comments_count` |

### Custom audiences

| Field | Value |
|---|---|
| Node | `act_123456789` |
| Edge | `customaudiences` |
| Fields | `id,name,approximate_count,data_source,delivery_status` |

### Ad creatives

| Field | Value |
|---|---|
| Node | `act_123456789` |
| Edge | `adcreatives` |
| Fields | `id,name,title,body,image_url,thumbnail_url,call_to_action_type` |

### Publish a post (POST)

| Field | Value |
|---|---|
| Method | `POST` |
| Node | `{page-id}` |
| Edge | `feed` |
| Options → Query Params | `message=My automated post!` |

### Debug with raw response

| Field | Value |
|---|---|
| Node | `act_123456789` |
| Edge | `ads` |
| Fields | `id,name` |
| Limit per Page | `5` |
| Options → Output Mode | `Raw Response` |

---

## How Pagination Works

The Graph API returns paginated data like this:

```json
{
  "data": [
    { "id": "123", "name": "Ad 1" },
    { "id": "456", "name": "Ad 2" }
  ],
  "paging": {
    "cursors": { "before": "QVFIu...", "after": "QVFIu..." },
    "next": "https://graph.facebook.com/v24.0/act_.../ads?...&after=QVFIu..."
  }
}
```

The official node returns **only the first page**. This node:

1. Makes the initial request
2. Collects records from the `data` field
3. Checks if `paging.next` exists
4. If yes, follows the `next` URL (which already contains all params and cursors)
5. Repeats until no more pages or `Max Pages` is reached
6. Returns all records as individual items

---

## Supported API Versions

| Version | Status | Released |
|---|---|---|
| **v24.0** | ✅ Latest | October 2025 |
| v23.0 | ✅ Supported | May 2025 |
| v22.0 | ✅ Supported | January 2025 |
| v21.0 | ✅ Supported | October 2024 |
| v20.0 | ⚠️ May be deprecated soon | May 2024 |
| v19.0 | ⚠️ May be deprecated soon | January 2024 |
| v18.0 | ⚠️ May be deprecated soon | September 2023 |

---

## Tips

- **"Reduce the amount of data" error**: lower `Limit per Page` to 10-25 and let auto-pagination fetch everything in smaller pages
- **Rate limit (error 32/17)**: use `Batch Interval` with 500-2000ms between pages
- **Very large accounts**: use `Max Pages` to limit data volume
- **Debug**: use `Output Mode: Raw Response` to see the full API response
- **Nested fields**: work normally, e.g.: `adcreatives{title,body,image_url}`

---

## Roadmap

- [ ] Native Meta Batch API support (`/batch` endpoint)
- [ ] Automatic retry on rate limit (HTTP 429)
- [ ] Real-time webhook support
- [ ] Offset-based pagination (for endpoints that don't support cursors)
- [ ] Ready-made workflow templates

---

## Contributing

Pull requests are welcome! For major changes, open an issue first.

```bash
git clone https://github.com/nextcomunicacao/n8n-nodes-meta-graph-api.git
cd n8n-nodes-meta-graph-api
npm install
npm run dev  # watch mode
```

---

## License

MIT

---

## Links

- [Meta Graph API — Official Docs](https://developers.facebook.com/docs/graph-api/)
- [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
- [Graph API Changelog](https://developers.facebook.com/docs/graph-api/changelog)
- [n8n — Creating Nodes](https://docs.n8n.io/integrations/creating-nodes/)
- [n8n — Community Nodes](https://docs.n8n.io/integrations/community-nodes/)

---

---

# Português

**Node customizado para Meta Graph API no n8n com paginação automática e batching.**

> Segue automaticamente os cursores `next` — sem necessidade de loops manuais no n8n.

---

## O Problema

O node oficial do n8n para Facebook Graph API **não resolve paginação automaticamente**. Quando a API retorna dados paginados com cursor `next`, você é obrigado a criar loops manuais com "Loop Over Items" para buscar todas as páginas — mesmo para operações simples como listar anúncios de uma conta.

Além disso, contas com muitos dados frequentemente recebem o erro:

> *"The service was not able to process your request. Please reduce the amount of data you're asking for."*

Esse node resolve esses problemas.

---

## Funcionalidades

- **Paginação automática** — segue os cursores `next` automaticamente, coletando todos os resultados em uma única execução
- **Batching com intervalo** — delay configurável entre requisições de cada página para respeitar rate limits
- **Limite de páginas** — controle quantas páginas buscar para evitar explosão de dados
- **Output flexível** — cada registro como item individual ou o JSON cru da API
- **Campo Fields simplificado** — texto simples separado por vírgulas, sem collections
- **Versões atualizadas** — v18.0 até v24.0 (mais recente, outubro 2025)

---

## Instalação

### Community Nodes (n8n Cloud ou Self-hosted)

1. Vá em **Settings → Community Nodes**
2. Clique em **Install a community node**
3. Digite: `n8n-nodes-meta-graph-api`
4. Clique em **Install**

### Instalação manual (Self-hosted)

```bash
cd ~/.n8n
npm install n8n-nodes-meta-graph-api
# Reinicie o n8n
```

### Docker

```dockerfile
RUN cd /home/node/.n8n && npm install n8n-nodes-meta-graph-api
```

---

## Configuração da Credencial

1. No n8n, vá em **Credentials → New Credential**
2. Busque por **Meta Graph API**
3. Cole seu **Access Token**

Gere um token no [Graph API Explorer](https://developers.facebook.com/tools/explorer/).

---

## Exemplos de Uso

### Listar TODOS os anúncios de uma conta

| Campo | Valor |
|---|---|
| Node | `act_123456789` |
| Edge | `ads` |
| Fields | `id,name,effective_status,adcreatives{title,body,thumbnail_url}` |
| Limit per Page | `25` |
| Auto-Pagination | ✅ |

### Insights com proteção de rate limit

| Campo | Valor |
|---|---|
| Node | `act_123456789` |
| Edge | `insights` |
| Fields | `campaign_name,ad_name,impressions,clicks,spend` |
| Options → Query Params | `date_preset=last_30d`, `level=ad` |
| Options → Batch Interval | `1000` |

### Campanhas ativas

| Campo | Valor |
|---|---|
| Node | `act_123456789` |
| Edge | `campaigns` |
| Fields | `id,name,status,objective,daily_budget` |
| Options → Query Params | `effective_status=['ACTIVE']` |

### Posts de uma página do Facebook

| Campo | Valor |
|---|---|
| Node | `{page-id}` |
| Edge | `posts` |
| Fields | `id,message,created_time,full_picture,shares` |
| Max Pages | `10` |

### Mídia do Instagram

| Campo | Valor |
|---|---|
| Node | `{ig-user-id}` |
| Edge | `media` |
| Fields | `id,caption,media_type,media_url,timestamp,like_count,comments_count` |

### Públicos personalizados

| Campo | Valor |
|---|---|
| Node | `act_123456789` |
| Edge | `customaudiences` |
| Fields | `id,name,approximate_count,data_source,delivery_status` |

### Criativos de anúncios

| Campo | Valor |
|---|---|
| Node | `act_123456789` |
| Edge | `adcreatives` |
| Fields | `id,name,title,body,image_url,thumbnail_url,call_to_action_type` |

### Publicar um post (POST)

| Campo | Valor |
|---|---|
| Method | `POST` |
| Node | `{page-id}` |
| Edge | `feed` |
| Options → Query Params | `message=Meu post automático!` |

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
    "cursors": { "before": "QVFIu...", "after": "QVFIu..." },
    "next": "https://graph.facebook.com/v24.0/act_.../ads?...&after=QVFIu..."
  }
}
```

O node oficial retorna **apenas a primeira página**. Este node:

1. Faz a requisição inicial
2. Coleta os registros do campo `data`
3. Verifica se existe `paging.next`
4. Se sim, segue a URL `next` (que já contém todos os parâmetros e cursores)
5. Repete até não haver mais páginas ou atingir o `Max Pages`
6. Retorna todos os registros como itens individuais

---

## Dicas

- **Erro "reduce the amount of data"**: diminua o `Limit per Page` para 10-25 e deixe a paginação automática buscar tudo em páginas menores
- **Rate limit (error 32/17)**: use o `Batch Interval` com 500-2000ms
- **Contas muito grandes**: use `Max Pages` para limitar o volume
- **Debug**: use `Output Mode: Raw Response` para ver a resposta completa
- **Fields aninhados**: funciona normalmente, ex: `adcreatives{title,body,image_url}`

---

## Licença

MIT

---

**Feito com ☕ por [Next Comunicação](https://github.com/nextcomunicacao)**
