import { OpenAPISpec, Schema } from '../core/types';
import { OpenAPIParser } from '../core/parser';

export class TypeGenerator {
  private spec: OpenAPISpec;
  private generatedTypes = new Set<string>();

  constructor(spec: OpenAPISpec) {
    this.spec = spec;
  }

  generateTypes(): string {
    let output = '// Generated TypeScript types from OpenAPI schema\n\n';

    if (this.spec.components?.schemas) {
      for (const [name, schema] of Object.entries(this.spec.components.schemas)) {
        output += this.generateInterface(name, schema);
        output += '\n';
      }
    }

    return output;
  }

  private generateInterface(name: string, schema: Schema): string {
    if (this.generatedTypes.has(name)) {
      return '';
    }

    this.generatedTypes.add(name);

    if (schema.$ref) {
      const resolved = OpenAPIParser.resolveRef(this.spec, schema.$ref);
      return this.generateInterface(name, resolved);
    }

    if (schema.type === 'object' || schema.properties) {
      return this.generateObjectInterface(name, schema);
    }

    if (schema.enum) {
      return this.generateEnumType(name, schema);
    }

    if (schema.oneOf || schema.anyOf) {
      return this.generateUnionType(name, schema);
    }

    return `export type ${name} = ${this.schemaToTypeScript(schema)};\n`;
  }

  private generateObjectInterface(name: string, schema: Schema): string {
    let output = `export interface ${name} {\n`;

    if (schema.properties) {
      for (const [propName, propSchema] of Object.entries(schema.properties)) {
        const isRequired = schema.required?.includes(propName) ?? false;
        const optional = isRequired ? '' : '?';
        const type = this.schemaToTypeScript(propSchema);

        output += `  ${propName}${optional}: ${type};\n`;
      }
    }

    output += '}\n';
    return output;
  }

  private generateEnumType(name: string, schema: Schema): string {
    if (!schema.enum) return '';

    const values = schema.enum.map(value =>
      typeof value === 'string' ? `'${value}'` : String(value)
    ).join(' | ');

    return `export type ${name} = ${values};\n`;
  }

  private generateUnionType(name: string, schema: Schema): string {
    const schemas = schema.oneOf || schema.anyOf || [];
    const types = schemas.map(s => this.schemaToTypeScript(s)).join(' | ');
    return `export type ${name} = ${types};\n`;
  }

  private schemaToTypeScript(schema: Schema): string {
    if (schema.$ref) {
      const refName = schema.$ref.split('/').pop();
      return refName || 'unknown';
    }

    switch (schema.type) {
      case 'string':
        return schema.enum ? schema.enum.map(v => `'${v}'`).join(' | ') : 'string';
      case 'number':
      case 'integer':
        return 'number';
      case 'boolean':
        return 'boolean';
      case 'array':
        return schema.items ? `${this.schemaToTypeScript(schema.items)}[]` : 'unknown[]';
      case 'object':
        if (schema.properties) {
          let obj = '{\n';
          for (const [propName, propSchema] of Object.entries(schema.properties)) {
            const isRequired = schema.required?.includes(propName) ?? false;
            const optional = isRequired ? '' : '?';
            obj += `    ${propName}${optional}: ${this.schemaToTypeScript(propSchema)};\n`;
          }
          obj += '  }';
          return obj;
        }
        return 'Record<string, unknown>';
      default:
        return 'unknown';
    }
  }
}