'use client';

import { useMemo } from 'react';

import type { AnalysisMode } from '@/lib/types';

type Props = {
  prompt: string;
  onPromptChange: (next: string) => void;
  onAnalyze: () => void;
  mode: AnalysisMode;
  onModeChange: (next: AnalysisMode) => void;
  loading?: boolean;
};

export default function PromptInput({ prompt, onPromptChange, onAnalyze, mode, onModeChange, loading }: Props) {
  const examples = useMemo(
    () => [
      'Refactor this React component to improve performance.',
      'Create a Next.js wishlist component that reads hash state and sends analytics events.',
    ],
    [],
  );

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Prompt</h2>
          <p className="text-sm text-gray-600">Analiz etmek istediğiniz task açıklamasını yapıştırın.</p>
        </div>
        <div className="flex items-end gap-3">
          <label className="flex flex-col gap-1 text-xs font-medium text-gray-700">
            Mode
            <select
              value={mode}
              onChange={(e) => onModeChange(e.target.value as AnalysisMode)}
              disabled={loading}
              className="h-9 rounded-md border border-gray-200 bg-white px-2 text-sm text-gray-900 outline-none focus:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="standalone">Standalone</option>
              <option value="agent">Agent Mode (repo-aware)</option>
            </select>
          </label>

          <button
            type="button"
            onClick={onAnalyze}
            disabled={loading || prompt.trim().length === 0}
            className="inline-flex h-9 items-center justify-center rounded-md bg-black px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Analyzing…' : 'Analyze Prompt'}
          </button>
        </div>
      </div>

      {mode === 'agent' ? (
        <p className="text-xs text-gray-600">
          Agent Mode: Teknoloji/stack bilgisi repo’dan çıkarılabildiği varsayılır; prompt’ta yalnızca override edecekseniz belirtin.
        </p>
      ) : null}

      <textarea
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        rows={10}
        placeholder={examples.join('\n\n')}
        className="w-full resize-y rounded-md border border-gray-200 bg-white p-3 text-sm leading-6 text-gray-900 outline-none focus:border-gray-400"
      />

      <div className="text-xs text-gray-600">
        <div className="font-medium text-gray-700">Örnekler</div>
        <ul className="list-disc pl-5">
          {examples.map((ex) => (
            <li key={ex}>
              <button
                type="button"
                className="text-left underline decoration-gray-300 underline-offset-2 hover:decoration-gray-500"
                onClick={() => onPromptChange(ex)}
                disabled={loading}
              >
                {ex}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
