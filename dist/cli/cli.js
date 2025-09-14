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
const generator_1 = require("../sdk/generator");
function printUsage() {
    console.log(`
OpenAPI SDK Generator

Usage: openapi-sdk-gen <input-file> [output-dir]

Arguments:
  input-file    Path to OpenAPI schema file (.json, .yaml, or .yml)
  output-dir    Output directory for generated files (default: ./generated)

Examples:
  openapi-sdk-gen api.yaml
  openapi-sdk-gen schema.json ./sdk
  openapi-sdk-gen petstore.yaml ./generated-sdk
`);
}
function main() {
    const args = process.argv.slice(2);
    if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
        printUsage();
        process.exit(0);
    }
    const inputFile = args[0];
    const outputDir = args[1] || './generated';
    if (!fs.existsSync(inputFile)) {
        console.error(`Error: Input file '${inputFile}' does not exist.`);
        process.exit(1);
    }
    const ext = path.extname(inputFile).toLowerCase();
    if (!['.json', '.yaml', '.yml'].includes(ext)) {
        console.error(`Error: Unsupported file format. Please use .json, .yaml, or .yml files.`);
        process.exit(1);
    }
    try {
        const generator = new generator_1.SDKGenerator(inputFile, outputDir);
        generator.generate();
    }
    catch (error) {
        console.error('Error generating SDK:', error);
        process.exit(1);
    }
}
main();
//# sourceMappingURL=cli.js.map