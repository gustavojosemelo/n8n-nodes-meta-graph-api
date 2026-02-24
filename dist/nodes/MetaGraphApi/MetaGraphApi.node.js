"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaGraphApi = void 0;
const n8n_workflow_1 = require("n8n-workflow");
class MetaGraphApi {
    constructor() {
        this.description = {
            displayName: 'Meta Graph API',
            name: 'metaGraphApi',
            icon: 'file:meta.svg',
            group: ['transform'],
            version: 1,
            subtitle: '={{$parameter["httpRequestMethod"] + " /" + $parameter["node"]}}',
            description: 'Interact with Meta Graph API with automatic cursor pagination and batching. Follows "next" cursors automatically — no loops needed.',
            defaults: {
                name: 'Meta Graph API',
            },
            usableAsTool: true,
            inputs: [n8n_workflow_1.NodeConnectionTypes.Main],
            outputs: [n8n_workflow_1.NodeConnectionTypes.Main],
            credentials: [
                {
                    name: 'metaGraphApi',
                    required: true,
                },
            ],
            properties: [
                // ─── Host URL ───────────────────────────────────
                {
                    displayName: 'Host URL',
                    name: 'hostUrl',
                    type: 'options',
                    options: [
                        {
                            name: 'Default',
                            value: 'graph.facebook.com',
                        },
                        {
                            name: 'Video Uploads',
                            value: 'graph-video.facebook.com',
                        },
                    ],
                    default: 'graph.facebook.com',
                    description: 'The host URL for the request. Almost all requests use graph.facebook.com. Only video uploads use graph-video.facebook.com.',
                    required: true,
                },
                // ─── HTTP Method ────────────────────────────────
                {
                    displayName: 'HTTP Request Method',
                    name: 'httpRequestMethod',
                    type: 'options',
                    options: [
                        { name: 'GET', value: 'GET' },
                        { name: 'POST', value: 'POST' },
                        { name: 'DELETE', value: 'DELETE' },
                    ],
                    default: 'GET',
                    description: 'The HTTP method for the request',
                    required: true,
                },
                // ─── Graph API Version ──────────────────────────
                {
                    displayName: 'Graph API Version',
                    name: 'graphApiVersion',
                    type: 'options',
                    options: [
                        { name: 'v24.0 (Latest)', value: 'v24.0' },
                        { name: 'v23.0', value: 'v23.0' },
                        { name: 'v22.0', value: 'v22.0' },
                        { name: 'v21.0', value: 'v21.0' },
                        { name: 'v20.0', value: 'v20.0' },
                        { name: 'v19.0', value: 'v19.0' },
                        { name: 'v18.0', value: 'v18.0' },
                    ],
                    default: 'v24.0',
                    description: 'The Graph API version to use for the request',
                    required: true,
                },
                // ─── Node ───────────────────────────────────────
                {
                    displayName: 'Node',
                    name: 'node',
                    type: 'string',
                    default: '',
                    description: 'The node to operate on. Each object in Facebook has a unique ID. E.g.: me, act_123456789, page-id.',
                    placeholder: 'act_123456789',
                    required: true,
                },
                // ─── Edge ───────────────────────────────────────
                {
                    displayName: 'Edge',
                    name: 'edge',
                    type: 'string',
                    default: '',
                    description: 'Edge of the node. Edges are collections of objects attached to the node. E.g.: ads, campaigns, adsets, insights, posts.',
                    placeholder: 'ads',
                },
                // ─── Fields ─────────────────────────────────────
                {
                    displayName: 'Fields',
                    name: 'fields',
                    type: 'string',
                    default: '',
                    description: 'Comma-separated list of fields to return. Supports nested fields. E.g.: id,name,effective_status,adcreatives{title,body,thumbnail_url}',
                    placeholder: 'id,name,effective_status',
                    displayOptions: {
                        show: {
                            httpRequestMethod: ['GET'],
                        },
                    },
                },
                // ─── Limit ──────────────────────────────────────
                {
                    displayName: 'Limit per Page',
                    name: 'limit',
                    type: 'number',
                    default: 25,
                    description: 'Number of records per page. The Graph API returns up to ~100 per page depending on the endpoint. Use smaller values to avoid "reduce the amount of data" errors.',
                    displayOptions: {
                        show: {
                            httpRequestMethod: ['GET'],
                        },
                    },
                    typeOptions: {
                        minValue: 1,
                        maxValue: 500,
                    },
                },
                // ─── Auto Pagination ────────────────────────────
                {
                    displayName: 'Auto-Pagination',
                    name: 'autoPagination',
                    type: 'boolean',
                    default: true,
                    description: 'Whether to automatically follow "next" pagination cursors from the Graph API, collecting ALL results without external loops.',
                    displayOptions: {
                        show: {
                            httpRequestMethod: ['GET'],
                        },
                    },
                },
                // ─── Max Pages ──────────────────────────────────
                {
                    displayName: 'Max Pages',
                    name: 'maxPages',
                    type: 'number',
                    default: 0,
                    description: 'Maximum number of pages to fetch. Use 0 for unlimited (fetches everything). Useful to avoid excessive requests on large accounts.',
                    displayOptions: {
                        show: {
                            autoPagination: [true],
                            httpRequestMethod: ['GET'],
                        },
                    },
                    typeOptions: {
                        minValue: 0,
                    },
                },
                // ─── Ignore SSL ─────────────────────────────────
                {
                    displayName: 'Ignore SSL Issues (Insecure)',
                    name: 'allowUnauthorizedCerts',
                    type: 'boolean',
                    default: false,
                    description: 'Whether to connect even if SSL certificate validation is not possible',
                },
                // ─── Send Binary Data ───────────────────────────
                {
                    displayName: 'Send Binary File',
                    name: 'sendBinaryData',
                    type: 'boolean',
                    displayOptions: {
                        show: {
                            httpRequestMethod: ['POST'],
                        },
                    },
                    default: false,
                    required: true,
                    description: 'Whether binary data should be sent as body',
                },
                {
                    displayName: 'Input Binary Field',
                    name: 'binaryPropertyName',
                    type: 'string',
                    default: '',
                    placeholder: 'file:data',
                    displayOptions: {
                        hide: {
                            sendBinaryData: [false],
                        },
                        show: {
                            httpRequestMethod: ['POST'],
                        },
                    },
                    hint: 'The name of the input binary field containing the file to upload',
                    description: 'For Form-Data Multipart, use the format: "sendKey1:binaryProperty1,sendKey2:binaryProperty2"',
                },
                // ─── Options ────────────────────────────────────
                {
                    displayName: 'Options',
                    name: 'options',
                    type: 'collection',
                    placeholder: 'Add option',
                    default: {},
                    options: [
                        {
                            displayName: 'Query Parameters',
                            name: 'queryParameters',
                            placeholder: 'Add Parameter',
                            type: 'fixedCollection',
                            typeOptions: {
                                multipleValues: true,
                            },
                            description: 'Additional query string parameters to send',
                            default: {},
                            options: [
                                {
                                    name: 'parameter',
                                    displayName: 'Parameter',
                                    values: [
                                        {
                                            displayName: 'Name',
                                            name: 'name',
                                            type: 'string',
                                            default: '',
                                            description: 'Parameter name',
                                        },
                                        {
                                            displayName: 'Value',
                                            name: 'value',
                                            type: 'string',
                                            default: '',
                                            description: 'Parameter value',
                                        },
                                    ],
                                },
                            ],
                        },
                        {
                            displayName: 'Query Parameters JSON',
                            name: 'queryParametersJson',
                            type: 'json',
                            default: '{}',
                            placeholder: '{"field_name": "field_value"}',
                            description: 'Additional query string parameters as a JSON object. If set here and above, both are merged.',
                        },
                        {
                            displayName: 'Batch Interval (ms)',
                            name: 'batchInterval',
                            type: 'number',
                            default: 0,
                            description: 'Delay in milliseconds between each pagination page request. Useful to respect API rate limits.',
                            typeOptions: {
                                minValue: 0,
                            },
                        },
                        {
                            displayName: 'Item Interval (ms)',
                            name: 'itemInterval',
                            type: 'number',
                            default: 500,
                            description: 'Delay in milliseconds between processing each input item. Prevents flooding the API when multiple items are connected (e.g., 31 date ranges). Set to 0 for parallel execution (not recommended for Meta API). Default: 500ms.',
                            typeOptions: {
                                minValue: 0,
                                maxValue: 10000,
                            },
                        },
                        {
                            displayName: 'Request Timeout (ms)',
                            name: 'requestTimeout',
                            type: 'number',
                            default: 30000,
                            description: 'Timeout in milliseconds for each HTTP request. Increase for slow endpoints or large responses. Default: 30000 (30 seconds).',
                            typeOptions: {
                                minValue: 5000,
                                maxValue: 120000,
                            },
                        },
                        {
                            displayName: 'Retry on Connection Error',
                            name: 'retryOnConnectionError',
                            type: 'boolean',
                            default: true,
                            description: 'Whether to automatically retry when a connection error occurs (ECONNRESET, ETIMEDOUT, ECONNREFUSED). Retries up to 3 times with exponential backoff.',
                        },
                        {
                            displayName: 'Include Input Data',
                            name: 'includeInputData',
                            type: 'boolean',
                            default: false,
                            description: 'Whether to merge the input item data (from the previous node) into each output record. Useful to keep context like date ranges, account IDs, or any other data from upstream nodes.',
                        },
                        {
                            displayName: 'Output Mode',
                            name: 'outputMode',
                            type: 'options',
                            options: [
                                {
                                    name: 'Individual Items',
                                    value: 'individual',
                                    description: 'Each record from the "data" field becomes a separate output item',
                                },
                                {
                                    name: 'Raw Response',
                                    value: 'raw',
                                    description: 'Returns the full API response as a single item (including paging info)',
                                },
                            ],
                            default: 'individual',
                            description: 'How data should be returned. "Individual Items" is ideal for processing each record separately.',
                        },
                    ],
                },
            ],
        };
    }
    async execute() {
        var _a, _b, _c, _d, _e;
        const items = this.getInputData();
        const returnItems = [];
        // ─── Retry helper with exponential backoff ───────
        const RETRYABLE_CODES = ['ECONNRESET', 'ETIMEDOUT', 'ECONNREFUSED', 'EPIPE', 'EAI_AGAIN'];
        const isRetryableError = (error) => {
            var _a, _b, _c, _d;
            const code = error.code || ((_a = error.cause) === null || _a === void 0 ? void 0 : _a.code) || '';
            if (RETRYABLE_CODES.includes(code))
                return true;
            if ((_b = error.message) === null || _b === void 0 ? void 0 : _b.includes('ECONNRESET'))
                return true;
            if ((_c = error.message) === null || _c === void 0 ? void 0 : _c.includes('ECONNREFUSED'))
                return true;
            if ((_d = error.message) === null || _d === void 0 ? void 0 : _d.includes('socket hang up'))
                return true;
            return false;
        };
        const executeWithRetry = async (requestFn, maxRetries, retryEnabled) => {
            let lastError;
            const attempts = retryEnabled ? maxRetries : 1;
            for (let attempt = 1; attempt <= attempts; attempt++) {
                try {
                    return await requestFn();
                }
                catch (error) {
                    lastError = error;
                    if (retryEnabled && attempt < attempts && isRetryableError(error)) {
                        // Exponential backoff: 2s, 4s, 8s
                        const waitMs = Math.min(2000 * Math.pow(2, attempt - 1), 16000);
                        await new Promise((resolve) => setTimeout(resolve, waitMs));
                        continue;
                    }
                    throw error;
                }
            }
            throw lastError;
        };
        // ─── Helper: build query string from qs object ───
        const buildQueryString = (qs) => {
            const parts = [];
            for (const [key, value] of Object.entries(qs)) {
                if (value !== undefined && value !== null && value !== '') {
                    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
                }
            }
            return parts.join('&');
        };
        // ══════════════════════════════════════════════════
        // SEQUENTIAL PROCESSING: Items are processed one
        // at a time with a configurable delay between each.
        // This prevents flooding Meta's API when multiple
        // input items are connected (e.g., 31 date ranges).
        // ══════════════════════════════════════════════════
        for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
            try {
                const credentials = await this.getCredentials('metaGraphApi');
                const hostUrl = this.getNodeParameter('hostUrl', itemIndex);
                const httpRequestMethod = this.getNodeParameter('httpRequestMethod', itemIndex);
                const graphApiVersion = this.getNodeParameter('graphApiVersion', itemIndex);
                const node = this.getNodeParameter('node', itemIndex);
                const edge = this.getNodeParameter('edge', itemIndex);
                const options = this.getNodeParameter('options', itemIndex, {});
                // ─── Options with defaults ───────────────────
                const requestTimeout = options.requestTimeout || 30000;
                const retryOnConnectionError = options.retryOnConnectionError !== undefined
                    ? options.retryOnConnectionError
                    : true;
                const MAX_RETRIES = 3;
                const skipSsl = this.getNodeParameter('allowUnauthorizedCerts', itemIndex, false);
                const itemInterval = (_a = options.itemInterval) !== null && _a !== void 0 ? _a : 500;
                // ─── Wait between items (sequential processing) ──
                if (itemIndex > 0 && itemInterval > 0) {
                    await new Promise((resolve) => setTimeout(resolve, itemInterval));
                }
                // ─── Build base URL ─────────────────────────
                let baseUrl = `https://${hostUrl}/${graphApiVersion}/${node}`;
                if (edge) {
                    baseUrl = `${baseUrl}/${edge}`;
                }
                // ─── Build query string params ──────────────
                const qs = {
                    access_token: credentials.accessToken,
                };
                if (httpRequestMethod === 'GET') {
                    const fields = this.getNodeParameter('fields', itemIndex, '');
                    if (fields) {
                        qs.fields = fields;
                    }
                    const limit = this.getNodeParameter('limit', itemIndex, 25);
                    if (limit) {
                        qs.limit = limit;
                    }
                }
                // Extra query params from UI
                if ((_b = options.queryParameters) === null || _b === void 0 ? void 0 : _b.parameter) {
                    for (const param of options.queryParameters.parameter) {
                        qs[param.name] = param.value;
                    }
                }
                // Extra query params from JSON
                if (options.queryParametersJson) {
                    try {
                        const jsonParams = JSON.parse(options.queryParametersJson);
                        Object.assign(qs, jsonParams);
                    }
                    catch {
                        // ignore parse errors
                    }
                }
                // ─── Build full URL with query string ────────
                const fullUrl = `${baseUrl}?${buildQueryString(qs)}`;
                // ─── Handle binary upload (POST with file) ───
                const sendBinaryData = this.getNodeParameter('sendBinaryData', itemIndex, false);
                let binaryFormData = undefined;
                if (sendBinaryData) {
                    const binaryPropertyNameFull = this.getNodeParameter('binaryPropertyName', itemIndex);
                    let propertyName = 'file';
                    let binaryPropertyName = binaryPropertyNameFull;
                    if (binaryPropertyNameFull.includes(':')) {
                        const parts = binaryPropertyNameFull.split(':');
                        propertyName = parts[0];
                        binaryPropertyName = parts[1];
                    }
                    const binaryData = this.helpers.assertBinaryData(itemIndex, binaryPropertyName);
                    const binaryDataBuffer = await this.helpers.getBinaryDataBuffer(itemIndex, binaryPropertyName);
                    binaryFormData = {
                        [propertyName]: {
                            value: binaryDataBuffer,
                            options: {
                                filename: binaryData.fileName,
                                contentType: binaryData.mimeType,
                            },
                        },
                    };
                }
                // ─── Execute request (with auto-pagination) ─
                const autoPagination = httpRequestMethod === 'GET'
                    ? this.getNodeParameter('autoPagination', itemIndex, true)
                    : false;
                const maxPages = autoPagination
                    ? this.getNodeParameter('maxPages', itemIndex, 0)
                    : 1;
                const batchInterval = options.batchInterval || 0;
                const outputMode = options.outputMode || 'individual';
                const includeInputData = options.includeInputData || false;
                // ─── Capture input item data for merging ────
                const inputItemData = includeInputData ? items[itemIndex].json : null;
                let allData = [];
                let pageCount = 0;
                let currentUrl = fullUrl;
                let hasNextPage = true;
                while (hasNextPage) {
                    pageCount++;
                    let response;
                    try {
                        // ══════════════════════════════════════════
                        // Using httpRequest (axios-based) instead of
                        // the deprecated request() method. Same
                        // engine as the built-in HTTP Request node.
                        // ══════════════════════════════════════════
                        const httpRequestOptions = {
                            method: httpRequestMethod,
                            url: currentUrl,
                            headers: {
                                accept: 'application/json,text/*;q=0.99',
                            },
                            timeout: requestTimeout,
                            skipSslCertificateValidation: skipSsl,
                            returnFullResponse: false,
                        };
                        // Add binary form data only on first page POST
                        if (sendBinaryData && pageCount === 1 && binaryFormData) {
                            httpRequestOptions.body = binaryFormData;
                            httpRequestOptions.headers['content-type'] = 'multipart/form-data';
                        }
                        response = await executeWithRetry(() => this.helpers.httpRequest(httpRequestOptions), MAX_RETRIES, retryOnConnectionError);
                    }
                    catch (error) {
                        if (!this.continueOnFail()) {
                            throw new n8n_workflow_1.NodeApiError(this.getNode(), error);
                        }
                        let errorItem;
                        if ((_d = (_c = error.response) === null || _c === void 0 ? void 0 : _c.data) === null || _d === void 0 ? void 0 : _d.error) {
                            errorItem = {
                                statusCode: error.response.status || error.httpCode,
                                ...error.response.data.error,
                            };
                        }
                        else if (error.description) {
                            try {
                                const parsed = JSON.parse(error.description);
                                errorItem = {
                                    statusCode: error.httpCode,
                                    ...(parsed.error || parsed),
                                };
                            }
                            catch {
                                errorItem = {
                                    message: error.message,
                                    code: error.code || 'UNKNOWN',
                                    page: pageCount,
                                };
                            }
                        }
                        else {
                            errorItem = {
                                message: error.message,
                                code: error.code || 'UNKNOWN',
                                page: pageCount,
                                itemIndex,
                                collectedSoFar: allData.length,
                            };
                        }
                        // Partial data recovery
                        if (allData.length > 0) {
                            for (const record of allData) {
                                const outputJson = inputItemData
                                    ? { _inputData: inputItemData, ...record }
                                    : record;
                                returnItems.push({ json: outputJson });
                            }
                            returnItems.push({
                                json: {
                                    _error: true,
                                    _errorDetails: errorItem,
                                    _message: `Error on page ${pageCount} of item ${itemIndex}. ${allData.length} records collected before error.`,
                                },
                            });
                        }
                        else {
                            returnItems.push({ json: { ...errorItem } });
                        }
                        break;
                    }
                    // ─── Parse response if string ───────────
                    if (typeof response === 'string') {
                        try {
                            response = JSON.parse(response);
                        }
                        catch {
                            if (!this.continueOnFail()) {
                                throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'Response body is not valid JSON.', { itemIndex });
                            }
                            returnItems.push({ json: { message: response } });
                            break;
                        }
                    }
                    // ─── Collect data ───────────────────────
                    if (outputMode === 'raw' || !autoPagination) {
                        const outputJson = inputItemData
                            ? { _inputData: inputItemData, ...response }
                            : response;
                        returnItems.push({ json: outputJson });
                        break;
                    }
                    // Individual mode: extract data array
                    if (Array.isArray(response.data)) {
                        allData = allData.concat(response.data);
                    }
                    else if (response.data !== undefined) {
                        allData.push(response.data);
                    }
                    else {
                        // No data field — response IS the data
                        const outputJson = inputItemData
                            ? { _inputData: inputItemData, ...response }
                            : response;
                        returnItems.push({ json: outputJson });
                        break;
                    }
                    // ─── Check for next page ────────────────
                    const nextUrl = (_e = response === null || response === void 0 ? void 0 : response.paging) === null || _e === void 0 ? void 0 : _e.next;
                    if (!nextUrl || !autoPagination) {
                        hasNextPage = false;
                    }
                    else if (maxPages > 0 && pageCount >= maxPages) {
                        hasNextPage = false;
                    }
                    else {
                        // Follow the "next" URL directly
                        currentUrl = nextUrl;
                        // Wait between pages if configured
                        if (batchInterval > 0) {
                            await new Promise((resolve) => setTimeout(resolve, batchInterval));
                        }
                    }
                }
                // ─── Push individual items ──────────────────
                if (outputMode === 'individual' && autoPagination && allData.length > 0) {
                    for (const record of allData) {
                        const outputJson = inputItemData
                            ? { _inputData: inputItemData, ...record }
                            : record;
                        returnItems.push({ json: outputJson });
                    }
                }
            }
            catch (error) {
                if (!this.continueOnFail()) {
                    throw error;
                }
                returnItems.push({ json: { error: error.message } });
            }
        }
        return [returnItems];
    }
}
exports.MetaGraphApi = MetaGraphApi;
//# sourceMappingURL=MetaGraphApi.node.js.map