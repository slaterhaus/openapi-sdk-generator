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
const parser_1 = require("../core/parser");
const postman_generator_1 = require("../postman/postman-generator");
const curl_generator_1 = require("../postman/curl-generator");
function printUsage() {
    console.log(`
OpenAPI to Postman Collection Generator

Usage: openapi-postman <input-file> [options]

Arguments:
  input-file    Path to OpenAPI schema file (.json, .yaml, or .yml)

Options:
  --output, -o  Output file path (default: collection.json)
  --format, -f  Output format: postman|curl (default: postman)
  --help, -h    Show this help message

Examples:
  openapi-postman api.yaml
  openapi-postman schema.json --output my-collection.json
  openapi-postman petstore.yaml --format curl --output curls.txt
  openapi-postman api.yaml --format postman --output collection.json
`);
}
function main() {
    const args = process.argv.slice(2);
    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
        printUsage();
        process.exit(0);
    }
    const inputFile = args[0];
    let outputFile = 'collection.json';
    let format = 'postman';
    // Parse options
    for (let i = 1; i < args.length; i++) {
        const arg = args[i];
        if (arg === '--output' || arg === '-o') {
            outputFile = args[i + 1];
            i++; // Skip next argument since it's the value
        }
        else if (arg === '--format' || arg === '-f') {
            const formatValue = args[i + 1];
            if (formatValue === 'postman' || formatValue === 'curl') {
                format = formatValue;
            }
            else {
                console.error(`Error: Invalid format '${formatValue}'. Use 'postman' or 'curl'.`);
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
    if (outputFile === 'collection.json' && format === 'curl') {
        outputFile = 'curls.txt';
    }
    try {
        console.log(`Reading OpenAPI specification from ${inputFile}...`);
        const spec = parser_1.OpenAPIParser.parse(inputFile);
        if (format === 'postman') {
            console.log('Generating Postman collection...');
            const generator = new postman_generator_1.PostmanGenerator(spec);
            const collection = generator.generateCollection();
            fs.writeFileSync(outputFile, JSON.stringify(collection, null, 2));
            console.log(`Postman collection generated successfully!`);
            console.log(`File created: ${outputFile}`);
            console.log(`\\nTo import into Postman:`);
            console.log(`1. Open Postman`);
            console.log(`2. Click Import`);
            console.log(`3. Select the generated file: ${outputFile}`);
        }
        else if (format === 'curl') {
            console.log('Generating cURL commands...');
            const generator = new curl_generator_1.CurlGenerator(spec);
            const curlsText = generator.generateCurlsAsText();
            fs.writeFileSync(outputFile, curlsText);
            console.log(`cURL commands generated successfully!`);
            console.log(`File created: ${outputFile}`);
            console.log(`\\nTo use the cURL commands:`);
            console.log(`1. Review and modify the example values as needed`);
            console.log(`2. Copy and paste commands into your terminal`);
        }
        console.log(`\\nAPI Info:`);
        console.log(`  Title: ${spec.info.title}`);
        console.log(`  Version: ${spec.info.version}`);
        console.log(`  Endpoints: ${Object.keys(spec.paths).length}`);
    }
    catch (error) {
        console.error('Error generating output:', error);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=postman-cli.js.map