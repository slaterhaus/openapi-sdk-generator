# OpenAPI SDK Generator

🚀 Generate TypeScript SDKs, Postman collections, GraphQL schemas, and cURL commands from OpenAPI specifications

## Features

- **TypeScript SDK Generation** - Type-safe API clients with full IntelliSense support
- **Postman Collections** - Ready-to-import collections compatible with Postman & Insomnia
- **GraphQL Schema Generation** - Convert REST APIs to GraphQL schemas with resolvers
- **cURL Commands** - Copy-paste ready cURL commands with example data
- **Multiple Input Formats** - Support for JSON, YAML, and YML OpenAPI specs
- **Clean Code Generation** - Well-structured, readable output following best practices

## Installation

```bash
npm install -g openapi-sdk-gen
```

## Quick Start

```bash
# Generate TypeScript SDK
openapi-sdk-gen api.yaml

# Generate Postman collection
openapi-postman api.yaml

# Generate GraphQL schema
openapi-graphql api.yaml

# Generate cURL commands
openapi-postman api.yaml --format curl
```

## CLI Tools

### TypeScript SDK Generator

Generate a complete TypeScript SDK with types and API client:

```bash
openapi-sdk-gen <input-file> [output-dir]

# Examples
openapi-sdk-gen petstore.yaml
openapi-sdk-gen schema.json ./my-sdk
```

**Generated files:**
- `types.ts` - TypeScript interfaces and types
- `client.ts` - API client class with methods
- `index.ts` - Main exports

### Postman Collection Generator

Create Postman collections or cURL commands:

```bash
openapi-postman <input-file> [options]

Options:
  --output, -o  Output file path
  --format, -f  Output format: postman|curl
  --help, -h    Show help

# Examples
openapi-postman api.yaml
openapi-postman api.yaml --output collection.json
openapi-postman api.yaml --format curl --output commands.txt
```

### GraphQL Schema Generator

Convert OpenAPI specs to GraphQL schemas:

```bash
openapi-graphql <input-file> [options]

Options:
  --output, -o  Output file path
  --format, -f  Output format: schema|json
  --help, -h    Show help

# Examples
openapi-graphql api.yaml
openapi-graphql api.yaml --output schema.graphql
openapi-graphql api.yaml --format json --output structure.json
```

## Example Usage

### Input: OpenAPI Specification

```yaml
openapi: 3.0.3
info:
  title: Pet Store API
  version: 1.0.0
paths:
  /pets:
    get:
      operationId: listPets
      responses:
        '200':
          content:
            application/json:
              schema:
                type: array
                items:
                  $ref: '#/components/schemas/Pet'
components:
  schemas:
    Pet:
      type: object
      required: [id, name]
      properties:
        id: {type: string}
        name: {type: string}
```

### Generated TypeScript SDK

```typescript
// types.ts
export interface Pet {
  id: string;
  name: string;
}

// client.ts
import { Pet } from './types';

export class PetStoreAPIClient {
  constructor(private baseUrl: string) {}

  async listPets(): Promise<Pet[]> {
    // Implementation...
  }
}
```

### Generated Postman Collection

```json
{
  "info": { "name": "Pet Store API" },
  "item": [{
    "name": "listPets",
    "request": {
      "method": "GET",
      "url": "{{baseUrl}}/pets"
    }
  }]
}
```

### Generated GraphQL Schema

```graphql
type Pet {
  id: String!
  name: String!
}

type Query {
  listPets: [Pet]
}
```

### Generated cURL Commands

```bash
# GET /pets - List all pets
curl -X GET "https://api.example.com/pets"
```

## Compatibility

- **Postman** - Full compatibility with generated collections
- **Insomnia** - Collections work seamlessly (basic features)
- **OpenAPI 3.0+** - Full support for OpenAPI 3.0 and 3.1 specifications
- **Node.js** - Requires Node.js 16+ for CLI tools
- **TypeScript** - Generated SDKs work with TypeScript 4.0+

## Development

```bash
# Clone the repository
git clone https://github.com/your-username/openapi-sdk-gen.git
cd openapi-sdk-gen

# Install dependencies
npm install

# Build the project
npm run build

# Test with example
npm run generate example-petstore.yaml
```

## Library Usage

You can also use the generators programmatically:

```typescript
import {
  OpenAPIParser,
  SDKGenerator,
  PostmanGenerator,
  GraphQLGenerator
} from 'openapi-sdk-gen';

const spec = OpenAPIParser.parse('api.yaml');

// Generate SDK
const sdkGen = new SDKGenerator(spec);
const sdk = sdkGen.generateClient();

// Generate Postman collection
const postmanGen = new PostmanGenerator(spec);
const collection = postmanGen.generateCollection();

// Generate GraphQL schema
const graphqlGen = new GraphQLGenerator(spec);
const schema = graphqlGen.generateGraphQLSchema();
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Author

Thomas James Slater

---

**Keywords:** openapi, swagger, typescript, postman, graphql, api-client, code-generator, rest-api