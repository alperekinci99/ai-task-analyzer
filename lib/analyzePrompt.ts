import type { AnalysisMode, ProjectContext, PromptAnalysis } from './types';

const LIMITS: PromptAnalysis['breakdown'] = {
  goal_clarity: 20,
  context_completeness: 20,
  output_specification: 15,
  constraints: 10,
  edge_cases: 10,
  tool_instructions: 10,
  definition_of_done: 10,
  token_efficiency: 5,
};

const ACTION_VERBS = [
  'refactor',
  'refactor et',
  'create',
  'oluştur',
  'yap',
  'geliştir',
  'build',
  'inşa et',
  'fix',
  'düzelt',
  'add',
  'ekle',
  'implement',
  'uygula',
  'write',
  'yaz',
  'generate',
  'üret',
  'remove',
  'kaldır',
  'update',
  'güncelle',
  'migrate',
  'taşı',
  'optimize',
  'optimize et',
];

type TechTerm =
  | 'react'
  | 'next.js'
  | 'typescript'
  | 'javascript'
  | 'node'
  | 'tailwind'
  | 'scss'
  | 'app router'
  | 'api route'
  | 'app directory';

function detectTechMatches(text: string): TechTerm[] {
  const hits = new Set<TechTerm>();

  // Canonicalize common variants so they never count twice.
  if (/\breact\b/i.test(text)) hits.add('react');
  if (/\bnext(?:\.js)?\b/i.test(text)) hits.add('next.js');
  if (/\btypescript\b/i.test(text)) hits.add('typescript');
  if (/\bjavascript\b/i.test(text)) hits.add('javascript');
  if (/\bnode(?:\.js)?\b/i.test(text)) hits.add('node');
  if (/\btailwind\b/i.test(text)) hits.add('tailwind');

  // Styling keywords.
  if (/\bmodule\s+scss\b/i.test(text)) hits.add('scss');
  else if (/\bscss\b|\bsass\b/i.test(text)) hits.add('scss');

  // Next.js-specific structural hints.
  if (/\bapp\s+router\b/i.test(text)) hits.add('app router');
  if (/\bapi\s+route\b/i.test(text)) hits.add('api route');
  if (/\bapp\s+directory\b/i.test(text)) hits.add('app directory');

  return Array.from(hits);
}

const AGENT_CONFLICT_TERMS = [
  // Backend / different ecosystems that often signal a mismatch for a Next/React repo.
  'php',
  'laravel',
  'symfony',
  'wordpress',
  'django',
  'flask',
  'fastapi',
  'rails',
  'ruby on rails',
  'spring boot',
  'asp.net',
  'dotnet',
  '.net',
  // Mobile
  'flutter',
  'android',
  'ios',
  // Unrelated UI stacks
  'vue',
  'nuxt',
  'svelte',
  'angular',
];

const OUTPUT_SPEC_PHRASES = [
  'return full code',
  'give full code',
  'tam kod',
  'tüm kod',
  'tamamını ver',
  'tam dosya',
  'full code',
  'full component',
  'complete component',
  'tam component',
  'tam bileşen',
  'only diff',
  'diff only',
  'sadece diff',
  'yalnızca diff',
  'sadece değişiklikler',
  'sadece fark',
  'patch only',
  'sadece patch',
  'yalnızca patch',
  'unified diff',
  'patch',
  'json output',
  'return json',
  'json çıktısı',
  'json output',
  'json format',
  'json döndür',
  'step by step',
  'steps',
  'adım adım',
  'adim adim',
  'adımlar',
  'adimlar',
  'output format',
  'çıktı formatı',
  'cikti formati',
  'beklenen çıktı',
  'beklenen cikti',
];

