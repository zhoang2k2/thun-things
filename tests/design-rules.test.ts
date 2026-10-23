import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

import { describe, expect, it } from 'vitest';

// Enforces design rules DR-1 (no radius) and DR-2 (no gradients, Hugeicons only)
// from docs/superpowers/specs/2026-10-23-ui-direction-v3-design.md.

const ROOT = join(__dirname, '..');
const SCANNED_DIRS = ['app', 'components', 'lib'];
const SCANNED_EXTENSIONS = ['.ts', '.tsx', '.css'];
// The hover-card glass layer is the only element allowed to curve (V-25).
const GLASS_LAYER_SEGMENT = `${sep}glass${sep}`;

const listSourceFiles = (dir: string): string[] => {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }
  return entries.flatMap((entry) => {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) return listSourceFiles(path);
    if (!SCANNED_EXTENSIONS.some((ext) => path.endsWith(ext))) return [];
    if (path.endsWith('.test.ts') || path.endsWith('.test.tsx')) return [];
    return [path];
  });
};

const sourceFiles = SCANNED_DIRS.flatMap((dir) => listSourceFiles(join(ROOT, dir)));

const findViolations = (pattern: RegExp, skipGlass = false) =>
  sourceFiles
    .filter((file) => !(skipGlass && file.includes(GLASS_LAYER_SEGMENT)))
    .filter((file) => pattern.test(readFileSync(file, 'utf8')))
    .map((file) => relative(ROOT, file));

describe('design rules', () => {
  it('scans the source tree', () => {
    expect(sourceFiles.length).toBeGreaterThan(0);
  });

  it('uses no radius outside the glass layer', () => {
    expect(findViolations(/\brounded(-[a-z0-9[\]]+)?\b/, true)).toEqual([]);
    expect(findViolations(/border-radius:(?!\s*0\s*[;}!])/, true)).toEqual([]);
  });

  it('uses no gradients', () => {
    expect(
      findViolations(
        /bg-gradient-|bg-linear-|bg-radial-|bg-conic-|linear-gradient\(|radial-gradient\(|conic-gradient\(/,
      ),
    ).toEqual([]);
  });

  it('uses Hugeicons instead of lucide', () => {
    expect(findViolations(/lucide-react/)).toEqual([]);
  });
});
