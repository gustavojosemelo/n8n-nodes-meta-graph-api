"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetaGraphApi = void 0;
class MetaGraphApi {
    constructor() {
        this.name = 'metaGraphApi';
        this.displayName = 'Meta Graph API';
        this.documentationUrl = 'https://developers.facebook.com/docs/graph-api/';
        this.properties = [
            {
                displayName: 'Access Token',
                name: 'accessToken',
                type: 'string',
                typeOptions: { password: true },
                default: '',
                description: 'The access token for authenticating with the Meta Graph API',
            },
        ];
        this.authenticate = {
            type: 'generic',
            properties: {
                qs: {
                    access_token: '={{$credentials.accessToken}}',
                },
            },
        };
        this.test = {
            request: {
                baseURL: 'https://graph.facebook.com/v24.0',
                url: '/me',
            },
        };
    }
}
exports.MetaGraphApi = MetaGraphApi;
//# sourceMappingURL=MetaGraphApi.credentials.js.map