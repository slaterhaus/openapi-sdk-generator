import * as fs from 'fs';
import * as YAML from 'yaml';
import { OpenAPISpec } from './types';

export class OpenAPIParser {
  static parse(filePath: string): OpenAPISpec {
    const content = fs.readFileSync(filePath, 'utf-8');

    if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
      return YAML.parse(content) as OpenAPISpec;
    } else if (filePath.endsWith('.json')) {
      return JSON.parse(content) as OpenAPISpec;
    } else {
      throw new Error('Unsupported file format. Please use .json, .yaml, or .yml files.');
    }
  }

  static resolveRef(spec: OpenAPISpec, ref: string): any {
    const parts = ref.replace('#/', '').split('/');
    let current: any = spec;

    for (const part of parts) {
      if (current[part] === undefined) {
        throw new Error(`Reference ${ref} not found`);
      }
      current = current[part];
    }

    return current;
  }
}