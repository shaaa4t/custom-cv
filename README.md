# CV Tailor

Upload your CV (Word `.docx`), paste a job description, and download a tailored PDF — all in your browser, with Gemini doing the rewriting.

**Live demo:** <https://shaaa4t.github.io/cv-tailor/>

Nothing is sent to a server you don't control: your CV and API key stay in the browser, and the Gemini call goes directly from your browser to Google.

## What it does

1. Reads your existing résumé from a Word file.
2. Rewrites the summary and experience bullets to target a specific job, mirrors the job's keywords, and reorders your skills by relevance.
3. Renders the result into a clean, ATS-friendly PDF with selectable text.

It rewrites how your real experience is *presented* — it never invents jobs, dates, degrees, or skills you don't have.

## Good to know before you use it

- **You need your own Gemini API key** — a free one from <https://aistudio.google.com/app/apikey>. It's stored only in your browser's `localStorage`.
- **Input must be `.docx`** (Word). PDF résumés aren't supported as input yet.
- **Output is English only.**
- **Match the field.** Tailoring works when your CV and the job are in the same field (e.g. a developer CV + a developer job). If the job is in a completely different field, there's nothing truthful to surface, so the result will look almost unchanged — that's expected, not a bug.

## Local development

```bash
npm install
npm run dev
```

Open <http://localhost:3000> and paste your Gemini API key once.

## Deploy to GitHub Pages

1. Push this repo to GitHub.
2. In the repo settings → **Pages** → set **Source** to **GitHub Actions**.
3. Push to `main`. The workflow in `.github/workflows/deploy.yml` builds and deploys automatically.
4. The site appears at `https://<your-user>.github.io/<repo-name>/`.

The workflow sets `NEXT_PUBLIC_BASE_PATH` to `/<repo-name>` so asset paths line up with GitHub Pages project URLs.

## How it works

1. **Parse .docx** — `mammoth` extracts raw text from the Word file in the browser.
2. **Tailor** — the text plus the job description is sent to `gemini-2.5-flash` with a JSON response schema, returning a structured CV.
3. **Render PDF** — `@react-pdf/renderer` lays the structured CV into a clean A4 template with selectable text (ATS-friendly).

## Tech

- Next.js 16 (App Router, static export)
- TypeScript + Tailwind v4
- `mammoth` for `.docx` parsing
- `@react-pdf/renderer` for PDF generation
- Gemini 2.5 Flash for the rewriting

## Privacy

Your CV and API key never leave your browser. The only network call is straight from your browser to Google's Gemini API.