const CONSTRAINT_PHRASES = [
  'do not change props',
  "don't change props",
  'props değişmesin',
  'props degismasin',
  'props değiştirme',
  'props degistirme',
  'keep existing api',
  'public api',
  'mevcut api',
  'mevcut api kalsın',
  'public api değişmesin',
  'public api degismasin',
  'do not break',
  "don't break",
  'bozma',
  'bozulmasın',
  'bozulmasin',
  'use module scss',
  'module scss kullan',
  'modül scss kullan',
  'modul scss kullan',
  'no new dependencies',
  'do not add dependencies',
  'yeni dependency ekleme',
  'yeni bağımlılık ekleme',
  'yeni bagimlilik ekleme',
  'dependency ekleme',
  'bağımlılık ekleme',
  'bagimlilik ekleme',
  'do not change',
  'değiştirme',
  'degistirme',
  'must not change',
  'kesinlikle değişmesin',
  'kesinlikle degismasin',
];

const EDGE_CASE_TERMS = [
  'loading',
  'yükleniyor',
  'yukleniyor',
  'error',
  'hata',
  'empty state',
  'boş durum',
  'bos durum',
  'empty',
  'boş',
  'bos',
  'null',
  'undefined',
  'responsive',
  'mobil',
  'tablet',
  'mobile',
  'desktop',
  'retry',
  'tekrar dene',
  'yeniden dene',
  'timeout',
  'zaman aşımı',
  'zaman asimi',
];

const TOOL_ENV_TERMS = [
  'next 14',
  'next.js 14',
  'nextjs 14',
  'next.js sürüm',
  'next sürüm',
  'surum',
  'sürüm',
  'node 18',
  'node 20',
  'node sürüm',
  'node surum',
  'typescript',
  'app router',
  'client component',
  'server component',
  'edge runtime',
  'nodejs runtime',
];

const AMBIGUOUS_PHRASES = [
  'make it better',
  'optimize it',
  'make it clean',
  'modernize it',
  'use best practices',
  'improve it',
  'better structure',
  'daha iyi yap',
  'daha iyi hale getir',
  'iyileştir',
  'iyilestir',
  'optimize et',
  'temizle',
  'modernleştir',
  'modernlestir',
  'best practice',
  'en iyi pratikler',
  'daha iyi bir yapı',
  'daha iyi yapı',
];

const STOPWORDS = new Set([
  'the',
  'a',
  'an',
  'and',
  'or',
  'to',
  'of',
  'in',
  'on',
  'for',
  'with',
  'is',
  'are',
  'be',
  'as',
  'this',
  'that',
  'it',
  'i',
  'we',
  'you',
]);

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function normalize(text: string): string {
  return text
    .toLowerCase()
    .replace(/\r\n/g, '\n')
    .replace(/[\t ]+/g, ' ')
    .trim();
}

