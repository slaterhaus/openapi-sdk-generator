import {OpenAPISpec, Operation, Parameter} from '../core/types';

export class ClientGenerator {
  private spec: OpenAPISpec;

  constructor(spec: OpenAPISpec) {
    this.spec = spec;
  }

  generateClient(): string {
    const className = this.getClassName();
    let output = `// Generated API Client from OpenAPI schema\n\n`;

    output += this.generateClientClass(className);
    return output;
  }

  private getClassName(): string {
    return this.spec.info.title
      .replace(/[^a-zA-Z0-9]/g, '')
      .replace(/^[a-z]/, match => match.toUpperCase()) + 'Client';
  }

  private generateClientClass(className: string): string {
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
          output += this.generateMethodForOperation(method, path, operation as Operation);
        }
      }
    }

    output += '}\n';
    return output;
  }

  private generateHttpMethods(): string {
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

  private generateMethodForOperation(method: string, path: string, operation: Operation): string {
    const methodName = this.getMethodName(method, path, operation);
    const pathParams = this.extractPathParameters(path, operation);
    const queryParams = this.extractQueryParameters(operation);
    const bodyParam = this.extractBodyParameter(operation);

    let params: string[] = [];
    let paramTypes: string[] = [];

    pathParams.forEach(param => {
      params.push(`${param.name}: ${this.getParameterType(param)}`);
      paramTypes.push(param.name);
    });

    if (bodyParam) {
      params.push(`data: ${bodyParam}`);
    }

    if (queryParams.length > 0) {
      const queryParamType = `{${queryParams.map(p =>
        `${p.name}${p.required ? '' : '?'}: ${this.getParameterType(p)}`
      ).join('; ')}}`;
      params.push(`params?: ${queryParamType}`);
    }

    const returnType = this.getReturnType(operation);
    let output = ` \/\/ ${operation.summary || operation.description}\n\n`;
    output += `  async ${methodName}(${params.join(', ')}): Promise<${returnType}> {\n`;

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

  private getMethodName(method: string, path: string, operation: Operation): string {
    if (operation.operationId) {
      return operation.operationId;
    }

    const cleanPath = path.replace(/[{}]/g, '').replace(/[^a-zA-Z0-9]/g, '_');
    return `${method}${cleanPath.split('_').map(part =>
      part.charAt(0).toUpperCase() + part.slice(1)
    ).join('')}`;
  }

  private extractPathParameters(path: string, operation: Operation): Parameter[] {
    return operation.parameters?.filter(p => p.in === 'path') || [];
  }

  private extractQueryParameters(operation: Operation): Parameter[] {
    return operation.parameters?.filter(p => p.in === 'query') || [];
  }

  private extractBodyParameter(operation: Operation): string | null {
    if (!operation.requestBody) return null;

    const content = operation.requestBody.content;
    const jsonContent = content['application/json'];

    if (jsonContent?.schema) {
      return this.schemaToType(jsonContent.schema);
    }

    return 'any';
  }

  private getParameterType(param: Parameter): string {
    return this.schemaToType(param.schema);
  }

  private schemaToType(schema: any): string {
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

  private getReturnType(operation: Operation): string {
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