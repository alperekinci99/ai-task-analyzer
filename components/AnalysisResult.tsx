'use client';

import { useMemo, useState } from 'react';

import type { PromptAnalysis } from '@/lib/types';

type Props = {
  analysis: PromptAnalysis;
};

const LABELS: Record<keyof PromptAnalysis['breakdown'], string> = {
  goal_clarity: 'Goal clarity',
  context_completeness: 'Context completeness',
  output_specification: 'Output specification',
  constraints: 'Constraints definition',
  edge_cases: 'Edge cases coverage',
  tool_instructions: 'Tool / environment instructions',
  definition_of_done: 'Definition of done',
  token_efficiency: 'Token efficiency',
};

export default function AnalysisResult({ analysis }: Props) {
  const [copied, setCopied] = useState(false);

  const scoreTone = useMemo(() => {
    const score = analysis.score;
    if (score >= 85) return { label: 'Yeterli', number: 'text-emerald-600', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200' };
    if (score >= 65) return { label: 'Kısmen yeterli', number: 'text-amber-600', badge: 'bg-amber-50 text-amber-700 ring-amber-200' };
    return { label: 'Yetersiz', number: 'text-red-600', badge: 'bg-red-50 text-red-700 ring-red-200' };
  }, [analysis.score]);

  const breakdownEntries = useMemo(
    () => Object.entries(analysis.breakdown) as Array<[keyof PromptAnalysis['breakdown'], number]>,
    [analysis.breakdown],
  );

  async function copyOptimized() {
    try {
      await navigator.clipboard.writeText(analysis.optimized_prompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // no-op
    }
  }

  return (
    <section className="space-y-6">
      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Input Prompt Score</h2>
            <p className="mt-1 text-xs text-gray-600">
              Bu skor, analiz ettiğiniz orijinal prompt’un hazırlık seviyesidir.
            </p>
            <div className="mt-1 text-4xl font-semibold tracking-tight text-gray-900">
              <span className={scoreTone.number}>{analysis.score}</span>
              <span className="text-base font-medium text-gray-500">/100</span>
            </div>
          </div>

          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${scoreTone.badge}`}
          >
            {scoreTone.label}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {breakdownEntries.map(([key, value]) => (
            <div key={key} className="flex items-center justify-between rounded-md bg-gray-50 px-3 py-2">
              <div className="text-sm text-gray-700">{LABELS[key]}</div>
              <div className="text-sm font-semibold text-gray-900">{value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-gray-900">Issues</h3>
          {analysis.issues.length === 0 ? (
            <p className="mt-2 text-sm text-gray-600">Belirgin bir sorun tespit edilmedi.</p>
          ) : (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
              {analysis.issues.map((it, idx) => (
                <li key={`${idx}-${it}`}>{it}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-gray-900">Suggestions</h3>
          {analysis.suggestions.length === 0 ? (
            <p className="mt-2 text-sm text-gray-600">Geliştirme önerisi yok.</p>
          ) : (
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
              {analysis.suggestions.map((it, idx) => (
                <li key={`${idx}-${it}`}>{it}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {analysis.warnings && analysis.warnings.length > 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-gray-900">Warnings</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
            {analysis.warnings.map((it, idx) => (
              <li key={`${idx}-${it}`}>{it}</li>
            ))}
          </ul>
        </div>
      ) : null}

      {analysis.detected_strengths && analysis.detected_strengths.length > 0 ? (
        <div className="rounded-lg border border-gray-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-gray-900">Detected strengths</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
            {analysis.detected_strengths.map((it, idx) => (
              <li key={`${idx}-${it}`}>{it}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="rounded-lg border border-gray-200 bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-sm font-semibold text-gray-900">Optimized Prompt</h3>
          <button
            type="button"
            onClick={copyOptimized}
            className="rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-900 hover:bg-gray-50"
            disabled={!analysis.optimized_prompt}
          >
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>

        <p className="mt-2 text-xs text-gray-600">
          Not: Bu çıktı bir şablondur. “Belirtilmedi” alanlarını doldurdukça readiness score yükselir.
        </p>

        <pre className="mt-3 overflow-x-auto rounded-md bg-gray-950 p-4 text-sm leading-6 text-gray-100">
          <code>{analysis.optimized_prompt || '(empty)'}</code>
        </pre>
      </div>
    </section>
  );
}
