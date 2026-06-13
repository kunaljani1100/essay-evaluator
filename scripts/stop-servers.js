#!/usr/bin/env node

const { execSync } = require('child_process');

const ports = [3000, 3001];

for (const port of ports) {
  try {
    const pids = execSync(`lsof -ti :${port}`, { encoding: 'utf8' }).trim();
    if (pids) {
      execSync(`kill -9 ${pids.split('\n').join(' ')}`);
      console.log(`Stopped process(es) on port ${port}`);
    }
  } catch {
    // No process listening on this port.
  }
}

console.log('Local dev servers stopped.');
