export interface GraphQLSchema {
    types: GraphQLType[];
    queries: GraphQLQuery[];
    mutations: GraphQLMutation[];
    inputs: GraphQLInput[];
    enums: GraphQLEnum[];
}
export interface GraphQLType {
    name: string;
    description?: string;
    fields: GraphQLField[];
    interfaces?: string[];
}
export interface GraphQLField {
    name: string;
    type: string;
    description?: string;
    nullable?: boolean;
    list?: boolean;
    args?: GraphQLArgument[];
}
export interface GraphQLArgument {
    name: string;
    type: string;
    description?: string;
    nullable?: boolean;
    defaultValue?: any;
}
export interface GraphQLQuery {
    name: string;
    description?: string;
    returnType: string;
    args: GraphQLArgument[];
    resolver?: {
        method: string;
        path: string;
        operation: string;
    };
}
export interface GraphQLMutation {
    name: string;
    description?: string;
    returnType: string;
    args: GraphQLArgument[];
    resolver?: {
        method: string;
        path: string;
        operation: string;
    };
}
export interface GraphQLInput {
    name: string;
    description?: string;
    fields: GraphQLInputField[];
}
export interface GraphQLInputField {
    name: string;
    type: string;
    description?: string;
    nullable?: boolean;
    list?: boolean;
    defaultValue?: any;
}
export interface GraphQLEnum {
    name: string;
    description?: string;
    values: GraphQLEnumValue[];
}
export interface GraphQLEnumValue {
    name: string;
    value: string;
    description?: string;
    deprecated?: boolean;
}
export interface GraphQLScalarType {
    name: string;
    description?: string;
    serialize?: string;
    parseValue?: string;
    parseLiteral?: string;
}
//# sourceMappingURL=graphql-types.d.ts.map