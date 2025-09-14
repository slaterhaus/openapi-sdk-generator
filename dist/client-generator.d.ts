import { OpenAPISpec } from './types';
export declare class ClientGenerator {
    private spec;
    constructor(spec: OpenAPISpec);
    generateClient(): string;
    private getClassName;
    private generateClientClass;
    private generateHttpMethods;
    private generateMethodForOperation;
    private getMethodName;
    private extractPathParameters;
    private extractQueryParameters;
    private extractBodyParameter;
    private getParameterType;
    private schemaToType;
    private getReturnType;
}
//# sourceMappingURL=client-generator.d.ts.map