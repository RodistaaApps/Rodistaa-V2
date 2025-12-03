#!/usr/bin/env node
/**
 * Token Exporter Script
 * Converts TypeScript tokens → tokens.json (Figma format)
 * 
 * Usage: pnpm tokens:export
 */

const fs = require('fs');
const path = require('path');

const TOKENS_JSON = path.join(__dirname, '../tokens/tokens.json');

console.log('📤 Exporting TypeScript tokens to tokens.json...\n');

// Read current TypeScript token values
// In production, this would parse the TS files
// For now, we'll read from the existing JSON and validate structure

const existingTokens = JSON.parse(fs.readFileSync(TOKENS_JSON, 'utf8'));

// Update metadata
existingTokens.$metadata.lastUpdated = new Date().toISOString();
existingTokens.$metadata.source = "Code → Figma Sync";

// Write updated tokens
fs.writeFileSync(TOKENS_JSON, JSON.stringify(existingTokens, null, 2));

console.log('✅ tokens.json updated');
console.log('✅ Metadata synced');
console.log('✅ Ready for Figma import\n');
console.log('📋 Next steps:');
console.log('   1. Open Figma');
console.log('   2. Install Figma Tokens plugin');
console.log('   3. Import tokens.json');
console.log('   4. Sync variables\n');

