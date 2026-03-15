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
  if (trimmed.length === 0) return { score: 0, issue: 'Prompt boş.', suggestion: 'En az 1-2 cümlelik net bir task açıklaması ekleyin.' };

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
    issueParts.push('Prompt çok kısa; gerekli detaylar eksik olabilir.');
    suggestionParts.push('Kapsam, bağlam ve çıktı formatını 1-2 ek cümleyle netleştirin.');
  }
  if (trimmed.length > 1500 || total > 250) {
    issueParts.push('Prompt gereğinden uzun; gereksiz token kullanımı riski var.');
    suggestionParts.push('Tekrarlayan cümleleri çıkarıp, bölümlere ayrılmış kısa maddeler kullanın.');
  }
  if (uniqueness < 0.45 || maxFreq >= 10) {
    issueParts.push('Tekrarlı ifadeler tespit edildi; token verimliliği düşebilir.');
    suggestionParts.push('Aynı kelimeleri/cümleleri tekrarlamak yerine maddeleri birleştirin.');
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
    for (const phrase of ambiguous) warnings.push(`Muğlak ifade tespit edildi: "${phrase}"`);
    issues.push('Muğlak talimatlar var; kapsam ve başarı ölçütleri net değil.');
    suggestions.push('Muğlak ifadeleri ölçülebilir hedefler ve net acceptance criteria ile değiştirin.');
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
  if (verbMatches.length > 0) detected_strengths.push('Net aksiyon fiilleri içeriyor.');
  else {
    issues.push('Amaç/eylem net değil; refactor/create/fix gibi bir aksiyon fiili eklenmeli.');
    suggestions.push('Hedefi tek cümlede netleştirin (örn: "Create ...", "Refactor ...").');
  }

  // Context completeness (0-20)
  const techMatches = detectTechMatches(text);

  const stackConflicts = mode === 'agent' ? detectStackConflicts(text, projectContext) : [];
  if (stackConflicts.length > 0) {
    warnings.push(`Prompt, repo stack'i ile çelişebilir: ${stackConflicts.join(', ')}`);
    issues.push('Prompt, mevcut repo/stack ile uyumsuz teknoloji yönlendirmeleri içeriyor olabilir.');
    suggestions.push('Agent mode kullanıyorsanız, repo stack’iyle uyumlu kalın veya override edecekseniz bunu açıkça belirtin.');
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
      detected_strengths.push('Proje kuralları sağlanmış (agent mode).');
    }

    if (hasFileTargets) {
      context += 2;
      detected_strengths.push('Hedef dosya/konum belirtilmiş (agent mode).');
    } else {
      context -= 3;
      warnings.push('Agent mode: Hedef dosya belirtilmemiş; ajan gereksiz dosya tarayabilir (token/zaman maliyeti).');
      issues.push('Hedef dosya/konum belirtilmedi; büyük repolarda gereksiz tarama maliyeti doğurabilir.');
      suggestions.push('Hangi dosya(lar) üzerinde çalışılacağını belirtin (örn: `app/page.tsx`, `components/Foo.tsx`).');
    }

  }

  if (mode === 'agent' && inferredTerms.length > 0 && techMatches.length === 0) {
    detected_strengths.push("Repo bağlamı/stack'i çıkarılabiliyor (agent mode).");
  }
  context = clamp(Math.round(context), 0, LIMITS.context_completeness);
  if (techMatches.length > 0) detected_strengths.push('Teknoloji/stack bağlamı belirtilmiş.');
  else {
    if (mode === 'standalone') {
      issues.push('Bağlam/teknoloji bilgisi eksik (örn: React, Next.js, TypeScript).');
      suggestions.push('Kullandığınız stack’i ve varsa sürümleri belirtin (örn: Next.js 14, TypeScript).');
    } else {
      suggestions.push('Agent mode’da stack çoğu zaman repo’dan çıkarılır; yalnızca override edecekseniz teknoloji/sürüm belirtin.');
    }
  }

  // Output specification (0-15)
  const outputMatches = uniqueMatches(text, OUTPUT_SPEC_PHRASES);
  let output = 2;
  if (outputMatches.length > 0) output += 10;
  output += clamp((outputMatches.length - 1) * 2, 0, 3);
  if (/json|diff|patch|code|component|endpoint/i.test(text)) output += 1;
  output = clamp(Math.round(output), 0, LIMITS.output_specification);
  if (outputMatches.length > 0) detected_strengths.push('Çıktı formatına dair ipuçları içeriyor.');
  else {
    issues.push('Beklenen çıktı formatı belirtilmemiş (kod/diff/JSON vb.).');
    suggestions.push('Beklenen çıktıyı net yazın: tam kod mu, sadece diff mi, JSON formatı mı?');
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
    detected_strengths.push('Kısıtlar/guardrail’ler belirtilmiş.');
  } else {
    suggestions.push('Varsa kısıtları ekleyin (örn: public API/props değişmesin, yeni dependency ekleme).');
  }

  if (mode === 'agent' && hasProjectRules && hasNoNewDepsRule(projectRulesMd) && promptSuggestsAddingDeps(original)) {
    warnings.push('Proje kuralları “yeni dependency ekleme” diyor; prompt dependency eklemeyi ima ediyor olabilir.');
    issues.push('Prompt, proje kurallarıyla çelişebilir (dependency kısıtı).');
    suggestions.push('Dependency eklemek zorundaysanız bunu açıkça gerekçelendirin veya kuralı override ettiğinizi belirtin.');
  }

  // Edge cases (0-10)
  const edgeMatches = uniqueMatches(text, EDGE_CASE_TERMS);
  let edge = 0;
  if (edgeMatches.length > 0) edge += 6;
  edge += clamp(edgeMatches.length, 0, 4);
  edge = clamp(Math.round(edge), 0, LIMITS.edge_cases);
  if (edgeMatches.length > 0) detected_strengths.push('Edge case’lere değinilmiş (loading/error/empty state vb.).');
  else {
    issues.push("Edge case'ler eksik (loading/error/empty state vb.).");
    suggestions.push("En az 2-3 edge case belirtin (loading, error, empty state, null/undefined).");
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
  if (toolMatches.length > 0) detected_strengths.push('Tool/environment talimatları içeriyor (sürüm/runtime vb.).');
  else {
    if (mode === 'agent') {
      if (inferredTerms.length === 0) {
        suggestions.push('Çalışma ortamını netleştirin (framework sürümü, App Router, Node sürümü vb.).');
      } else if (!(hasProjectRules && ruleToolMatches.length > 0)) {
        suggestions.push('Override edecekseniz, ortam/sürüm farklarını net yazın (örn: Node 20, Next.js 14.2.x).');
      }
    } else {
      suggestions.push('Çalışma ortamını netleştirin (framework sürümü, App Router, Node sürümü vb.).');
    }
  }

  // Definition of done (0-10)
  let dod = 0;
  const dodText = mode === 'agent' && hasProjectRules ? `${text}\n${rulesText}` : text;
  if (hasDefinitionOfDoneSignal(dodText)) dod += 6;
  if (hasTestSignal(dodText)) dod += 3;
  if (hasMustShouldSignal(text)) dod += 1;
  dod = clamp(Math.round(dod), 0, LIMITS.definition_of_done);
  if (dod >= 6) detected_strengths.push('Definition of done / acceptance criteria yaklaşımı var.');
  else {
    issues.push('Definition of done / acceptance criteria net değil.');
    suggestions.push('Tamamlanma kriterlerini maddeler halinde ekleyin (testler geçmeli, davranış X olmalı vb.).');
  }

  // Token efficiency (0-5)
  const tokenEval = tokenEfficiencyScore(original);
  let token = clamp(Math.round(tokenEval.score), 0, LIMITS.token_efficiency);
  if (mode === 'agent' && hasFileTargets) token = clamp(token + 1, 0, LIMITS.token_efficiency);
  if (tokenEval.issue) issues.push(tokenEval.issue);
  if (tokenEval.suggestion) suggestions.push(tokenEval.suggestion);

  // Additional issues: ambiguous-only prompts
  if (words.length <= 8 && ambiguous.length > 0) {
    issues.push('Prompt çok genel ve muğlak; uygulanabilir bir görev tanımı değil.');
    suggestions.push('Somut görev, bağlam, kısıt ve çıktı formatı ekleyin.');
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
  const objective = objectiveCandidate && objectiveCandidate.trim().length > 0 ? objectiveCandidate.trim() : 'Belirtilmedi, eklenmesi önerilir';

  const computedContextText =
    mode === 'agent'
      ? [
          hasFileTargets ? `Hedef dosyalar: ${fileTargets.join(', ')}` : 'Hedef dosyalar: Belirtilmedi (ekleyin)',
          hasProjectRules
            ? ruleHighlights.length > 0
              ? `Proje kuralları (özet):\n${ruleHighlights.map((l) => `- ${l}`).join('\n')}`
              : 'Proje kuralları: Yüklendi'
            : null,
          'Repo bağlamı varsayılır; override edecekseniz belirtin.',
        ]
          .filter(Boolean)
          .join('\n')
      : techMatches.length > 0
        ? `Teknolojiler: ${techMatches.map((t) => (t === 'next.js' ? 'Next.js' : t)).join(', ')}`
        : 'Belirtilmedi, eklenmesi önerilir (örn: React/Next.js/TypeScript sürümleri)';
  const contextText = extractedContext ?? computedContextText;

  const computedConstraintsText =
    constraintMatches.length > 0
      ? constraintMatches.map((c) => `- ${c}`).join('\n')
      : '- Belirtilmedi, eklenmesi önerilir (örn: public API/props değişmesin, yeni dependency eklenmesin)';
  const constraintsText = extractedConstraints ?? computedConstraintsText;

  const computedExpectedOutputText =
    outputMatches.length > 0
      ? `- İstenen çıktı formatı sinyali: ${outputMatches.join(', ')}`
      : '- Belirtilmedi, eklenmesi önerilir (örn: tam kod, sadece diff, JSON şeması)';
  const expectedOutputText = extractedExpectedOutput ?? computedExpectedOutputText;

  const acceptanceLines = getAcceptanceLikeLines(original);
  const computedAcceptanceText =
    acceptanceLines.length > 0
      ? acceptanceLines.map((l) => `- ${l}`).join('\n')
      : '- Belirtilmedi, eklenmesi önerilir (örn: testler geçmeli, UI bozulmamalı, edge case’ler ele alınmalı)';
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
