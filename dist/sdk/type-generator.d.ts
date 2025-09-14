import { OpenAPISpec } from '../core/types';
export declare class TypeGenerator {
    private spec;
    private generatedTypes;
    constructor(spec: OpenAPISpec);
    generateTypes(): string;
    private generateInterface;
    private generateObjectInterface;
    private generateEnumType;
    private generateUnionType;
    private schemaToTypeScript;
}
//# sourceMappingURL=type-generator.d.ts.map