import { OpenAPISpec, Operation, Parameter } from '../core/types';
import { PostmanCollection, PostmanItem, PostmanRequest, PostmanUrl, PostmanQuery, PostmanHeader, PostmanRequestBody, PostmanVariable } from './postman-types';

export class PostmanGenerator {
  private spec: OpenAPISpec;

  constructor(spec: OpenAPISpec) {
    this.spec = spec;
  }

  generateCollection(): PostmanCollection {
    const baseUrl = this.spec.servers?.[0]?.url || 'https://api.example.com';

    const collection: PostmanCollection = {
      info: {
        name: this.spec.info.title,
        description: this.spec.info.description,
        version: this.spec.info.version,
        schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json'
      },
      item: [],
      variable: [
        {
          key: 'baseUrl',
          value: baseUrl,
          type: 'string',
          description: 'Base URL for the API'
        }
      ]
    };

    for (const [path, pathItem] of Object.entries(this.spec.paths)) {
      for (const [method, operation] of Object.entries(pathItem)) {
        if (operation && typeof operation === 'object' && 'responses' in operation) {
          const item = this.generatePostmanItem(method, path, operation as Operation);
          collection.item.push(item);
        }
      }
    }

    return collection;
  }

  private generatePostmanItem(method: string, path: string, operation: Operation): PostmanItem {
    const name = operation.operationId || `${method.toUpperCase()} ${path}`;
    const description = operation.summary || operation.description;

    const request = this.generatePostmanRequest(method, path, operation);

    return {
      name,
      request,
      response: []
    };
  }

  private generatePostmanRequest(method: string, path: string, operation: Operation): PostmanRequest {
    const pathParams = operation.parameters?.filter(p => p.in === 'path') || [];
    const queryParams = operation.parameters?.filter(p => p.in === 'query') || [];
    const headerParams = operation.parameters?.filter(p => p.in === 'header') || [];

    const url = this.generatePostmanUrl(path, pathParams, queryParams);
    const headers = this.generatePostmanHeaders(headerParams, operation);
    const body = this.generatePostmanBody(operation);

    return {
      method: method.toUpperCase(),
      header: headers,
      body,
      url,
      description: operation.summary || operation.description
    };
  }

  private generatePostmanUrl(path: string, pathParams: Parameter[], queryParams: Parameter[]): PostmanUrl {
    let processedPath = path;
    const variables: any[] = [];

    pathParams.forEach(param => {
      processedPath = processedPath.replace(`{${param.name}}`, `:${param.name}`);
      variables.push({
        key: param.name,
        value: this.getExampleValue(param.schema),
        description: param.description
      });
    });

    const queries: PostmanQuery[] = queryParams.map(param => ({
      key: param.name,
      value: this.getExampleValue(param.schema),
      description: param.description,
      disabled: !param.required
    }));

    return {
      raw: `{{baseUrl}}${processedPath}${queries.length > 0 ? '?' + queries.map(q => `${q.key}=${q.value || ''}`).join('&') : ''}`,
      host: ['{{baseUrl}}'],
      path: processedPath.split('/').filter(p => p),
      query: queries.length > 0 ? queries : undefined,
      variable: variables.length > 0 ? variables : undefined
    };
  }

  private generatePostmanHeaders(headerParams: Parameter[], operation: Operation): PostmanHeader[] {
    const headers: PostmanHeader[] = [];

    headerParams.forEach(param => {
      headers.push({
        key: param.name,
        value: this.getExampleValue(param.schema),
        description: param.description
      });
    });

    if (operation.requestBody) {
      const contentTypes = Object.keys(operation.requestBody.content);
      if (contentTypes.includes('application/json')) {
        headers.push({
          key: 'Content-Type',
          value: 'application/json'
        });
      }
    }

    return headers;
  }

  private generatePostmanBody(operation: Operation): PostmanRequestBody | undefined {
    if (!operation.requestBody) return undefined;

    const content = operation.requestBody.content;

    if (content['application/json']) {
      const schema = content['application/json'].schema;
      const exampleBody = this.generateExampleFromSchema(schema);

      return {
        mode: 'raw',
        raw: JSON.stringify(exampleBody, null, 2),
        options: {
          raw: {
            language: 'json'
          }
        }
      };
    }

    return undefined;
  }

  private generateExampleFromSchema(schema: any): any {
    if (schema.$ref) {
      const refName = schema.$ref.split('/').pop();
      const resolvedSchema = this.spec.components?.schemas?.[refName!];
      if (resolvedSchema) {
        return this.generateExampleFromSchema(resolvedSchema);
      }
      return {};
    }

    switch (schema.type) {
      case 'string':
        if (schema.enum) return schema.enum[0];
        if (schema.format === 'email') return 'example@email.com';
        if (schema.format === 'date') return '2023-01-01';
        if (schema.format === 'date-time') return '2023-01-01T00:00:00Z';
        return 'string';

      case 'number':
      case 'integer':
        return 0;

      case 'boolean':
        return true;

      case 'array':
        return schema.items ? [this.generateExampleFromSchema(schema.items)] : [];

      case 'object':
        const obj: any = {};
        if (schema.properties) {
          for (const [propName, propSchema] of Object.entries(schema.properties)) {
            obj[propName] = this.generateExampleFromSchema(propSchema);
          }
        }
        return obj;

      default:
        return null;
    }
  }

  private getExampleValue(schema: any): string {
    const example = this.generateExampleFromSchema(schema);
    if (typeof example === 'string') return example;
    return String(example);
  }
}