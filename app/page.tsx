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
          <div className={styles.headerContent}>
            <div>
              <h1 className={styles.title}>AI Task &amp; Prompt Linter</h1>
              <p className={styles.subtitle}>
                Prompt/task açıklamalarını rubric ile analiz eder, iyileştirir ve optimize edilmiş bir prompt üretir.
              </p>
            </div>

            <div className={styles.profileLinks}>
              <span className={styles.profileLabel}>Geliştirici</span>
              <a
                href="https://github.com/alperekinci99"
                target="_blank"
                rel="noreferrer"
                className={styles.profileLink}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.profileIcon}>
                  <path
                    fill="currentColor"
                    d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.866-.013-1.7-2.782.605-3.369-1.344-3.369-1.344-.455-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.748-1.026 2.748-1.026.546 1.378.202 2.397.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.31.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.481A10.02 10.02 0 0 0 22 12.017C22 6.484 17.523 2 12 2Z"
                  />
                </svg>
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/alper-ekinci-6728bb175/"
                target="_blank"
                rel="noreferrer"
                className={styles.profileLink}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" className={styles.profileIcon}>
                  <path
                    fill="currentColor"
                    d="M19 3A2 2 0 0 1 21 5v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14Zm-.5 15.5V13.2c0-2.84-1.51-4.16-3.52-4.16-1.62 0-2.35.89-2.76 1.52V9.26H9.5c.03.86 0 9.24 0 9.24h2.72v-5.16c0-.28.02-.56.1-.76.22-.56.72-1.15 1.56-1.15 1.1 0 1.54.87 1.54 2.14v4.93h2.58ZM6.56 8.14c.95 0 1.54-.63 1.54-1.42-.02-.8-.59-1.42-1.52-1.42-.93 0-1.54.62-1.54 1.42 0 .79.59 1.42 1.5 1.42h.02Zm-1.37 10.36h2.74V9.26H5.19v9.24Z"
                  />
                </svg>
                LinkedIn
              </a>
            </div>
          </div>
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
