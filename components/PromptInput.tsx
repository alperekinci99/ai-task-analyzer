'use client';

import { useMemo } from 'react';

import type { AnalysisMode } from '@/lib/types';

type Props = {
  prompt: string;
  onPromptChange: (next: string) => void;
  onAnalyze: () => void;
  mode: AnalysisMode;
  onModeChange: (next: AnalysisMode) => void;
  projectRulesMd: string;
  onProjectRulesMdChange: (next: string) => void;
  loading?: boolean;
};

export default function PromptInput({
  prompt,
  onPromptChange,
  onAnalyze,
  mode,
  onModeChange,
  projectRulesMd,
  onProjectRulesMdChange,
  loading,
}: Props) {
  const examples = useMemo(
    () => [
      'Bu React bileşenini performans için refactor et.',
      'Hash state okuyup analytics event gönderen bir Next.js wishlist bileşeni oluştur.',
    ],
    [],
  );

  async function onRulesFileSelected(file: File | null) {
    if (!file) return;
    try {
      const text = await file.text();
      onProjectRulesMdChange(text);
    } catch {
      // no-op
    }
  }

  return (
    <section className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Prompt</h2>
          <p className="text-sm text-gray-600">Analiz etmek istediğiniz task açıklamasını yapıştırın.</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:gap-3">
          <label className="flex w-full flex-col gap-1 text-xs font-medium text-gray-700 sm:w-auto">
            Mod
            <select
              value={mode}
              onChange={(e) => onModeChange(e.target.value as AnalysisMode)}
              disabled={loading}
              className="h-9 w-full rounded-md border border-gray-200 bg-white px-2 text-sm text-gray-900 outline-none focus:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              <option value="standalone">Standalone</option>
              <option value="agent">Agent Mode (repo-aware)</option>
            </select>
          </label>

          <button
            type="button"
            onClick={onAnalyze}
            disabled={loading || prompt.trim().length === 0}
            className="inline-flex h-9 w-full items-center justify-center rounded-md bg-black px-4 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {loading ? 'Analiz ediliyor…' : 'Promptu Analiz Et'}
          </button>
        </div>
      </div>

      <div className="space-y-1">
        <div className="text-xs font-medium text-gray-700">Prompt metni</div>
        <textarea
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          rows={10}
          placeholder={examples.join('\n\n')}
          className="w-full resize-y rounded-md border border-gray-200 bg-white p-3 text-sm leading-6 text-gray-900 outline-none focus:border-gray-400"
        />
      </div>

      {mode === 'agent' ? (
        <div className="space-y-2">
          <p className="text-xs text-gray-600">
            Agent Mode: Teknoloji/stack bilgisi repo’dan çıkarılabildiği varsayılır; prompt’ta yalnızca override edecekseniz belirtin.
          </p>

          <div className="rounded-md border border-gray-200 bg-white p-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-xs font-semibold text-gray-900">Proje kuralları (.md) — opsiyonel</div>
                <div className="mt-0.5 text-xs text-gray-600">Agent'in nasıl çalışacağını belirleyen kuralları yükleyin/yapıştırın.</div>
              </div>

              <div className="flex items-center gap-2">
                <label className="inline-flex h-8 cursor-pointer items-center rounded-md border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-900 hover:bg-gray-50">
                  .md yükle
                  <input
                    type="file"
                    accept=".md,text/markdown"
                    className="hidden"
                    disabled={loading}
                    onChange={(e) => onRulesFileSelected(e.target.files?.item(0) ?? null)}
                  />
                </label>

                <button
                  type="button"
                  className="inline-flex h-8 items-center rounded-md border border-gray-200 bg-white px-3 text-xs font-semibold text-gray-900 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => onProjectRulesMdChange('')}
                  disabled={loading || projectRulesMd.trim().length === 0}
                >
                  Temizle
                </button>
              </div>
            </div>

            <textarea
              value={projectRulesMd}
              onChange={(e) => onProjectRulesMdChange(e.target.value)}
              rows={6}
              placeholder={'# Örnek\n- Yeni dependency ekleme\n- Mevcut public API kalsın\n- SCSS modules kullan\n- Testler geçmeli'}
              disabled={loading}
              className="mt-3 w-full resize-y rounded-md border border-gray-200 bg-white p-2 text-xs leading-5 text-gray-900 outline-none focus:border-gray-400 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
        </div>
      ) : null}

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
