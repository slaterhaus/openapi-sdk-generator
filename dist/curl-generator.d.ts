import { OpenAPISpec } from './types';
import { CurlCommand } from './postman-types';
export declare class CurlGenerator {
    private spec;
    constructor(spec: OpenAPISpec);
    generateCurls(): CurlCommand[];
    private generateCurlCommand;
    private generateExampleFromSchema;
    private getExampleValue;
    generateCurlsAsText(): string;
}
//# sourceMappingURL=curl-generator.d.ts.map