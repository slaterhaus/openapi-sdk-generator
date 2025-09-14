import * as fs from 'fs';
import * as path from 'path';
import { OpenAPIParser } from '../core/parser';
import { TypeGenerator } from './type-generator';
import { ClientGenerator } from './client-generator';

export class SDKGenerator {
  private readonly inputFile: string;
  private readonly outputDir: string;

  constructor(inputFile: string, outputDir: string = './generated') {
    this.inputFile = inputFile;
    this.outputDir = outputDir;
  }

  generate(): void {
    console.log(`Generating SDK from ${this.inputFile}...`);

    const spec = OpenAPIParser.parse(this.inputFile);

    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }

    const typeGenerator = new TypeGenerator(spec);
    const clientGenerator = new ClientGenerator(spec);

    const types = typeGenerator.generateTypes();
    const client = clientGenerator.generateClient();

    // Extract type names for import statement
    const typeNames = this.extractTypeNames(spec);
    const importStatement = typeNames.length > 0
      ? `import { ${typeNames.join(', ')} } from './types';\n\n`
      : '';

    const typesFile = path.join(this.outputDir, 'types.ts');
    const clientFile = path.join(this.outputDir, 'client.ts');
    const indexFile = path.join(this.outputDir, 'index.ts');

    fs.writeFileSync(typesFile, types);
    fs.writeFileSync(clientFile, `${importStatement}${client}`);

    const indexContent = `export * from './types';
export * from './client';
`;
    fs.writeFileSync(indexFile, indexContent);

    console.log(`SDK generated successfully!`);
    console.log(`Files created:`);
    console.log(`  - ${typesFile}`);
    console.log(`  - ${clientFile}`);
    console.log(`  - ${indexFile}`);
  }

  private extractTypeNames(spec: any): string[] {
    const typeNames: string[] = [];

    if (spec.components?.schemas) {
      for (const [name, schema] of Object.entries(spec.components.schemas)) {
        typeNames.push(name);
      }
    }

    return typeNames;
  }
}