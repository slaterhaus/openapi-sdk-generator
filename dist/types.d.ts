export interface OpenAPISpec {
    openapi: string;
    info: {
        title: string;
        version: string;
        description?: string;
    };
    servers?: Array<{
        url: string;
        description?: string;
    }>;
    paths: Record<string, PathItem>;
    components?: {
        schemas?: Record<string, Schema>;
    };
}
export interface PathItem {
    get?: Operation;
    post?: Operation;
    put?: Operation;
    delete?: Operation;
    patch?: Operation;
}
export interface Operation {
    operationId?: string;
    summary?: string;
    description?: string;
    parameters?: Parameter[];
    requestBody?: RequestBody;
    responses: Record<string, Response>;
    tags?: string[];
}
export interface Parameter {
    name: string;
    in: 'query' | 'path' | 'header' | 'cookie';
    required?: boolean;
    schema: Schema;
    description?: string;
}
export interface RequestBody {
    content: Record<string, MediaType>;
    required?: boolean;
    description?: string;
}
export interface Response {
    description: string;
    content?: Record<string, MediaType>;
}
export interface MediaType {
    schema: Schema;
}
export interface Schema {
    type?: 'string' | 'number' | 'integer' | 'boolean' | 'array' | 'object';
    format?: string;
    properties?: Record<string, Schema>;
    items?: Schema;
    required?: string[];
    enum?: any[];
    $ref?: string;
    allOf?: Schema[];
    oneOf?: Schema[];
    anyOf?: Schema[];
    description?: string;
    example?: any;
}
//# sourceMappingURL=types.d.ts.map