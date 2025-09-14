import { OpenAPISpec, Schema, Operation, Parameter } from '../core/types';
import { OpenAPIParser } from '../core/parser';
import {
  GraphQLSchema,
  GraphQLType,
  GraphQLField,
  GraphQLQuery,
  GraphQLMutation,
  GraphQLInput,
  GraphQLInputField,
  GraphQLEnum,
  GraphQLArgument
} from './graphql-types';

export class GraphQLGenerator {
  private spec: OpenAPISpec;
  private generatedTypes = new Set<string>();

  constructor(spec: OpenAPISpec) {
    this.spec = spec;
  }

  generateSchema(): GraphQLSchema {
    const types: GraphQLType[] = [];
    const inputs: GraphQLInput[] = [];
    const enums: GraphQLEnum[] = [];
    const queries: GraphQLQuery[] = [];
    const mutations: GraphQLMutation[] = [];

    if (this.spec.components?.schemas) {
      for (const [name, schema] of Object.entries(this.spec.components.schemas)) {
        if (schema.enum) {
          enums.push(this.generateEnum(name, schema));
        } else if (schema.type === 'object' || schema.properties) {
          types.push(this.generateType(name, schema));
          inputs.push(this.generateInput(`${name}Input`, schema));
        }
      }
    }

    for (const [path, pathItem] of Object.entries(this.spec.paths)) {
      for (const [method, operation] of Object.entries(pathItem)) {
        if (operation && typeof operation === 'object' && 'responses' in operation) {
          const op = operation as Operation;

          if (method === 'get') {
            queries.push(this.generateQuery(method, path, op));
          } else if (['post', 'put', 'patch', 'delete'].includes(method)) {
            mutations.push(this.generateMutation(method, path, op));
          }
        }
      }
    }

    return {
      types,
      queries,
      mutations,
      inputs,
      enums
    };
  }

  private generateType(name: string, schema: Schema): GraphQLType {
    const fields: GraphQLField[] = [];

    if (schema.properties) {
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        const field = this.generateField(propName, propSchema, schema.required?.includes(propName));
        fields.push(field);
      }
    }

