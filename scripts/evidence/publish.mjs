// Publishes evidence-out/ to the orphan `evidence` branch under pr-<number>/ and prints
// a Markdown table for the PR description. Usage: `pnpm evidence:publish <pr-number>`.
// Uses git plumbing, so the working tree and current branch are never touched.
import { execFileSync } from 'node:child_process';
import { readdirSync } from 'node:fs';
import { join } from 'node:path';

const OUT_DIR = 'evidence-out';
const BRANCH = 'evidence';
const REMOTE_REF = 'refs/remotes/origin/evidence';

const pr = process.argv[2];
if (!/^\d+$/.test(pr ?? '')) {
  console.error('Usage: pnpm evidence:publish <pr-number>');
  process.exit(1);
}

const git = (args, input) =>
  execFileSync('git', args, { input, encoding: 'utf8', stdio: ['pipe', 'pipe', 'inherit'] }).trim();
const tryGit = (args) => {
  try {
    return git(args);
  } catch {
    return '';
  }
};

// git@github-personal:owner/repo.git or https://github.com/owner/repo(.git) → owner/repo
const slug = git(['remote', 'get-url', 'origin'])
  .replace(/^.*github[^:/]*[:/]/, '')
  .replace(/\.git$/, '');
const httpsUrl = `https://github.com/${slug}.git`;
// Push/fetch with the owner's gh credentials for these commands only (no global config change).
const withGh = ['-c', 'credential.helper=', '-c', 'credential.helper=!gh auth git-credential'];

tryGit([...withGh, 'fetch', '--quiet', httpsUrl, `+${BRANCH}:${REMOTE_REF}`]);
const parent = tryGit(['rev-parse', '--verify', '--quiet', REMOTE_REF]);

const files = readdirSync(OUT_DIR)
  .filter((file) => /\.(gif|png)$/.test(file))
  .sort();
if (files.length === 0) {
  console.error(`No evidence in ${OUT_DIR}/. Run pnpm evidence first.`);
  process.exit(1);
}

const prTree = git(
  ['mktree'],
  `${files
    .map((file) => `100644 blob ${git(['hash-object', '-w', join(OUT_DIR, file)])}\t${file}`)
    .join('\n')}\n`,
);
const otherEntries = parent
  ? git(['ls-tree', parent])
      .split('\n')
      .filter((line) => line && !line.endsWith(`\tpr-${pr}`))
  : [];
const rootTree = git(
  ['mktree'],
  `${[...otherEntries, `040000 tree ${prTree}\tpr-${pr}`].join('\n')}\n`,
);

const trailer = process.env.EVIDENCE_COMMIT_TRAILER
  ? `\n\n${process.env.EVIDENCE_COMMIT_TRAILER}`
  : '';
const message = `[DOCS] Add evidence for PR #${pr}${trailer}\n`;
const commit = git(['commit-tree', rootTree, ...(parent ? ['-p', parent] : [])], message);
git(['update-ref', `refs/heads/${BRANCH}`, commit]);
git([...withGh, 'push', '--quiet', httpsUrl, `${BRANCH}:${BRANCH}`]);

const raw = (file) => `https://raw.githubusercontent.com/${slug}/${BRANCH}/pr-${pr}/${file}`;
console.log(`Published ${files.length} files to ${BRANCH}/pr-${pr}.\n`);
console.log('| Feature | Evidence |\n| --- | --- |');
for (const file of files) {
  const label = file
    .replace(/^\d+-/, '')
    .replace(/\.(gif|png)$/, '')
    .replaceAll('-', ' ');
  const width = file.includes('mobile') ? 200 : 480;
  const cell = file.endsWith('.gif')
    ? `![${label}](${raw(file)})`
    : `<img src="${raw(file)}" width="${width}">`;
  console.log(`| ${label} | ${cell} |`);
}
