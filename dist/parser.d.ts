import { OpenAPISpec } from './types';
export declare class OpenAPIParser {
    static parse(filePath: string): OpenAPISpec;
    static resolveRef(spec: OpenAPISpec, ref: string): any;
}
//# sourceMappingURL=parser.d.ts.map