function wordList(text: string): string[] {
  return text
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

function matchedPhrases(text: string, phrases: string[]): string[] {
  return phrases.filter((p) => text.includes(p));
}

function uniqueMatches(text: string, phrases: string[]): string[] {
  return Array.from(new Set(matchedPhrases(text, phrases)));
}

function extractRuleHighlights(rulesMd: string): string[] {
  const lines = rulesMd
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const picked: string[] = [];
  for (const line of lines) {
    const unbulleted = line.replace(/^(?:-|||\*|\d+\.)\s+/, '').trim();
    if (!unbulleted) continue;

    if (/(?:do not|don't|dont|must|should|never)\b/i.test(unbulleted)) picked.push(unbulleted);
    else if (/(?:kullanma|yasak|yapma|etme|zorunlu|gerekmeli|şart|sart)\b/i.test(unbulleted)) picked.push(unbulleted);
    else if (/acceptance criteria|definition of done|test/i.test(unbulleted)) picked.push(unbulleted);
    if (picked.length >= 5) break;
  }

  return Array.from(new Set(picked)).slice(0, 5);
}

function hasNoNewDepsRule(text: string): boolean {
  return /no new dependencies|do not add dependencies|don't add dependencies|yeni (dependency|bağımlılık|bagimlilik) ekleme|dependency ekleme|bağımlılık ekleme/i.test(
    text,
  );
}

function promptSuggestsAddingDeps(text: string): boolean {
  return /\b(npm install|yarn add|pnpm add)\b|\b(add|install)\s+(a\s+)?(new\s+)?(dependency|package)\b|\bdependency\s+ekle\b|\bpaket\s+ekle\b/i.test(
    text,
  );
}

function detectFileTargets(original: string): string[] {
  const raw = original.replace(/\r\n/g, '\n');

  // Typical repo-relative paths.
  const pathLikeRe = /(?:(?:^|\s|`|"|')((?:[A-Za-z0-9_.-]+\/)+[A-Za-z0-9_.-]+\.(?:ts|tsx|js|jsx|json|md|css|scss|sass|yml|yaml)))(?=$|\s|`|"|'|[.,;:!?\)])?/g;
  // Common single-file references without a directory.
  const fileNameRe = /(?:(?:^|\s|`|"|')((?:package\.json|tsconfig\.json|README\.md|next\.config\.(?:js|mjs)|tailwind\.config\.(?:js|ts)|postcss\.config\.(?:js|mjs))))(?=$|\s|`|"|'|[.,;:!?\)])?/gi;
  // Explicit labels.
  const labeledRe = /(?:dosya|file|path|filepath)\s*:\s*([^\n]+)/gi;

  const hits: string[] = [];

  for (const match of raw.matchAll(pathLikeRe)) {
    const candidate = (match[1] ?? '').trim();
    if (!candidate) continue;
    if (/^https?:\/\//i.test(candidate)) continue;
    hits.push(candidate);
  }

  for (const match of raw.matchAll(fileNameRe)) {
    const candidate = (match[1] ?? '').trim();
    if (!candidate) continue;
    hits.push(candidate);
  }

  for (const match of raw.matchAll(labeledRe)) {
    const candidate = (match[1] ?? '').trim();
    if (!candidate) continue;
    const m2 = candidate.match(/((?:[A-Za-z0-9_.-]+\/)+[A-Za-z0-9_.-]+\.(?:ts|tsx|js|jsx|json|md|css|scss|sass|yml|yaml))/);
    if (m2?.[1]) hits.push(m2[1]);
  }

  return Array.from(new Set(hits)).slice(0, 5);
}

function inferredTechTerms(ctx: ProjectContext | undefined): string[] {
  if (!ctx) return [];
  const joined = [...(ctx.frameworks ?? []), ...(ctx.languages ?? []), ...(ctx.styling ?? []), ...(ctx.tooling ?? [])]
    .join(' ')
    .toLowerCase();

  const terms: string[] = [];
  if (joined.includes('next')) terms.push('next.js');
  if (joined.includes('react')) terms.push('react');
  if (joined.includes('typescript')) terms.push('typescript');
  if (joined.includes('tailwind')) terms.push('tailwind');
  if (joined.includes('sass') || joined.includes('scss')) terms.push('scss');
  if (joined.includes('node')) terms.push('node');
  return Array.from(new Set(terms));
}

function detectStackConflicts(text: string, ctx: ProjectContext | undefined): string[] {
  if (!ctx) return [];
  const inferred = inferredTechTerms(ctx);
  const normalized = text.toLowerCase();

  // Only treat these as conflicts when we're fairly sure the repo is a JS/Next/React app.
  const repoIsNextReact = inferred.includes('next.js') || inferred.includes('react');
  if (!repoIsNextReact) return [];

  const hits = uniqueMatches(normalized, AGENT_CONFLICT_TERMS);
  if (hits.length === 0) return [];

  const lines = normalized.split('\n');
  const negations = ["do not", "don't", 'dont', 'not', 'no', 'kullanma', 'kullanmayin', 'kullanmayın'];

  return hits.filter((term) => {
    const termLower = term.toLowerCase();
    for (const line of lines) {
      const idx = line.indexOf(termLower);
      if (idx === -1) continue;

      // If the line contains a negation shortly before the term, treat as non-conflict.
      const windowStart = Math.max(0, idx - 30);
      const prefix = line.slice(windowStart, idx);
      if (negations.some((n) => prefix.includes(n))) return false;
    }
    return true;
  });
}

function detectVersionLike(text: string): boolean {
  return /(next\.?js\s*\d+|node\s*\d+|react\s*\d+|typescript\s*\d+)/i.test(text);
}

function getFirstLine(text: string): string {
  const line = text.split('\n').map((l) => l.trim()).find((l) => l.length > 0);
  return line ? line : '';
}

const SECTION_HEADER_RE = /^\s*(objective|context|constraints|expected output|acceptance criteria)\s*:\s*(.*)$/i;

function isSectionHeaderLine(line: string): boolean {
  return SECTION_HEADER_RE.test(line.trim());
}

function extractSection(original: string, header: string): string | null {
  const lines = original.replace(/\r\n/g, '\n').split('\n');
  const headerLower = header.toLowerCase();

  let inSection = false;
  const collected: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const match = line.match(SECTION_HEADER_RE);

    if (match) {
      const foundHeader = match[1].toLowerCase();
      const inlineValue = (match[2] ?? '').trim();

      if (foundHeader === headerLower) {
        inSection = true;
        if (inlineValue) collected.push(inlineValue);
        continue;
      }

      if (inSection) break;
      continue;
    }

    if (inSection) collected.push(line);
  }

  const value = collected
    .join('\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .join('\n')
    .trim();

  return value.length > 0 ? value : null;
}

function getFirstMeaningfulLine(original: string): string {
  const lines = original.replace(/\r\n/g, '\n').split('\n');
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (isSectionHeaderLine(line)) continue;
    return line;
  }
  return '';
}

function getAcceptanceLikeLines(original: string): string[] {
  const lines = original
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const picked: string[] = [];
  for (const line of lines) {
    if (/^(?:-|\*|\d+\.|•)\s+/.test(line)) picked.push(line.replace(/^(?:-|\*|\d+\.|•)\s+/, ''));
    else if (/(acceptance criteria|definition of done|completed when|done when)/i.test(line)) picked.push(line);
    else if (/\b(must|should)\b|\b(gerekmeli|zorunlu|şart|sart)\b/i.test(line) && line.length <= 140)
      picked.push(line);
  }

  return Array.from(new Set(picked)).slice(0, 6);
}

function hasDefinitionOfDoneSignal(text: string): boolean {
  return (
    text.includes('acceptance criteria') ||
    text.includes('definition of done') ||
    text.includes('kabul kriter') ||
    text.includes('kabul kriterleri') ||
    text.includes('tamamlanma kriter') ||
    text.includes('tamamlanma kriterleri')
  );
}

function hasTestSignal(text: string): boolean {
  return /\btest\b|\btests\b|testler|unit test|e2e|entegrasyon testi|integration test/i.test(text);
}

function hasMustShouldSignal(text: string): boolean {
  return /\b(must|should)\b|\b(gerekmeli|zorunlu|şart|sart)\b/i.test(text);
}

function tokenEfficiencyScore(original: string): { score: number; issue?: string; suggestion?: string } {
  const trimmed = original.trim();
  if (trimmed.length === 0) return { score: 0, issue: 'Prompt is empty.', suggestion: 'Add a clear 1–2 sentence task description.' };

  const words = wordList(trimmed);
  const total = words.length;
  const normalizedWords = words.map((w) => w.toLowerCase());
  const meaningful = normalizedWords.filter((w) => w.length >= 3 && !STOPWORDS.has(w));
  const uniqueMeaningful = new Set(meaningful);
  const uniqueness = meaningful.length === 0 ? 1 : uniqueMeaningful.size / meaningful.length;

  // Detect heavy repetition of the same meaningful word.
  const freq = new Map<string, number>();
  for (const w of meaningful) freq.set(w, (freq.get(w) ?? 0) + 1);
  const maxFreq = Array.from(freq.values()).reduce((m, v) => Math.max(m, v), 0);

  let score = 3;
  if (total < 6) score = 1;
  if (total >= 12 && total <= 120) score = 4;
  if (trimmed.length > 1500 || total > 250) score = 2;
  if (uniqueness < 0.45 || maxFreq >= 10) score = Math.min(score, 2);
  if (uniqueness > 0.65 && total >= 10 && total <= 140) score = Math.max(score, 5);

  const issueParts: string[] = [];
  const suggestionParts: string[] = [];
  if (total < 6) {
    issueParts.push('The prompt is too short and may be missing important details.');
    suggestionParts.push('Clarify the scope, context, and output format with 1–2 extra sentences.');
  }
  if (trimmed.length > 1500 || total > 250) {
    issueParts.push('The prompt is longer than necessary and may waste tokens.');
    suggestionParts.push('Remove repetitive sentences and use short, sectioned bullet points instead.');
  }
  if (uniqueness < 0.45 || maxFreq >= 10) {
    issueParts.push('Repeated phrases were detected; token efficiency may be lower than expected.');
    suggestionParts.push('Combine repetitive points instead of repeating the same words or sentences.');
  }

  return {
    score: clamp(score, 0, LIMITS.token_efficiency),
    issue: issueParts[0],
    suggestion: suggestionParts[0],
  };
}

export async function analyzePrompt(
  prompt: string,
  options?: { mode?: AnalysisMode; projectContext?: ProjectContext; projectRulesMd?: string },
): Promise<PromptAnalysis> {
  const original = prompt ?? '';
  const text = normalize(original);
  const words = wordList(text);

  const mode: AnalysisMode = options?.mode ?? 'standalone';
  const projectContext = options?.projectContext;
  const inferredTerms = inferredTechTerms(projectContext);

  const projectRulesMdRaw = options?.projectRulesMd ?? '';
  const projectRulesMd = mode === 'agent' ? projectRulesMdRaw.trim() : '';
  const hasProjectRules = projectRulesMd.length > 0;
  const rulesText = hasProjectRules ? normalize(projectRulesMd) : '';
  const ruleHighlights = hasProjectRules ? extractRuleHighlights(projectRulesMd) : [];

  const fileTargets = detectFileTargets(original);
  const hasFileTargets = fileTargets.length > 0;

  const warnings: string[] = [];
  const issues: string[] = [];
  const suggestions: string[] = [];
  const detected_strengths: string[] = [];

  const ambiguous = uniqueMatches(text, AMBIGUOUS_PHRASES);
  if (ambiguous.length > 0) {
    for (const phrase of ambiguous) warnings.push(`Ambiguous phrase detected: "${phrase}"`);
    issues.push('The prompt contains ambiguous instructions; scope and success criteria are unclear.');
    suggestions.push('Replace ambiguous phrases with measurable goals and explicit acceptance criteria.');
  }

  // Goal clarity (0-20)
  const verbMatches = uniqueMatches(text, ACTION_VERBS);
  let goal = 6;
  if (verbMatches.length > 0) goal += 9;
  goal += clamp((verbMatches.length - 1) * 2, 0, 4);
  if (words.length >= 12) goal += 2;
  if (words.length >= 24) goal += 1;
  if (words.length < 6) goal -= 8;
  if (words.length < 10) goal -= 3;
  if (ambiguous.length > 0 && verbMatches.length === 0) goal -= 4;
  goal = clamp(Math.round(goal), 0, LIMITS.goal_clarity);
  if (verbMatches.length > 0) detected_strengths.push('Contains clear action verbs.');
  else {
    issues.push('The objective/action is unclear; add an action verb like refactor, create, or fix.');
    suggestions.push('Clarify the objective in a single sentence (for example: "Create ...", "Refactor ...").');
  }

  // Context completeness (0-20)
  const techMatches = detectTechMatches(text);

  const stackConflicts = mode === 'agent' ? detectStackConflicts(text, projectContext) : [];
  if (stackConflicts.length > 0) {
    warnings.push(`The prompt may conflict with the repo stack: ${stackConflicts.join(', ')}`);
    issues.push('The prompt may include technology directions that are incompatible with the current repo/stack.');
    suggestions.push('If you are using Agent Mode, stay aligned with the repo stack or explicitly state that you want to override it.');
  }

  let context = 2;
  if (techMatches.length > 0) context += 10;
  else if (mode === 'agent' && inferredTerms.length > 0) context += 8;
  context += clamp((techMatches.length - 1) * 2, 0, 8);
  if (
    /repo|codebase|existing|provided|component|api|endpoint|route|proje|projede|projemde|mevcut|var olan|kod taban[ıi]|bileşen|bilesen/i.test(
      text,
    )
  )
    context += 2;

  if (mode === 'agent') {
    if (hasProjectRules) {
      context += 2;
      detected_strengths.push('Project rules were provided (Agent Mode).');
    }

    if (hasFileTargets) {
      context += 2;
      detected_strengths.push('Target file/path specified (Agent Mode).');
    } else {
      context -= 3;
      warnings.push('Agent Mode: No target file was specified; the agent may scan unnecessary files (token/time cost).');
      issues.push('No target file/path was specified; this may create unnecessary scanning cost in larger repos.');
      suggestions.push('Specify which file(s) should be edited (for example: `app/page.tsx`, `components/Foo.tsx`).');
    }

  }

  if (mode === 'agent' && inferredTerms.length > 0 && techMatches.length === 0) {
    detected_strengths.push("Repo context/stack can be inferred (Agent Mode).");
  }
  context = clamp(Math.round(context), 0, LIMITS.context_completeness);
  if (techMatches.length > 0) detected_strengths.push('Technology/stack context is specified.');
  else {
    if (mode === 'standalone') {
      issues.push('Context/technology details are missing (for example: React, Next.js, TypeScript).');
      suggestions.push('Specify your stack and versions if relevant (for example: Next.js 14, TypeScript).');
    } else {
      suggestions.push('In Agent Mode, the stack can usually be inferred from the repo; only specify technologies/versions if you want to override them.');
    }
  }

  // Output specification (0-15)
  const outputMatches = uniqueMatches(text, OUTPUT_SPEC_PHRASES);
  let output = 2;
  if (outputMatches.length > 0) output += 10;
  output += clamp((outputMatches.length - 1) * 2, 0, 3);
  if (/json|diff|patch|code|component|endpoint/i.test(text)) output += 1;
  output = clamp(Math.round(output), 0, LIMITS.output_specification);
  if (outputMatches.length > 0) detected_strengths.push('Includes clues about the desired output format.');
  else {
    issues.push('The expected output format is not specified (code/diff/JSON/etc.).');
    suggestions.push('Clearly specify the expected output: full code, diff only, JSON format, and so on.');
  }

  // Constraints (0-10)
  const constraintMatches = uniqueMatches(text, CONSTRAINT_PHRASES);
  const ruleConstraintMatches = mode === 'agent' && hasProjectRules ? uniqueMatches(rulesText, CONSTRAINT_PHRASES) : [];
  const allConstraintMatches = Array.from(new Set([...constraintMatches, ...ruleConstraintMatches]));
  let constraints = 0;
  if (allConstraintMatches.length > 0) constraints += 6;
  constraints += clamp((allConstraintMatches.length - 1) * 2, 0, 4);
  constraints = clamp(Math.round(constraints), 0, LIMITS.constraints);
  if (allConstraintMatches.length > 0) {
    detected_strengths.push('Constraints/guardrails are specified.');
  } else {
    suggestions.push('Add constraints if relevant (for example: keep the public API/props unchanged, do not add new dependencies).');
  }

  if (mode === 'agent' && hasProjectRules && hasNoNewDepsRule(projectRulesMd) && promptSuggestsAddingDeps(original)) {
    warnings.push('Project rules say “do not add new dependencies”; the prompt may be implying a new dependency.');
    issues.push('The prompt may conflict with the project rules (dependency constraint).');
    suggestions.push('If you must add a dependency, justify it explicitly or say that you are overriding the rule.');
  }

  // Edge cases (0-10)
  const edgeMatches = uniqueMatches(text, EDGE_CASE_TERMS);
  let edge = 0;
  if (edgeMatches.length > 0) edge += 6;
  edge += clamp(edgeMatches.length, 0, 4);
  edge = clamp(Math.round(edge), 0, LIMITS.edge_cases);
  if (edgeMatches.length > 0) detected_strengths.push('Mentions edge cases (loading/error/empty state/etc.).');
  else {
    issues.push('Edge cases are missing (loading/error/empty state/etc.).');
    suggestions.push('Specify at least 2–3 edge cases (loading, error, empty state, null/undefined).');
  }

  // Tool / environment instructions (0-10)
  const toolMatches = Array.from(new Set([...uniqueMatches(text, TOOL_ENV_TERMS), ...(detectVersionLike(text) ? ['version'] : [])]));
  const ruleToolMatches =
    mode === 'agent' && hasProjectRules
      ? Array.from(new Set([...uniqueMatches(rulesText, TOOL_ENV_TERMS), ...(detectVersionLike(projectRulesMd) ? ['version'] : [])]))
      : [];
  let tool = 0;
  if (toolMatches.length > 0) tool += 6;
  else if (mode === 'agent' && ruleToolMatches.length > 0) tool += 6;
  if (detectVersionLike(text)) tool += 2;
  else if (mode === 'agent' && hasProjectRules && detectVersionLike(projectRulesMd)) tool += 2;
  if (text.includes('app router') || text.includes('client component') || text.includes('server component')) tool += 1;
  else if (mode === 'agent' && hasProjectRules && /app router|client component|server component/i.test(projectRulesMd)) tool += 1;
  tool += techMatches.length > 0 ? 1 : 0;
  if (mode === 'agent' && toolMatches.length === 0 && inferredTerms.length > 0) tool = Math.max(tool, 4);
  tool = clamp(Math.round(tool), 0, LIMITS.tool_instructions);
  if (toolMatches.length > 0) detected_strengths.push('Includes tool/environment instructions (version/runtime/etc.).');
  else {
    if (mode === 'agent') {
      if (inferredTerms.length === 0) {
        suggestions.push('Clarify the working environment (framework version, App Router, Node version, etc.).');
      } else if (!(hasProjectRules && ruleToolMatches.length > 0)) {
        suggestions.push('If you plan to override the environment, clearly state the version/runtime differences (for example: Node 20, Next.js 14.2.x).');
      }
    } else {
      suggestions.push('Clarify the working environment (framework version, App Router, Node version, etc.).');
    }
  }

  // Definition of done (0-10)
  let dod = 0;
  const dodText = mode === 'agent' && hasProjectRules ? `${text}\n${rulesText}` : text;
  if (hasDefinitionOfDoneSignal(dodText)) dod += 6;
  if (hasTestSignal(dodText)) dod += 3;
  if (hasMustShouldSignal(text)) dod += 1;
  dod = clamp(Math.round(dod), 0, LIMITS.definition_of_done);
  if (dod >= 6) detected_strengths.push('Includes a definition of done / acceptance criteria approach.');
  else {
    issues.push('The definition of done / acceptance criteria is unclear.');
    suggestions.push('Add completion criteria as bullet points (tests should pass, behavior X should hold, etc.).');
  }

  // Token efficiency (0-5)
  const tokenEval = tokenEfficiencyScore(original);
  let token = clamp(Math.round(tokenEval.score), 0, LIMITS.token_efficiency);
  if (mode === 'agent' && hasFileTargets) token = clamp(token + 1, 0, LIMITS.token_efficiency);
  if (tokenEval.issue) issues.push(tokenEval.issue);
  if (tokenEval.suggestion) suggestions.push(tokenEval.suggestion);

  // Additional issues: ambiguous-only prompts
  if (words.length <= 8 && ambiguous.length > 0) {
    issues.push('The prompt is too general and ambiguous; it is not an actionable task description.');
    suggestions.push('Add a concrete task, context, constraints, and output format.');
  }

  // Deduplicate issues/suggestions
  const uniqIssues = Array.from(new Set(issues)).filter(Boolean);
  const uniqSuggestions = Array.from(new Set(suggestions)).filter(Boolean);
  const uniqWarnings = Array.from(new Set(warnings)).filter(Boolean);
  const uniqStrengths = Array.from(new Set(detected_strengths)).filter(Boolean);

  const breakdown: PromptAnalysis['breakdown'] = {
    goal_clarity: goal,
    context_completeness: context,
    output_specification: output,
    constraints,
    edge_cases: edge,
    tool_instructions: tool,
    definition_of_done: dod,
    token_efficiency: token,
  };

  const score = (Object.keys(breakdown) as Array<keyof PromptAnalysis['breakdown']>).reduce(
    (acc, key) => acc + breakdown[key],
    0,
  );

  // Template-based optimized prompt (no AI, no fabrication)
  const extractedObjective = extractSection(original, 'Objective');
  const extractedContext = extractSection(original, 'Context');
  const extractedConstraints = extractSection(original, 'Constraints');
  const extractedExpectedOutput = extractSection(original, 'Expected Output');
  const extractedAcceptance = extractSection(original, 'Acceptance Criteria');

  const objectiveCandidate = extractedObjective ?? getFirstMeaningfulLine(original) ?? getFirstLine(original) ?? original.trim();
  const objective = objectiveCandidate && objectiveCandidate.trim().length > 0 ? objectiveCandidate.trim() : 'Not specified — recommended to add';

  const computedContextText =
    mode === 'agent'
      ? [
          hasFileTargets ? `Target files: ${fileTargets.join(', ')}` : 'Target files: Not specified (recommended)',
          hasProjectRules
            ? ruleHighlights.length > 0
              ? `Project rules (summary):\n${ruleHighlights.map((l) => `- ${l}`).join('\n')}`
              : 'Project rules: Provided'
            : null,
          'Repo context is assumed; explicitly state any overrides.',
        ]
          .filter(Boolean)
          .join('\n')
      : techMatches.length > 0
        ? `Technologies: ${techMatches.map((t) => (t === 'next.js' ? 'Next.js' : t)).join(', ')}`
        : 'Not specified — recommended to add (for example: React/Next.js/TypeScript versions)';
  const contextText = extractedContext ?? computedContextText;

  const computedConstraintsText =
    constraintMatches.length > 0
      ? constraintMatches.map((c) => `- ${c}`).join('\n')
      : '- Not specified — recommended to add (for example: keep public API/props unchanged, do not add new dependencies)';
  const constraintsText = extractedConstraints ?? computedConstraintsText;

  const computedExpectedOutputText =
    outputMatches.length > 0
      ? `- Detected desired output format signal: ${outputMatches.join(', ')}`
      : '- Not specified — recommended to add (for example: full code, diff only, JSON schema)';
  const expectedOutputText = extractedExpectedOutput ?? computedExpectedOutputText;

  const acceptanceLines = getAcceptanceLikeLines(original);
  const computedAcceptanceText =
    acceptanceLines.length > 0
      ? acceptanceLines.map((l) => `- ${l}`).join('\n')
      : '- Not specified — recommended to add (for example: tests should pass, UI should remain intact, edge cases should be handled)';
  const acceptanceText = extractedAcceptance ?? computedAcceptanceText;

  const optimized_prompt = [
    'Objective:',
    objective,
    '',
    'Context:',
    contextText,
    '',
    'Constraints:',
    constraintsText,
    '',
    'Expected Output:',
    expectedOutputText,
    '',
    'Acceptance Criteria:',
    acceptanceText,
  ].join('\n');

  return {
    score: clamp(score, 0, 100),
    mode,
    ...(mode === 'agent' && projectContext ? { project_context: projectContext } : {}),
    breakdown,
    issues: uniqIssues,
    suggestions: uniqSuggestions,
    optimized_prompt,
    ...(uniqWarnings.length > 0 ? { warnings: uniqWarnings } : {}),
    ...(uniqStrengths.length > 0 ? { detected_strengths: uniqStrengths } : {}),
  };
}
