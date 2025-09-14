#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { SDKGenerator } from '../sdk/generator';

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
    const generator = new SDKGenerator(inputFile, outputDir);
    generator.generate();
  } catch (error) {
    console.error('Error generating SDK:', error);
    process.exit(1);
  }
}

main();