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
exports.SDKGenerator = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const parser_1 = require("./parser");
const type_generator_1 = require("./type-generator");
const client_generator_1 = require("./client-generator");
class SDKGenerator {
    constructor(inputFile, outputDir = './generated') {
        this.inputFile = inputFile;
        this.outputDir = outputDir;
    }
    generate() {
        console.log(`Generating SDK from ${this.inputFile}...`);
        const spec = parser_1.OpenAPIParser.parse(this.inputFile);
        if (!fs.existsSync(this.outputDir)) {
            fs.mkdirSync(this.outputDir, { recursive: true });
        }
        const typeGenerator = new type_generator_1.TypeGenerator(spec);
        const clientGenerator = new client_generator_1.ClientGenerator(spec);
        const types = typeGenerator.generateTypes();
        const client = clientGenerator.generateClient();
        const typesFile = path.join(this.outputDir, 'types.ts');
        const clientFile = path.join(this.outputDir, 'client.ts');
        const indexFile = path.join(this.outputDir, 'index.ts');
        fs.writeFileSync(typesFile, types);
        fs.writeFileSync(clientFile, `import * as Types from './types';\n\n${client}`);
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
}
exports.SDKGenerator = SDKGenerator;
//# sourceMappingURL=generator.js.map