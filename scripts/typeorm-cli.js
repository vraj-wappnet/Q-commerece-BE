#!/usr/bin/env node

const path = require('path');
const { spawnSync } = require('child_process');

function hasDataSourceArg(argv) {
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '-d' || a === '--dataSource') return true;
    // Support common forms: -d=path or --dataSource=path
    if (typeof a === 'string' && (a.startsWith('-d=') || a.startsWith('--dataSource='))) return true;
  }
  return false;
}

const projectRoot = path.resolve(__dirname, '..');
const binName = process.platform === 'win32' ? 'typeorm.cmd' : 'typeorm';
const typeormBin = path.resolve(projectRoot, 'node_modules', '.bin', binName);

const args = process.argv.slice(2);

// If the caller already provided -d/--dataSource, don't append our default.
// If they didn't, point TypeORM CLI at the built (dist) datasource.
if (!hasDataSourceArg(args)) {
  args.push('-d', 'dist/src/config/typeorm.js');
}

const result = spawnSync(typeormBin, args, {
  cwd: projectRoot,
  stdio: 'inherit',
  env: process.env,
});

process.exit(result.status ?? 1);
