#!/usr/bin/env node
/**
 * Hardcoded Value Scanner
 * Scans entire codebase for hardcoded design values
 * 
 * Usage: pnpm tokens:scan
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

const REPO_ROOT = path.join(__dirname, '../../..');
const EXCLUDE_DIRS = ['node_modules', 'dist', '.next', 'build', 'coverage'];

console.log('🔍 Scanning codebase for hardcoded design values...\n');

const violations = {
  colors: [],
  spacing: [],
  radius: [],
  fonts: [],
  shadows: [],
};

let totalFiles = 0;

// Patterns to detect
const patterns = {
  // Hardcoded colors
  colors: /#[0-9A-F]{6}/gi,
  
  // Hardcoded spacing (common patterns)
  spacing: /(padding|margin|gap|top|bottom|left|right|width|height):\s*['"]?\d{1,3}px['"]?/gi,
  
  // Hardcoded border radius
  radius: /border[^:]*radius[^:]*:\s*['"]?\d{1,2}px['"]?/gi,
  
  // Font families not using tokens
  fonts: /font[^:]*family[^:]*:\s*['"](?!RodistaaTypography|Baloo Bhai|Times New Roman)[^'"]+['"]/gi,
  
  // Box shadows
  shadows: /box-shadow:\s*[^;]+;/gi,
};

// Scan function
function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(REPO_ROOT, filePath);
  
  totalFiles++;
  
  // Check each pattern
  for (const [type, pattern] of Object.entries(patterns)) {
    const matches = content.match(pattern);
    if (matches) {
      for (const match of matches) {
        // Skip if it's already using tokens
        if (match.includes('Rodistaa') || match.includes('RodistaaColors') || match.includes('RodistaaSpacing')) {
          continue;
        }
        
        // Special handling for colors - check if it's Rodistaa red
        if (type === 'colors') {
          const colorValue = match.toUpperCase();
          if (colorValue === '#C90D0D') {
            violations[type].push({
              file: relativePath,
              line: getLineNumber(content, match),
              value: match,
              severity: 'HIGH',
              suggestion: 'Use RodistaaColors.primary.main',
            });
            continue;
          }
        }
        
        // Special handling for spacing - check if it's an allowed value
        if (type === 'spacing') {
          const valueMatch = match.match(/\d+/);
          if (valueMatch) {
            const value = parseInt(valueMatch[0]);
            const allowedSpacing = [0, 4, 8, 12, 16, 24, 32, 48, 56, 64];
            
            if (!allowedSpacing.includes(value)) {
              violations[type].push({
                file: relativePath,
                line: getLineNumber(content, match),
                value: match,
                severity: 'MEDIUM',
                suggestion: `Use RodistaaSpacing token (closest: ${findClosestSpacing(value)})`,
              });
            }
          }
        }
        
        // Other violations
        if (type === 'radius' || type === 'fonts' || type === 'shadows') {
          violations[type].push({
            file: relativePath,
            line: getLineNumber(content, match),
            value: match,
            severity: 'MEDIUM',
            suggestion: getSuggestion(type),
          });
        }
      }
    }
  }
}

function getLineNumber(content, match) {
  const index = content.indexOf(match);
  if (index === -1) return '?';
  return content.substring(0, index).split('\n').length;
}

function findClosestSpacing(value) {
  const allowed = [4, 8, 12, 16, 24, 32, 48];
  return allowed.reduce((prev, curr) => 
    Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev
  );
}

function getSuggestion(type) {
  const suggestions = {
    radius: 'Use RodistaaSpacing.borderRadius.{sm|md|lg|xl}',
    fonts: 'Use RodistaaTypography.fontFamily.{heading|body}',
    shadows: 'Use RNShadowStyles (mobile) or WebShadowStyles (web)',
  };
  return suggestions[type] || 'Use design tokens';
}

// Find all relevant files
console.log('📂 Finding files...');

const patterns_to_scan = [
  'packages/mobile/**/*.{ts,tsx}',
  'packages/portal/**/*.{ts,tsx}',
  'packages/design-system/src/**/*.{ts,tsx}',
];

let allFiles = [];
for (const pattern of patterns_to_scan) {
  const files = glob.sync(path.join(REPO_ROOT, pattern), {
    ignore: EXCLUDE_DIRS.map(dir => `**/${dir}/**`),
  });
  allFiles = allFiles.concat(files);
}

console.log(`Found ${allFiles.length} files to scan\n`);

// Scan all files
for (const file of allFiles) {
  scanFile(file);
}

// Report results
console.log('\n' + '='.repeat(80));
console.log('📊 HARDCODED VALUE SCAN REPORT');
console.log('='.repeat(80) + '\n');

console.log(`Scanned ${totalFiles} files\n`);

let totalViolations = 0;
let highSeverity = 0;

for (const [type, items] of Object.entries(violations)) {
  if (items.length > 0) {
    console.log(`\n${type.toUpperCase()} (${items.length} violations):`);
    console.log('-'.repeat(80));
    
    // Group by severity
    const high = items.filter(v => v.severity === 'HIGH');
    const medium = items.filter(v => v.severity === 'MEDIUM');
    
    if (high.length > 0) {
      console.log(`\n  ❌ HIGH SEVERITY (${high.length}):`);
      high.slice(0, 5).forEach(v => {
        console.log(`     ${v.file}:${v.line}`);
        console.log(`     Found: ${v.value}`);
        console.log(`     Fix: ${v.suggestion}\n`);
      });
      if (high.length > 5) {
        console.log(`     ... and ${high.length - 5} more\n`);
      }
    }
    
    if (medium.length > 0) {
      console.log(`\n  ⚠️  MEDIUM SEVERITY (${medium.length}):`);
      medium.slice(0, 3).forEach(v => {
        console.log(`     ${v.file}:${v.line}`);
        console.log(`     Found: ${v.value}`);
        console.log(`     Fix: ${v.suggestion}\n`);
      });
      if (medium.length > 3) {
        console.log(`     ... and ${medium.length - 3} more\n`);
      }
    }
    
    totalViolations += items.length;
    highSeverity += high.length;
  }
}

console.log('\n' + '='.repeat(80));
console.log('SUMMARY');
console.log('='.repeat(80));
console.log(`Total violations: ${totalViolations}`);
console.log(`High severity: ${highSeverity}`);
console.log(`Files scanned: ${totalFiles}\n`);

if (highSeverity > 0) {
  console.log('❌ HIGH SEVERITY violations must be fixed!\n');
  console.log('Run: pnpm tokens:fix (coming soon)\n');
  process.exit(1);
} else if (totalViolations > 0) {
  console.log('⚠️  Found violations. Consider fixing before production.\n');
  process.exit(0);
} else {
  console.log('✅ No hardcoded values detected! Codebase is clean.\n');
  process.exit(0);
}

