import { OpenAPISpec } from './types';
import { GraphQLSchema } from './graphql-types';
export declare class GraphQLGenerator {
    private spec;
    private generatedTypes;
    constructor(spec: OpenAPISpec);
    generateSchema(): GraphQLSchema;
    private generateType;
    private generateInput;
    private generateEnum;
    private generateField;
    private generateInputField;
    private generateQuery;
    private generateMutation;
    private generateArguments;
    private generateOperationName;
    private getReturnType;
    private getInputTypeFromRequestBody;
    private schemaToGraphQLType;
    private schemaToGraphQLInputType;
    private toGraphQLTypeName;
    private toGraphQLFieldName;
    private toPascalCase;
    private toCamelCase;
    generateGraphQLSchema(): string;
    private renderEnum;
    private renderInput;
    private renderType;
    private renderOperation;
}
//# sourceMappingURL=graphql-generator.d.ts.map