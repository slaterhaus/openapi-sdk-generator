import { OpenAPISpec } from './types';
import { PostmanCollection } from './postman-types';
export declare class PostmanGenerator {
    private spec;
    constructor(spec: OpenAPISpec);
    generateCollection(): PostmanCollection;
    private generatePostmanItem;
    private generatePostmanRequest;
    private generatePostmanUrl;
    private generatePostmanHeaders;
    private generatePostmanBody;
    private generateExampleFromSchema;
    private getExampleValue;
}
//# sourceMappingURL=postman-generator.d.ts.map