    return {
      name: this.toGraphQLTypeName(name),
      description: schema.description || `Type representing ${name}`,
      fields
    };
  }

  private generateInput(name: string, schema: Schema): GraphQLInput {
    const fields: GraphQLInputField[] = [];

    if (schema.properties) {
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        const field = this.generateInputField(propName, propSchema, schema.required?.includes(propName));
        fields.push(field);
      }
    }

    return {
      name: this.toGraphQLTypeName(name),
      description: schema.description || `Input type for ${name}`,
      fields
    };
  }

  private generateEnum(name: string, schema: Schema): GraphQLEnum {
    const values = (schema.enum || []).map((value, index) => ({
      name: String(value).toUpperCase().replace(/[^A-Z0-9_]/g, '_'),
      value: String(value),
      description: `Enum value: ${value}`
    }));

    return {
      name: this.toGraphQLTypeName(name),
      description: schema.description || `Enum for ${name}`,
      values
    };
  }

  private generateField(name: string, schema: Schema, required?: boolean): GraphQLField {
    return {
      name: this.toGraphQLFieldName(name),
      type: this.schemaToGraphQLType(schema),
      description: schema.description,
      nullable: !required,
      list: schema.type === 'array'
    };
  }

  private generateInputField(name: string, schema: Schema, required?: boolean): GraphQLInputField {
    return {
      name: this.toGraphQLFieldName(name),
      type: this.schemaToGraphQLInputType(schema),
      description: schema.description,
      nullable: !required,
      list: schema.type === 'array'
    };
  }

  private generateQuery(method: string, path: string, operation: Operation): GraphQLQuery {
    const queryName = this.generateOperationName(method, path, operation);
    const returnType = this.getReturnType(operation);
    const args = this.generateArguments(operation);

    return {
      name: queryName,
      description: operation.summary || operation.description,
      returnType,
      args,
      resolver: {
        method: method.toUpperCase(),
        path,
        operation: operation.operationId || queryName
      }
    };
  }

  private generateMutation(method: string, path: string, operation: Operation): GraphQLMutation {
    const mutationName = this.generateOperationName(method, path, operation);
    const returnType = this.getReturnType(operation);
    const args = this.generateArguments(operation);

    if (operation.requestBody) {
      const inputType = this.getInputTypeFromRequestBody(operation);
      if (inputType) {
        args.push({
          name: 'input',
          type: inputType,
          description: 'Input data for the mutation',
          nullable: !operation.requestBody.required
        });
      }
    }

    return {
      name: mutationName,
      description: operation.summary || operation.description,
      returnType,
      args,
      resolver: {
        method: method.toUpperCase(),
        path,
        operation: operation.operationId || mutationName
      }
    };
  }

  private generateArguments(operation: Operation): GraphQLArgument[] {
    const args: GraphQLArgument[] = [];

    if (operation.parameters) {
      for (const param of operation.parameters) {
        args.push({
          name: this.toGraphQLFieldName(param.name),
          type: this.schemaToGraphQLType(param.schema),
          description: param.description,
          nullable: !param.required
        });
      }
    }

    return args;
  }

  private generateOperationName(method: string, path: string, operation: Operation): string {
    if (operation.operationId) {
      return this.toGraphQLFieldName(operation.operationId);
    }

    const pathSegments = path.split('/').filter(segment => segment && !segment.startsWith('{'));
    const lastSegment = pathSegments[pathSegments.length - 1] || 'resource';

    const prefix = method === 'get' ? (path.includes('{') ? 'get' : 'list') :
                   method === 'post' ? 'create' :
                   method === 'put' ? 'update' :
                   method === 'patch' ? 'update' :
                   method === 'delete' ? 'delete' : method;

    return `${prefix}${this.toPascalCase(lastSegment)}`;
  }

  private getReturnType(operation: Operation): string {
    const successResponse = operation.responses['200'] || operation.responses['201'] || operation.responses['204'];

    if (!successResponse?.content) {
      return 'Boolean';
    }

    const jsonContent = successResponse.content['application/json'];
    if (!jsonContent?.schema) {
      return 'String';
    }

    return this.schemaToGraphQLType(jsonContent.schema);
  }

  private getInputTypeFromRequestBody(operation: Operation): string | null {
    if (!operation.requestBody?.content) return null;

    const jsonContent = operation.requestBody.content['application/json'];
    if (!jsonContent?.schema) return null;

    return this.schemaToGraphQLInputType(jsonContent.schema);
  }

  private schemaToGraphQLType(schema: Schema): string {
    if (schema.$ref) {
      const refName = schema.$ref.split('/').pop();
      return this.toGraphQLTypeName(refName!);
    }

    switch (schema.type) {
      case 'string':
        if (schema.enum) {
          return this.toGraphQLTypeName('String'); // Will be handled as enum separately
        }
        if (schema.format === 'date' || schema.format === 'date-time') return 'String'; // Could be DateTime scalar
        return 'String';

      case 'integer':
        return 'Int';

      case 'number':
        return 'Float';

      case 'boolean':
        return 'Boolean';

      case 'array':
        const itemType = schema.items ? this.schemaToGraphQLType(schema.items) : 'String';
        return `[${itemType}]`;

      case 'object':
        return 'JSON'; // Generic JSON scalar or could generate inline type

      default:
        return 'String';
    }
  }

  private schemaToGraphQLInputType(schema: Schema): string {
    if (schema.$ref) {
      const refName = schema.$ref.split('/').pop();
      return this.toGraphQLTypeName(`${refName}Input`);
    }

    const baseType = this.schemaToGraphQLType(schema);

    if (baseType.startsWith('[') && baseType.endsWith(']')) {
      const innerType = baseType.slice(1, -1);
      return `[${innerType === 'JSON' ? 'JSONInput' : innerType}Input]`;
    }

    if (baseType === 'JSON') return 'JSONInput';

    return baseType;
  }

  private toGraphQLTypeName(name: string): string {
    return this.toPascalCase(name.replace(/[^a-zA-Z0-9]/g, ''));
  }

  private toGraphQLFieldName(name: string): string {
    return this.toCamelCase(name.replace(/[^a-zA-Z0-9]/g, ''));
  }

  private toPascalCase(str: string): string {
    return str.charAt(0).toUpperCase() + this.toCamelCase(str.slice(1));
  }

  private toCamelCase(str: string): string {
    return str.replace(/[-_\s]+(.)?/g, (_, char) => char ? char.toUpperCase() : '');
  }

  generateGraphQLSchema(): string {
    const schema = this.generateSchema();
    let output = '# Generated GraphQL Schema from OpenAPI specification\n\n';

    output += '# Scalar types\n';
    output += 'scalar JSON\n';
    output += 'scalar JSONInput\n';
    output += 'scalar DateTime\n\n';

    if (schema.enums.length > 0) {
      output += '# Enums\n';
      for (const enumType of schema.enums) {
        output += this.renderEnum(enumType);
        output += '\n';
      }
    }

    if (schema.inputs.length > 0) {
      output += '# Input Types\n';
      for (const input of schema.inputs) {
        output += this.renderInput(input);
        output += '\n';
      }
    }

    if (schema.types.length > 0) {
      output += '# Object Types\n';
      for (const type of schema.types) {
        output += this.renderType(type);
        output += '\n';
      }
    }

    if (schema.queries.length > 0) {
      output += '# Query Type\n';
      output += 'type Query {\n';
      for (const query of schema.queries) {
        output += this.renderOperation(query);
      }
      output += '}\n\n';
    }

    if (schema.mutations.length > 0) {
      output += '# Mutation Type\n';
      output += 'type Mutation {\n';
      for (const mutation of schema.mutations) {
        output += this.renderOperation(mutation);
      }
      output += '}\n\n';
    }

    return output;
  }

  private renderEnum(enumType: GraphQLEnum): string {
    let output = '';
    if (enumType.description) {
      output += `"${enumType.description}"\n`;
    }
    output += `enum ${enumType.name} {\n`;
    for (const value of enumType.values) {
      if (value.description) {
        output += `  "${value.description}"\n`;
      }
      output += `  ${value.name}\n`;
    }
    output += '}\n';
    return output;
  }

  private renderInput(input: GraphQLInput): string {
    let output = '';
    if (input.description) {
      output += `"${input.description}"\n`;
    }
    output += `input ${input.name} {\n`;
    for (const field of input.fields) {
      if (field.description) {
        output += `  "${field.description}"\n`;
      }
      const nullable = field.nullable ? '' : '!';
      output += `  ${field.name}: ${field.type}${nullable}\n`;
    }
    output += '}\n';
    return output;
  }

  private renderType(type: GraphQLType): string {
    let output = '';
    if (type.description) {
      output += `"${type.description}"\n`;
    }
    output += `type ${type.name} {\n`;
    for (const field of type.fields) {
      if (field.description) {
        output += `  "${field.description}"\n`;
      }
      const nullable = field.nullable ? '' : '!';
      output += `  ${field.name}: ${field.type}${nullable}\n`;
    }
    output += '}\n';
    return output;
  }

  private renderOperation(operation: GraphQLQuery | GraphQLMutation): string {
    let output = '';
    if (operation.description) {
      output += `  "${operation.description}"\n`;
    }

    const args = operation.args.length > 0
      ? `(${operation.args.map(arg => {
          const nullable = arg.nullable ? '' : '!';
          return `${arg.name}: ${arg.type}${nullable}`;
        }).join(', ')})`
      : '';

    output += `  ${operation.name}${args}: ${operation.returnType}\n`;
    return output;
  }
}