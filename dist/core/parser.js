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
exports.OpenAPIParser = void 0;
const fs = __importStar(require("fs"));
const YAML = __importStar(require("yaml"));
class OpenAPIParser {
    static parse(filePath) {
        const content = fs.readFileSync(filePath, 'utf-8');
        if (filePath.endsWith('.yaml') || filePath.endsWith('.yml')) {
            return YAML.parse(content);
        }
        else if (filePath.endsWith('.json')) {
            return JSON.parse(content);
        }
        else {
            throw new Error('Unsupported file format. Please use .json, .yaml, or .yml files.');
        }
    }
    static resolveRef(spec, ref) {
        const parts = ref.replace('#/', '').split('/');
        let current = spec;
        for (const part of parts) {
            if (current[part] === undefined) {
                throw new Error(`Reference ${ref} not found`);
            }
            current = current[part];
        }
        return current;
    }
}
exports.OpenAPIParser = OpenAPIParser;
//# sourceMappingURL=parser.js.map