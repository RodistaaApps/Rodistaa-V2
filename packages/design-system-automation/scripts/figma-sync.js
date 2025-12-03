#!/usr/bin/env node
/**
 * figma-sync.js
 * - Pulls variables/tokens from Figma file using Figma REST API
 * - Writes packages/design-system/tokens/tokens.json
 * - Lightweight normalization for the token scheme defined in docs
 *
 * Requirements:
 * - env: FIGMA_TOKEN, FIGMA_FILE_KEY
 *
 * Usage:
 *  FIGMA_TOKEN=xxx FIGMA_FILE_KEY=yyy node scripts/figma-sync.js
 */

const fs = require('fs');
const path = require('path');
const axios = require('axios');
require('dotenv').config();

const OUT_DIR = path.join(__dirname, '..', '..', 'design-system', 'tokens');
const OUT_JSON = path.join(OUT_DIR, 'tokens.json');

async function fail(msg) {
  console.error('ERROR:', msg);
  process.exit(1);
}

async function main() {
  const token = process.env.FIGMA_TOKEN || process.env.FIGMA_ACCESS_TOKEN;
  const fileKey = process.env.FIGMA_FILE_KEY;

  if (!token || !fileKey) {
    await fail('Missing FIGMA_TOKEN or FIGMA_FILE_KEY. See FIGMA_CREDENTIALS_SETUP.md');
  }

  // 1) Get file styles/variables: Use Figma REST API - GET file?fields=styles,components
  // For variables, use the variables endpoint (v1): GET /v1/files/:file_key/variables
  const headers = { 'X-Figma-Token': token };

  try {
    console.log('Fetching variables from Figma file:', fileKey);
    const url = `https://api.figma.com/v1/files/${fileKey}/variables/local`;
    const res = await axios.get(url, { headers });
    const data = res.data;

    // data.meta.variableCollections and data.meta.variables
    const tokens = { 
      color: {}, 
      spacing: {}, 
      radius: {}, 
      typography: {}, 
      shadow: {}, 
      sizes: {} 
    };

    if (!data || !data.meta || !data.meta.variables) {
      console.warn('No variables found in Figma file. Ensure you published variables to this file.');
      console.log('Response data:', JSON.stringify(data, null, 2));
    }

    const variables = data.meta?.variables || {};

    // Iterate variables and categorize
    for (const [varId, vs] of Object.entries(variables)) {
      const name = vs.name; // e.g., color/primary
      
      // Get the default mode value
      const modeId = Object.keys(vs.valuesByMode || {})[0];
      if (!modeId) continue;
      
      const value = vs.valuesByMode[modeId];
      
      // Simple mapping heuristics based on name prefixes
      if (name.startsWith('color/') || name.startsWith('color.')) {
        const key = name.split('/')[1] || name.split('.')[1];
        tokens.color[key] = value;
      } else if (name.startsWith('space/') || name.startsWith('space.') || name.startsWith('spacing/')) {
        const key = name.split('/')[1] || name.split('.')[1];
        tokens.spacing[key] = Number(value);
      } else if (name.startsWith('radius/') || name.startsWith('radius.') || name.startsWith('borderRadius/')) {
        const key = name.split('/')[1] || name.split('.')[1];
        tokens.radius[key] = Number(value);
      } else if (name.startsWith('font/') || name.startsWith('font.')) {
        const key = name.split('/')[1] || name.split('.')[1];
        tokens.typography[key] = value;
      } else if (name.startsWith('shadow/') || name.startsWith('shadow.')) {
        const key = name.split('/')[1] || name.split('.')[1];
        tokens.shadow[key] = value;
      } else if (name.startsWith('size/') || name.startsWith('size.') || name.startsWith('sizes/')) {
        const key = name.split('/')[1] || name.split('.')[1];
        tokens.sizes[key] = Number(value);
      } else {
        // Fallback into a misc bucket preserving dot path
        tokens[name] = value;
      }
    }

    // Ensure output dir
    if (!fs.existsSync(OUT_DIR)) {
      fs.mkdirSync(OUT_DIR, { recursive: true });
    }

    fs.writeFileSync(OUT_JSON, JSON.stringify(tokens, null, 2), 'utf8');
    console.log('✅ Written tokens JSON to', OUT_JSON);
    console.log('📊 Synced', Object.keys(variables).length, 'variables from Figma');
    process.exit(0);
  } catch (err) {
    console.error('❌ Figma API request failed:', err.message || err.toString());
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', JSON.stringify(err.response.data, null, 2));
    }
    process.exit(2);
  }
}

main();

