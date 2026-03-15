'use client';

import { useState } from 'react';

import AnalysisResult from '@/components/AnalysisResult';
import PromptInput from '@/components/PromptInput';
import type { AnalysisMode, PromptAnalysis } from '@/lib/types';

import styles from './page.module.scss';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<AnalysisMode>('standalone');
  const [projectRulesMd, setProjectRulesMd] = useState('');
  const [analysis, setAnalysis] = useState<PromptAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onAnalyze() {
    setLoading(true);
    setError(null);
    setAnalysis(null);

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          mode,
          ...(mode === 'agent' && projectRulesMd.trim().length > 0 ? { project_rules_md: projectRulesMd } : {}),
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const message = data?.error || 'Analiz başarısız.';
        setError(String(message));
        return;
      }

      setAnalysis(data as PromptAnalysis);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Bilinmeyen hata.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <h1 className={styles.title}>AI Task &amp; Prompt Linter</h1>
          <p className={styles.subtitle}>
            Prompt/task açıklamalarını rubric ile analiz eder, iyileştirir ve optimize edilmiş bir prompt üretir.
          </p>
        </div>
      </header>

      <main className={styles.main}>
        <div className={styles.card}>
          <PromptInput
            prompt={prompt}
            onPromptChange={setPrompt}
            onAnalyze={onAnalyze}
            mode={mode}
            onModeChange={setMode}
            projectRulesMd={projectRulesMd}
            onProjectRulesMdChange={setProjectRulesMd}
            loading={loading}
          />

          {error ? <div className={styles.error}>{error}</div> : null}

          {analysis ? (
            <div className={styles.results}>
              <AnalysisResult analysis={analysis} />
            </div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
