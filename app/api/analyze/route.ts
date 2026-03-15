import { NextResponse } from 'next/server';

import { analyzePrompt } from '@/lib/analyzePrompt';
import { detectProjectContext } from '@/lib/projectContext';
import type { AnalysisMode } from '@/lib/types';

export const runtime = 'nodejs';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Geçersiz JSON gövdesi.' }, { status: 400 });
  }

  const prompt = isRecord(body) ? body.prompt : undefined;
  if (typeof prompt !== 'string' || prompt.trim().length === 0) {
    return NextResponse.json({ error: '"prompt" alanı boş olmayan bir metin (string) olmalı.' }, { status: 400 });
  }

  const modeRaw = isRecord(body) ? body.mode : undefined;
  const mode: AnalysisMode = modeRaw === 'agent' || modeRaw === 'standalone' ? modeRaw : 'standalone';
  if (modeRaw !== undefined && modeRaw !== 'agent' && modeRaw !== 'standalone') {
    return NextResponse.json({ error: '"mode" alanı "standalone" veya "agent" olmalı.' }, { status: 400 });
  }

  const projectRulesRaw = isRecord(body) ? body.project_rules_md : undefined;
  if (projectRulesRaw !== undefined && typeof projectRulesRaw !== 'string') {
    return NextResponse.json({ error: '"project_rules_md" alanı metin (string) olmalı.' }, { status: 400 });
  }
  const projectRulesMd = typeof projectRulesRaw === 'string' ? projectRulesRaw : undefined;
  if (projectRulesMd && projectRulesMd.length > 100_000) {
    return NextResponse.json({ error: '"project_rules_md" alanı çok büyük.' }, { status: 413 });
  }

  try {
    const projectContext = mode === 'agent' ? await detectProjectContext(process.cwd()) : undefined;
    const analysis = await analyzePrompt(prompt, {
      mode,
      projectContext,
      projectRulesMd: mode === 'agent' ? projectRulesMd : undefined,
    });
    return NextResponse.json(analysis, { status: 200 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Sunucu hatası oluştu.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
