#!/usr/bin/env node
/**
 * Token Validator Script
 * Prevents token drift between Figma and Code
 * 
 * Usage: pnpm tokens:validate
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const TOKENS_JSON = path.join(__dirname, '../tokens/tokens.json');
const SRC_DIR = path.join(__dirname, '../src');

console.log('🔍 Validating tokens for drift...\n');

let hasErrors = false;
const errors = [];
const warnings = [];

// Load tokens.json
const tokensData = JSON.parse(fs.readFileSync(TOKENS_JSON, 'utf8'));
const tokens = tokensData.global;

// 1. Validate token structure
console.log('✓ Checking token structure...');

const requiredCategories = ['color', 'font', 'fontSize', 'lineHeight', 'space', 'radius', 'shadow', 'sizes'];
for (const category of requiredCategories) {
  if (!tokens[category]) {
    errors.push(`❌ Missing required token category: ${category}`);
    hasErrors = true;
  }
}

// 2. Validate color formats
console.log('✓ Checking color formats...');

if (tokens.color) {
  for (const [name, token] of Object.entries(tokens.color)) {
    if (token.type === 'color') {
      const hexPattern = /^#[0-9A-F]{6}$/i;
      if (!hexPattern.test(token.value)) {
        errors.push(`❌ Invalid color format for color.${name}: ${token.value} (must be #RRGGBB)`);
        hasErrors = true;
      }
    }
  }
}

// 3. Validate Rodistaa primary color
console.log('✓ Checking Rodistaa brand compliance...');

if (tokens.color?.primary?.value !== '#C90D0D') {
  errors.push(`❌ PRIMARY COLOR VIOLATION: color.primary must be #C90D0D, found ${tokens.color?.primary?.value}`);
  hasErrors = true;
}

if (tokens.font?.heading?.value !== 'Baloo Bhai') {
  errors.push(`❌ FONT VIOLATION: font.heading must be "Baloo Bhai", found "${tokens.font?.heading?.value}"`);
  hasErrors = true;
}

if (tokens.font?.body?.value !== 'Times New Roman') {
  errors.push(`❌ FONT VIOLATION: font.body must be "Times New Roman", found "${tokens.font?.body?.value}"`);
  hasErrors = true;
}

// 4. Validate spacing scale
console.log('✓ Checking spacing scale compliance...');

const requiredSpacingValues = ['4', '8', '12', '16', '24', '32', '48'];
const allowedSpacing = new Set(requiredSpacingValues);

if (tokens.space) {
  for (const key of Object.keys(tokens.space)) {
    if (!allowedSpacing.has(key)) {
      warnings.push(`⚠️  Non-standard spacing value: space.${key} (allowed: 4, 8, 12, 16, 24, 32, 48)`);
    }
  }
}

// 5. Scan for hardcoded values in codebase
console.log('✓ Scanning for hardcoded values...');

const componentFiles = glob.sync(path.join(SRC_DIR, 'components/**/*.tsx'));
let hardcodedValues = [];

for (const file of componentFiles) {
  const content = fs.readFileSync(file, 'utf8');
  const relativePath = path.relative(SRC_DIR, file);
  
  // Check for hardcoded Rodistaa Red
  if (content.includes('#C90D0D') && !content.includes('RodistaaColors.primary')) {
    hardcodedValues.push(`${relativePath}: Hardcoded #C90D0D found (use RodistaaColors.primary.main)`);
  }
  
  // Check for hardcoded spacing patterns
  const hardcodedSpacingPattern = /(padding|margin):\s*['"]?\d{1,2}px['"]?/g;
  const matches = content.match(hardcodedSpacingPattern);
  if (matches) {
    for (const match of matches) {
      const value = match.match(/\d+/)?.[0];
      if (value && !['0', '4', '8', '12', '16', '24', '32', '48'].includes(value)) {
        hardcodedValues.push(`${relativePath}: Hardcoded spacing "${match}" (use RodistaaSpacing tokens)`);
      }
    }
  }
  
  // Check for hardcoded border radius
  const hardcodedRadiusPattern = /borderRadius:\s*['"]?\d{1,2}px?['"]?/g;
  const radiusMatches = content.match(hardcodedRadiusPattern);
  if (radiusMatches) {
    for (const match of radiusMatches) {
      const value = match.match(/\d+/)?.[0];
      if (value && !['4', '6', '8', '12', '20'].includes(value)) {
        hardcodedValues.push(`${relativePath}: Hardcoded border radius "${match}" (use RodistaaSpacing.borderRadius)`);
      }
    }
  }
}

if (hardcodedValues.length > 0) {
  errors.push(`❌ Found ${hardcodedValues.length} hardcoded value(s):`);
  hardcodedValues.slice(0, 10).forEach(hv => errors.push(`   ${hv}`));
  if (hardcodedValues.length > 10) {
    errors.push(`   ... and ${hardcodedValues.length - 10} more`);
  }
  hasErrors = true;
}

// 6. Check for token sync status
console.log('✓ Checking token sync status...');

const tsColorsFile = path.join(SRC_DIR, 'tokens/colors.ts');
const tsSpacingFile = path.join(SRC_DIR, 'tokens/spacing.ts');

if (!fs.existsSync(tsColorsFile)) {
  errors.push('❌ colors.ts not found. Run: pnpm tokens:generate');
  hasErrors = true;
}

if (!fs.existsSync(tsSpacingFile)) {
  errors.push('❌ spacing.ts not found. Run: pnpm tokens:generate');
  hasErrors = true;
}

// Report results
console.log('\n' + '='.repeat(60));
console.log('📊 VALIDATION REPORT');
console.log('='.repeat(60) + '\n');

if (errors.length > 0) {
  console.log('❌ ERRORS:\n');
  errors.forEach(error => console.log(error));
  console.log('');
}

if (warnings.length > 0) {
  console.log('⚠️  WARNINGS:\n');
  warnings.forEach(warning => console.log(warning));
  console.log('');
}

if (!hasErrors && warnings.length === 0) {
  console.log('✅ ALL CHECKS PASSED!\n');
  console.log('Token sync is healthy. No drift detected.\n');
  process.exit(0);
} else if (!hasErrors) {
  console.log('✅ VALIDATION PASSED (with warnings)\n');
  console.log(`Found ${warnings.length} warning(s). Please review.\n`);
  process.exit(0);
} else {
  console.log(`❌ VALIDATION FAILED: ${errors.length} error(s), ${warnings.length} warning(s)\n`);
  console.log('Please fix errors before committing.\n');
  process.exit(1);
}

