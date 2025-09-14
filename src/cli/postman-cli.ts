#!/usr/bin/env node

import * as fs from 'fs';
import * as path from 'path';
import { OpenAPIParser } from '../core/parser';
import { PostmanGenerator } from '../postman/postman-generator';
import { CurlGenerator } from '../postman/curl-generator';

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
  let format: 'postman' | 'curl' = 'postman';

  // Parse options
  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--output' || arg === '-o') {
      outputFile = args[i + 1];
      i++; // Skip next argument since it's the value
    } else if (arg === '--format' || arg === '-f') {
      const formatValue = args[i + 1];
      if (formatValue === 'postman' || formatValue === 'curl') {
        format = formatValue;
      } else {
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
    const spec = OpenAPIParser.parse(inputFile);

    if (format === 'postman') {
      console.log('Generating Postman collection...');
      const generator = new PostmanGenerator(spec);
      const collection = generator.generateCollection();

      fs.writeFileSync(outputFile, JSON.stringify(collection, null, 2));
      console.log(`Postman collection generated successfully!`);
      console.log(`File created: ${outputFile}`);
      console.log(`\\nTo import into Postman:`);
      console.log(`1. Open Postman`);
      console.log(`2. Click Import`);
      console.log(`3. Select the generated file: ${outputFile}`);

    } else if (format === 'curl') {
      console.log('Generating cURL commands...');
      const generator = new CurlGenerator(spec);
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

  } catch (error) {
    console.error('Error generating output:', error);
    process.exit(1);
  }
}

main();