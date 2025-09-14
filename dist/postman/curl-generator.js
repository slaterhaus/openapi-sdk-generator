"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurlGenerator = void 0;
class CurlGenerator {
    constructor(spec) {
        this.spec = spec;
    }
    generateCurls() {
        const baseUrl = this.spec.servers?.[0]?.url || 'https://api.example.com';
        const curls = [];
        for (const [path, pathItem] of Object.entries(this.spec.paths)) {
            for (const [method, operation] of Object.entries(pathItem)) {
                if (operation && typeof operation === 'object' && 'responses' in operation) {
                    const curl = this.generateCurlCommand(method, path, operation, baseUrl);
                    curls.push(curl);
                }
            }
        }
        return curls;
    }
    generateCurlCommand(method, path, operation, baseUrl) {
        const pathParams = operation.parameters?.filter(p => p.in === 'path') || [];
        const queryParams = operation.parameters?.filter(p => p.in === 'query') || [];
        const headerParams = operation.parameters?.filter(p => p.in === 'header') || [];
        let processedPath = path;
        pathParams.forEach(param => {
            const exampleValue = this.getExampleValue(param.schema);
            processedPath = processedPath.replace(`{${param.name}}`, exampleValue);
        });
        let url = `${baseUrl}${processedPath}`;
        const queryString = queryParams
            .filter(p => p.required || Math.random() > 0.5) // Include required params and some optional ones
            .map(param => `${param.name}=${encodeURIComponent(this.getExampleValue(param.schema))}`)
            .join('&');
        if (queryString) {
            url += `?${queryString}`;
        }
        let curlParts = [`curl -X ${method.toUpperCase()}`];
        const headers = [];
        headerParams.forEach(param => {
            headers.push(`${param.name}: ${this.getExampleValue(param.schema)}`);
        });
        if (operation.requestBody) {
            const contentTypes = Object.keys(operation.requestBody.content);
            if (contentTypes.includes('application/json')) {
                headers.push('Content-Type: application/json');
                const schema = operation.requestBody.content['application/json'].schema;
                const exampleBody = this.generateExampleFromSchema(schema);
                const bodyJson = JSON.stringify(exampleBody);
                curlParts.push(`--data '${bodyJson}'`);
            }
        }
        headers.forEach(header => {
            curlParts.push(`-H "${header}"`);
        });
        curlParts.push(`"${url}"`);
        const endpoint = `${method.toUpperCase()} ${path}`;
        const description = operation.summary || operation.description;
        return {
            endpoint,
            method: method.toUpperCase(),
            curl: curlParts.join(' \\\n  '),
            description
        };
    }
    generateExampleFromSchema(schema) {
        if (schema.$ref) {
            const refName = schema.$ref.split('/').pop();
            const resolvedSchema = this.spec.components?.schemas?.[refName];
            if (resolvedSchema) {
                return this.generateExampleFromSchema(resolvedSchema);
            }
            return {};
        }
        switch (schema.type) {
            case 'string':
                if (schema.enum)
                    return schema.enum[0];
                if (schema.format === 'email')
                    return 'user@example.com';
                if (schema.format === 'date')
                    return '2023-12-01';
                if (schema.format === 'date-time')
                    return '2023-12-01T10:00:00Z';
                if (schema.format === 'uuid')
                    return '123e4567-e89b-12d3-a456-426614174000';
                return schema.example || 'example';
            case 'number':
                return schema.example || 42;
            case 'integer':
                return schema.example || 1;
            case 'boolean':
                return schema.example !== undefined ? schema.example : true;
            case 'array':
                if (schema.items) {
                    return [this.generateExampleFromSchema(schema.items)];
                }
                return [];
            case 'object':
                const obj = {};
                if (schema.properties) {
                    for (const [propName, propSchema] of Object.entries(schema.properties)) {
                        const isRequired = schema.required?.includes(propName);
                        if (isRequired || Math.random() > 0.3) { // Include required and some optional properties
                            obj[propName] = this.generateExampleFromSchema(propSchema);
                        }
                    }
                }
                return obj;
            default:
                return null;
        }
    }
    getExampleValue(schema) {
        const example = this.generateExampleFromSchema(schema);
        if (typeof example === 'string')
            return example;
        if (typeof example === 'number')
            return String(example);
        if (typeof example === 'boolean')
            return String(example);
        return 'example';
    }
    generateCurlsAsText() {
        const curls = this.generateCurls();
        let output = `# Generated cURL commands for ${this.spec.info.title}\n`;
        output += `# Generated from OpenAPI ${this.spec.openapi} specification\n\n`;
        curls.forEach((curl, index) => {
            output += `# ${curl.endpoint}`;
            if (curl.description) {
                output += ` - ${curl.description}`;
            }
            output += '\n';
            output += curl.curl;
            output += '\n\n';
        });
        return output;
    }
}
exports.CurlGenerator = CurlGenerator;
//# sourceMappingURL=curl-generator.js.map