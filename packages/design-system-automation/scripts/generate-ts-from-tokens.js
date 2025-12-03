#!/usr/bin/env node
/**
 * generate-ts-from-tokens.js
 * - Reads tokens.json and generates TS files:
 *   colors.ts, spacing.ts, typography.ts, radius.ts, shadows.ts, sizes.ts, index.ts
 */

const fs = require('fs');
const path = require('path');
const prettier = require('prettier');

const TOKENS_JSON = path.join(__dirname, '..', '..', 'design-system', 'tokens', 'tokens.json');
const OUT_DIR = path.join(__dirname, '..', '..', 'design-system', 'src', 'tokens');

function format(code) {
  try {
    return prettier.format(code, { parser: 'typescript' });
  } catch {
    return code;
  }
}

function ensureOut() {
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });
}

function writeFile(file, content) {
  fs.writeFileSync(path.join(OUT_DIR, file), format(content), 'utf8');
  console.log('✅ Wrote', file);
}

function toConstExport(objName, obj) {
  return `export const ${objName} = ${JSON.stringify(obj, null, 2)} as const;\nexport type ${capitalize(objName)} = typeof ${objName};\n`;
}

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function safeNumberify(v) {
  if (typeof v === 'string' && !isNaN(Number(v))) return Number(v);
  return v;
}

function main() {
  if (!fs.existsSync(TOKENS_JSON)) {
    console.error('❌ tokens.json not found. Run figma-sync first.');
    process.exit(1);
  }
  
  console.log('📖 Reading tokens.json...');
  const tokens = JSON.parse(fs.readFileSync(TOKENS_JSON, 'utf8'));
  ensureOut();

  // colors.ts
  const colors = tokens.color || {};
  writeFile('colors.ts', toConstExport('colors', colors));

  // spacing.ts
  const spacing = tokens.spacing || {};
  // Ensure numeric values
  Object.keys(spacing).forEach(k => spacing[k] = safeNumberify(spacing[k]));
  writeFile('spacing.ts', toConstExport('spacing', spacing));

  // radius.ts
  const radius = tokens.radius || {};
  Object.keys(radius).forEach(k => radius[k] = safeNumberify(radius[k]));
  writeFile('radius.ts', toConstExport('radius', radius));

  // typography.ts
  const typography = tokens.typography || {};
  writeFile('typography.ts', toConstExport('typography', typography));

  // sizes.ts
  const sizes = tokens.sizes || {};
  Object.keys(sizes).forEach(k => sizes[k] = safeNumberify(sizes[k]));
  writeFile('sizes.ts', toConstExport('sizes', sizes));

  // shadows.ts
  const shadow = tokens.shadow || {};
  writeFile('shadows.ts', toConstExport('shadows', shadow));

  // index.ts
  const indexContent = `
export { colors } from './colors';
export { spacing } from './spacing';
export { radius } from './radius';
export { typography } from './typography';
export { sizes } from './sizes';
export { shadows } from './shadows';
`;
  writeFile('index.ts', indexContent);

  console.log('🎉 Token TS generation complete.');
}

main();

