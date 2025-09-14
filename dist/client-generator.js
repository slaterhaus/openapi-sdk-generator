"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClientGenerator = void 0;
class ClientGenerator {
    constructor(spec) {
        this.spec = spec;
    }
    generateClient() {
        const className = this.getClassName();
        let output = `// Generated API Client from OpenAPI schema\n\n`;
        output += this.generateClientClass(className);
        return output;
    }
    getClassName() {
        return this.spec.info.title
            .replace(/[^a-zA-Z0-9]/g, '')
            .replace(/^[a-z]/, match => match.toUpperCase()) + 'Client';
    }
    generateClientClass(className) {
        const baseUrl = this.spec.servers?.[0]?.url || '';
        let output = `export class ${className} {\n`;
        output += `  private baseUrl: string;\n\n`;
        output += `  constructor(baseUrl?: string) {\n`;
        output += `    this.baseUrl = baseUrl || '${baseUrl}';\n`;
        output += `  }\n\n`;
        output += this.generateHttpMethods();
        for (const [path, pathItem] of Object.entries(this.spec.paths)) {
            for (const [method, operation] of Object.entries(pathItem)) {
                if (operation && typeof operation === 'object' && 'responses' in operation) {
                    output += this.generateMethodForOperation(method, path, operation);
                }
            }
        }
        output += '}\n';
        return output;
    }
    generateHttpMethods() {
        return `  private async request<T>(
    method: string,
    path: string,
    data?: any,
    params?: Record<string, any>
  ): Promise<T> {
    const url = new URL(path, this.baseUrl);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    const config: RequestInit = {
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data && method !== 'GET') {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(url.toString(), config);

    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }

    return response.text() as any;
  }

`;
    }
    generateMethodForOperation(method, path, operation) {
        const methodName = this.getMethodName(method, path, operation);
        const pathParams = this.extractPathParameters(path, operation);
        const queryParams = this.extractQueryParameters(operation);
        const bodyParam = this.extractBodyParameter(operation);
        let params = [];
        let paramTypes = [];
        pathParams.forEach(param => {
            params.push(`${param.name}: ${this.getParameterType(param)}`);
            paramTypes.push(param.name);
        });
        if (bodyParam) {
            params.push(`data: ${bodyParam}`);
        }
        if (queryParams.length > 0) {
            const queryParamType = `{${queryParams.map(p => `${p.name}${p.required ? '' : '?'}: ${this.getParameterType(p)}`).join('; ')}}`;
            params.push(`params?: ${queryParamType}`);
        }
        const returnType = this.getReturnType(operation);
        let output = `  async ${methodName}(${params.join(', ')}): Promise<${returnType}> {\n`;
        let processedPath = path;
        pathParams.forEach(param => {
            processedPath = processedPath.replace(`{${param.name}}`, `\${${param.name}}`);
        });
        output += `    return this.request<${returnType}>(\n`;
        output += `      '${method.toUpperCase()}',\n`;
        output += `      \`${processedPath}\`,\n`;
        output += bodyParam ? `      data,\n` : `      undefined,\n`;
        output += queryParams.length > 0 ? `      params\n` : `      undefined\n`;
        output += `    );\n`;
        output += `  }\n\n`;
        return output;
    }
    getMethodName(method, path, operation) {
        if (operation.operationId) {
            return operation.operationId;
        }
        const cleanPath = path.replace(/[{}]/g, '').replace(/[^a-zA-Z0-9]/g, '_');
        return `${method}${cleanPath.split('_').map(part => part.charAt(0).toUpperCase() + part.slice(1)).join('')}`;
    }
    extractPathParameters(path, operation) {
        const pathParams = operation.parameters?.filter(p => p.in === 'path') || [];
        return pathParams;
    }
    extractQueryParameters(operation) {
        const queryParams = operation.parameters?.filter(p => p.in === 'query') || [];
        return queryParams;
    }
    extractBodyParameter(operation) {
        if (!operation.requestBody)
            return null;
        const content = operation.requestBody.content;
        const jsonContent = content['application/json'];
        if (jsonContent?.schema) {
            return this.schemaToType(jsonContent.schema);
        }
        return 'any';
    }
    getParameterType(param) {
        return this.schemaToType(param.schema);
    }
    schemaToType(schema) {
        if (schema.$ref) {
            return schema.$ref.split('/').pop() || 'unknown';
        }
        switch (schema.type) {
            case 'string': return 'string';
            case 'number':
            case 'integer': return 'number';
            case 'boolean': return 'boolean';
            case 'array': return `${this.schemaToType(schema.items)}[]`;
            default: return 'any';
        }
    }
    getReturnType(operation) {
        const successResponse = operation.responses['200'] || operation.responses['201'];
        if (successResponse?.content) {
            const jsonContent = successResponse.content['application/json'];
            if (jsonContent?.schema) {
                return this.schemaToType(jsonContent.schema);
            }
        }
        return 'any';
    }
}
exports.ClientGenerator = ClientGenerator;
//# sourceMappingURL=client-generator.js.map