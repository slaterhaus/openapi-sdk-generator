#!/usr/bin/env node
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const parser_1 = require("./parser");
const graphql_generator_1 = require("./graphql-generator");
function printUsage() {
    console.log(`
OpenAPI to GraphQL Schema Generator

Usage: openapi-graphql <input-file> [options]

Arguments:
  input-file    Path to OpenAPI schema file (.json, .yaml, or .yml)

Options:
  --output, -o  Output file path (default: schema.graphql)
  --format, -f  Output format: schema|json (default: schema)
  --help, -h    Show this help message

Examples:
  openapi-graphql api.yaml
  openapi-graphql schema.json --output api.graphql
  openapi-graphql petstore.yaml --format json --output schema.json
  openapi-graphql api.yaml --format schema --output types.graphql

Output formats:
  schema        GraphQL schema definition language (.graphql)
  json          JSON representation of the schema structure
`);
}
function main() {
    const args = process.argv.slice(2);
    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
        printUsage();
        process.exit(0);
    }
    const inputFile = args[0];
    let outputFile = 'schema.graphql';
    let format = 'schema';
    // Parse options
    for (let i = 1; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--output' || arg === '-o') {
            outputFile = args[i + 1];
            i++; // Skip next argument since it's the value
        }
        else if (arg === '--format' || arg === '-f') {
            const formatValue = args[i + 1];
            if (formatValue === 'schema' || formatValue === 'json') {
                format = formatValue;
            }
            else {
                console.error(`Error: Invalid format '${formatValue}'. Use 'schema' or 'json'.`);
                process.exit(1);
            }
            i++; // Skip next argument since it's the value
        }
    }
    // Validate input file
    if (!fs.existsSync(inputFile)) {
        console.error(`Error: Input file '${inputFile}' does not exist.`);
        process.exit(1);
    }
    const ext = path.extname(inputFile).toLowerCase();
    if (!['.json', '.yaml', '.yml'].includes(ext)) {
        console.error(`Error: Unsupported file format. Please use .json, .yaml, or .yml files.`);
        process.exit(1);
    }
    // Adjust default output file based on format
    if (outputFile === 'schema.graphql' && format === 'json') {
        outputFile = 'schema.json';
    }
    try {
        console.log(`Reading OpenAPI specification from ${inputFile}...`);
        const spec = parser_1.OpenAPIParser.parse(inputFile);
        console.log('Generating GraphQL schema...');
        const generator = new graphql_generator_1.GraphQLGenerator(spec);
        if (format === 'schema') {
            const schemaString = generator.generateGraphQLSchema();
            fs.writeFileSync(outputFile, schemaString);
            console.log(`GraphQL schema generated successfully!`);
            console.log(`File created: ${outputFile}`);
            console.log(`\\nTo use the GraphQL schema:`);
            console.log(`1. Import the schema into your GraphQL server`);
            console.log(`2. Implement resolvers for the generated queries and mutations`);
            console.log(`3. Consider adding custom scalars (JSON, DateTime) to your server`);
        }
        else if (format === 'json') {
            const schemaStructure = generator.generateSchema();
            fs.writeFileSync(outputFile, JSON.stringify(schemaStructure, null, 2));
            console.log(`GraphQL schema structure generated successfully!`);
            console.log(`File created: ${outputFile}`);
            console.log(`\\nTo use the JSON schema structure:`);
            console.log(`1. Parse the JSON to build your GraphQL schema programmatically`);
            console.log(`2. Use the resolver information to map to your REST endpoints`);
        }
        console.log(`\\nAPI Info:`);
        console.log(`  Title: ${spec.info.title}`);
        console.log(`  Version: ${spec.info.version}`);
        console.log(`  Endpoints: ${Object.keys(spec.paths).length}`);
        const schema = generator.generateSchema();
        console.log(`\\nGenerated GraphQL Components:`);
        console.log(`  Types: ${schema.types.length}`);
        console.log(`  Inputs: ${schema.inputs.length}`);
        console.log(`  Enums: ${schema.enums.length}`);
        console.log(`  Queries: ${schema.queries.length}`);
        console.log(`  Mutations: ${schema.mutations.length}`);
    }
    catch (error) {
        console.error('Error generating GraphQL schema:', error);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=graphql-cli.js.map