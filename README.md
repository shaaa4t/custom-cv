# CV Tailor

Upload your CV (Word `.docx`), paste a job description, and download a tailored PDF — all in your browser, with Gemini doing the rewriting.

Nothing is sent to a server you don't control: your CV and API key stay in the browser, and the Gemini call goes directly from your browser to Google.

## Local development

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

You'll need a free Gemini API key from <https://aistudio.google.com/app/apikey>. Paste it once and it's saved in `localStorage`.

## Deploy to GitHub Pages

1. Push this repo to GitHub.
2. In the repo settings → Pages → set **Source** to **GitHub Actions**.
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
