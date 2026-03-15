import { promises as fs } from 'node:fs';
import path from 'node:path';

import type { ProjectContext } from './types';

type PackageJson = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

function mergeDeps(pkg: PackageJson): Record<string, string> {
  return { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
}

function getDepVersion(deps: Record<string, string>, name: string): string | null {
  return deps[name] ?? null;
}

async function fileExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function readJsonFile<T>(filePath: string): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function detectProjectContext(projectRoot: string): Promise<ProjectContext> {
  const pkgPath = path.join(projectRoot, 'package.json');
  const pkg = (await readJsonFile<PackageJson>(pkgPath)) ?? {};
  const deps = mergeDeps(pkg);

  const frameworks: string[] = [];
  const languages: string[] = [];
  const styling: string[] = [];
  const tooling: string[] = [];

  const nextVersion = getDepVersion(deps, 'next');
  const reactVersion = getDepVersion(deps, 'react');
  const tsVersion = getDepVersion(deps, 'typescript');
  const tailwindVersion = getDepVersion(deps, 'tailwindcss');
  const sassVersion = getDepVersion(deps, 'sass');
  const eslintVersion = getDepVersion(deps, 'eslint');

  if (nextVersion) frameworks.push(`Next.js ${nextVersion}`);
  if (reactVersion) frameworks.push(`React ${reactVersion}`);

  if (tsVersion) languages.push('TypeScript');
  else languages.push('JavaScript');

  if (tailwindVersion) styling.push(`Tailwind CSS ${tailwindVersion}`);
  if (sassVersion) styling.push('Sass/SCSS');

  if (eslintVersion) tooling.push(`ESLint ${eslintVersion}`);

  const hasAppDir = await fileExists(path.join(projectRoot, 'app'));
  const hasPagesDir = await fileExists(path.join(projectRoot, 'pages'));
  if (nextVersion) {
    if (hasAppDir) frameworks.push('Next.js App Router');
    else if (hasPagesDir) frameworks.push('Next.js Pages Router');
  }

  const instructionCandidates = [
    'agent.md',
    'AGENTS.md',
    'CODEX.md',
    'CLAUDE.md',
    '.cursorrules',
    '.github/copilot-instructions.md',
    '.github/CONTRIBUTING.md',
  ];

  const instructionFiles: string[] = [];
  for (const rel of instructionCandidates) {
    const abs = path.join(projectRoot, rel);
    if (await fileExists(abs)) instructionFiles.push(rel);
  }

  const notes: string[] = [];
  if (await fileExists(path.join(projectRoot, 'tailwind.config.ts'))) notes.push('Tailwind config present');
  if (await fileExists(path.join(projectRoot, 'postcss.config.mjs'))) notes.push('PostCSS config present');
  if (await fileExists(path.join(projectRoot, 'tsconfig.json'))) notes.push('TypeScript config present');

  return {
    project_root: projectRoot,
    frameworks: Array.from(new Set(frameworks)),
    languages: Array.from(new Set(languages)),
    styling: Array.from(new Set(styling)),
    tooling: Array.from(new Set(tooling)),
    instruction_files: instructionFiles,
    notes: notes.length > 0 ? notes : undefined,
  };
}
