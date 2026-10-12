#!/usr/bin/env node
// Bumps the app's version automatically, in one place, so every release gets
// a new alpha-0.0.x number without anyone having to remember to edit it by
// hand in several files. version.json is the single source of truth: the
// server (server.ts) and the client (storageService.ts) both read it.
//
// Usage: node scripts/bump-version.mjs
// Run manually before a release, or automatically by
// .github/workflows/version-bump.yml on every push to main.

import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const versionJsonPath = path.join(repoRoot, 'version.json');
const packageJsonPath = path.join(repoRoot, 'package.json');

const versionInfo = JSON.parse(readFileSync(versionJsonPath, 'utf-8'));

const match = versionInfo.version.match(/^alpha-(\d+)\.(\d+)\.(\d+)$/);
if (!match) {
  console.error(
    `version.json has an unexpected "version" format: "${versionInfo.version}". ` +
      'Expected "alpha-MAJOR.MINOR.PATCH" (e.g. "alpha-0.0.1"). Fix it by hand, then re-run this script.',
  );
  process.exit(1);
}

const [major, minor, patch] = match.slice(1).map(Number);
const nextVersion = `alpha-${major}.${minor}.${patch + 1}`;
const today = new Date().toISOString().slice(0, 10);

versionInfo.version = nextVersion;
versionInfo.releaseDate = today;
writeFileSync(versionJsonPath, JSON.stringify(versionInfo, null, 2) + '\n');

// Keep package.json's own "version" field (plain semver, no "alpha-" prefix,
// since that's what npm expects) loosely in sync for anyone who looks there.
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
packageJson.version = `${major}.${minor}.${patch + 1}`;
writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');

console.log(`Bumped app version: ${versionInfo.version} (was alpha-${major}.${minor}.${patch})`);
