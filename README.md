# AI Task Spec Analyzer (MVP)

Geliştiricilerin AI coding asistanlarına verdikleri prompt/task açıklamalarını analiz eder ve iyileştirilmiş bir prompt önerir.

## Stack

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- Next.js API Routes
- Local rule-based analyzer (deterministic)

## Kurulum

1) Bağımlılıkları kurun ve çalıştırın:

```bash
npm install
npm run dev
```

Uygulama: `http://localhost:3000`

## API

`POST /api/analyze`

Body:

```json
{ "prompt": "...", "mode": "standalone" }
```

`mode` (opsiyonel):
- `standalone` (default): Prompt kendi içinde stack/bağlam/çevre bilgisini içermeli.
- `agent`: Repo-aware. Server-side olarak proje stack’i çıkarılır; prompt’ta teknoloji belirtmek çoğu zaman opsiyoneldir (override edecekseniz yazın).

Response: prompt analiz JSON'u (score + breakdown + issues + suggestions + optimized_prompt).

Notlar:
- `agent` modunda response ayrıca `mode` ve `project_context` alanlarını içerebilir.
- Olası stack uyuşmazlıkları `warnings`/`issues` içinde raporlanır.

## Klasör Yapısı

- `app/` (UI + API route)
- `components/PromptInput.tsx`
- `components/AnalysisResult.tsx`
- `lib/analyzePrompt.ts`
- `app/api/analyze/route.ts`
