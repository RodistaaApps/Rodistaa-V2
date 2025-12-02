#!/usr/bin/env node

/**
 * Package ZIP Script
 * Creates a reproducible ZIP archive of the Rodistaa monorepo
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const rootDir = path.resolve(__dirname, '..');
const outputFile = path.join(rootDir, 'rodistaa-monorepo.zip');

// Directories and files to exclude from ZIP
const excludePatterns = [
  'node_modules',
  'dist',
  '.next',
  '.expo',
  'coverage',
  '.git',
  '*.log',
  '.env',
  '.env.local',
  '*.zip',
  '.DS_Store',
  'Thumbs.db',
];

// Directories and files to include
const includePaths = [
  'packages',
  'api',
  'docs',
  'scripts',
  'package.json',
  'pnpm-workspace.yaml',
  'tsconfig.json',
  'README.md',
  'DECISIONS.md',
  'SECURITY.md',
  '.editorconfig',
  '.prettierrc',
  '.eslintrc.json',
  '.gitignore',
  'docker-compose.yml',
];

console.log('Creating Rodistaa monorepo ZIP archive...');
console.log(`Output: ${outputFile}`);

try {
  // Use PowerShell's Compress-Archive on Windows, zip command on Unix
  const isWindows = process.platform === 'win32';
  
  if (isWindows) {
    // PowerShell command
    const excludeArgs = excludePatterns.map(p => `-Exclude "${p}"`).join(' ');
    const command = `powershell -Command "Get-ChildItem -Path '${rootDir}' -Recurse ${excludeArgs} | Where-Object { $_.FullName -notmatch 'node_modules|dist|\\.next|\\.expo|\\.git|coverage' } | Compress-Archive -DestinationPath '${outputFile}' -Force"`;
    execSync(command, { cwd: rootDir, stdio: 'inherit' });
  } else {
    // Unix zip command
    let zipArgs = includePaths.map(p => `"${p}"`).join(' ');
    excludePatterns.forEach(pattern => {
      zipArgs += ` -x "${pattern}"`;
    });
    execSync(`zip -r "${outputFile}" ${zipArgs}`, { cwd: rootDir, stdio: 'inherit' });
  }

  const stats = fs.statSync(outputFile);
  const sizeMB = (stats.size / (1024 * 1024)).toFixed(2);
  
  console.log(`\n✅ ZIP archive created successfully!`);
  console.log(`   Size: ${sizeMB} MB`);
  console.log(`   Location: ${outputFile}`);
} catch (error) {
  console.error('❌ Failed to create ZIP archive:', error.message);
  process.exit(1);
}

