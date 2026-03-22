'use client';

import { useState } from 'react';

import AnalysisResult from '@/components/AnalysisResult';
import PromptInput from '@/components/PromptInput';
import type { AnalysisMode, PromptAnalysis } from '@/lib/types';

import styles from './page.module.scss';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim()?.replace(/\/$/, '') ?? 'https://tasklint.dev';

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'AI Task & Prompt Linter',
  applicationCategory: 'DeveloperApplication',
  operatingSystem: 'Web',
  url: siteUrl,
  description:
    'A web tool for developers to analyze AI coding prompts, task specifications, and prompt engineering instructions with rubric-based scoring and optimized prompt generation.',
  creator: {
    '@type': 'Person',
    name: 'Alper Ekinci',
    sameAs: ['https://github.com/alperekinci99', 'https://www.linkedin.com/in/alper-ekinci-6728bb175/'],
  },
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
  },
  featureList: [
    'AI prompt analysis',
    'Prompt quality scoring',
    'Agent Mode for repo-aware tasks',
    'Optimized prompt generation',
    'Developer task specification linting',
  ],
};

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
        const message = data?.error || 'Analysis failed.';
        setError(String(message));
        return;
      }

      setAnalysis(data as PromptAnalysis);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unknown error.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.shell}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />

      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.headerContent}>
            <div>
              <h1 className={styles.title}>AI Task &amp; Prompt Linter</h1>
              <p className={styles.subtitle}>
                Analyze AI coding prompts, developer task descriptions, and prompt engineering instructions with rubric-based scoring and optimized prompt generation.
              </p>
            </div>

            <div className={styles.profileLinks}>
              <span className={styles.profileLabel}>Developer</span>
              <div className={styles.profileLinkRow}>
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

        <section className={styles.seoSection} aria-labelledby="why-tasklint">
          <div className={styles.seoBlock}>
            <h2 id="why-tasklint" className={styles.seoTitle}>
              AI prompt analyzer for developers and coding agents
            </h2>
            <p className={styles.seoText}>
              AI Task &amp; Prompt Linter helps developers write better prompts for coding assistants, code generation tools,
              repo-aware agents, and prompt engineering workflows. It reviews task clarity, context completeness,
              constraints, output requirements, and definition of done.
            </p>
          </div>

          <div className={styles.seoGrid}>
            <article className={styles.seoCard}>
              <h3 className={styles.seoCardTitle}>What it analyzes</h3>
              <p className={styles.seoText}>
                Use it as a prompt checker for AI coding prompts, task specifications, developer instructions, and agent
                mode requests before sending them to tools like Copilot, Codex, or other coding assistants.
              </p>
            </article>

            <article className={styles.seoCard}>
              <h3 className={styles.seoCardTitle}>Why it helps</h3>
              <p className={styles.seoText}>
                Better prompts usually mean fewer misunderstandings, less token waste, clearer code changes, and stronger
                implementation outcomes for AI-assisted software development.
              </p>
            </article>

            <article className={styles.seoCard}>
              <h3 className={styles.seoCardTitle}>Best use cases</h3>
              <p className={styles.seoText}>
                Great for prompt engineering, AI developer workflows, task linting, coding agent setup, repo-aware task
                writing, and improving software implementation prompts before execution.
              </p>
            </article>
          </div>
        </section>
      </main>
    </div>
  );
}
