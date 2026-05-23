"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { extractTextFromDocx } from "./lib/docx";
import { tailorCv, type GeminiError } from "./lib/gemini";
import type { Cv } from "./lib/types";
import { CvPreview } from "./components/CvPreview";

const PDFDownloadLink = dynamic(
  () => import("@react-pdf/renderer").then((m) => m.PDFDownloadLink),
  { ssr: false, loading: () => <span className="text-zinc-500 text-sm">Loading…</span> },
);

const CvPdf = dynamic(() => import("./components/CvPdf").then((m) => m.CvPdf), {
  ssr: false,
});

const API_KEY_STORAGE = "cv-tailor:gemini-key";

export default function Home() {
  const [apiKey, setApiKey] = useState("");
  const [savedKey, setSavedKey] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [originalText, setOriginalText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tailored, setTailored] = useState<Cv | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem(API_KEY_STORAGE);
    if (stored) {
      setApiKey(stored);
      setSavedKey(true);
    }
  }, []);

  function saveKey() {
    localStorage.setItem(API_KEY_STORAGE, apiKey);
    setSavedKey(true);
  }

  function clearKey() {
    localStorage.removeItem(API_KEY_STORAGE);
    setApiKey("");
    setSavedKey(false);
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith(".docx")) {
      setError("Please upload a .docx file (Word document).");
      return;
    }
    try {
      const text = await extractTextFromDocx(file);
      setFileName(file.name);
      setOriginalText(text);
    } catch (err) {
      console.error(err);
      setError("Could not read this .docx file. Try re-saving it from Word.");
    }
  }

  async function generate() {
    setError(null);
    setTailored(null);
    if (!apiKey) return setError("Add your Gemini API key first.");
    if (!originalText) return setError("Upload your CV first.");
    if (!jobDescription.trim()) return setError("Paste the job description.");
    setLoading(true);
    try {
      const cv = await tailorCv({ apiKey, originalCvText: originalText, jobDescription });
      setTailored(cv);
    } catch (err) {
      const e = err as GeminiError;
      setError(e?.message ?? "Something went wrong while calling Gemini.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 w-full">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
          CV Tailor
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400 mt-1">
          Upload your CV, paste a job description, and download a tailored PDF.
        </p>
      </header>

      <Step number={1} title="Gemini API key">
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
          Get a free key at{" "}
          <a
            className="text-blue-600 underline"
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noreferrer"
          >
            aistudio.google.com/app/apikey
          </a>
          . It's stored only in your browser.
        </p>
        <div className="flex gap-2">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => {
              setApiKey(e.target.value);
              setSavedKey(false);
            }}
            placeholder="AIza..."
            className="flex-1 px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 text-sm font-mono"
          />
          <button
            onClick={saveKey}
            disabled={!apiKey}
            className="px-4 py-2 rounded bg-zinc-900 text-white text-sm disabled:opacity-40 dark:bg-zinc-100 dark:text-zinc-900"
          >
            {savedKey ? "Saved ✓" : "Save"}
          </button>
          {savedKey && (
            <button
              onClick={clearKey}
              className="px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 text-sm"
            >
              Clear
            </button>
          )}
        </div>
      </Step>

      <Step number={2} title="Upload your CV (.docx)">
        <label className="inline-block">
          <input
            type="file"
            accept=".docx"
            onChange={onFileChange}
            className="hidden"
          />
          <span className="px-4 py-2 rounded bg-zinc-900 text-white text-sm cursor-pointer inline-block dark:bg-zinc-100 dark:text-zinc-900">
            Choose .docx file
          </span>
        </label>
        {fileName && (
          <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-2">
            Loaded: <span className="font-mono">{fileName}</span> (
            {originalText.length} chars)
          </p>
        )}
      </Step>

      <Step number={3} title="Paste the job description">
        <textarea
          value={jobDescription}
          onChange={(e) => setJobDescription(e.target.value)}
          rows={10}
          placeholder="Paste the full job posting here — title, responsibilities, requirements, nice-to-haves..."
          className="w-full px-3 py-2 rounded border border-zinc-300 dark:border-zinc-700 dark:bg-zinc-900 text-sm"
        />
      </Step>

      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={generate}
          disabled={loading || !apiKey || !originalText || !jobDescription.trim()}
          className="px-6 py-3 rounded bg-blue-600 text-white font-medium disabled:opacity-40 hover:bg-blue-700"
        >
          {loading ? "Tailoring CV…" : "Tailor my CV"}
        </button>
        {error && <p className="text-red-600 text-sm">{error}</p>}
      </div>

      {tailored && (
        <section className="mt-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              Tailored CV
            </h2>
            <PDFDownloadLink
              document={<CvPdf cv={tailored} />}
              fileName={`${tailored.name.replace(/\s+/g, "_")}_CV.pdf`}
              className="px-4 py-2 rounded bg-green-600 text-white text-sm font-medium hover:bg-green-700"
            >
              {({ loading: l }) => (l ? "Preparing PDF…" : "Download PDF")}
            </PDFDownloadLink>
          </div>
          <CvPreview cv={tailored} />
        </section>
      )}

      <footer className="mt-16 text-xs text-zinc-500 text-center">
        Your CV and API key never leave your browser. Calls go directly to Google's
        Gemini API.
      </footer>
    </main>
  );
}

function Step({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-6 rounded-lg border border-zinc-200 dark:border-zinc-800 p-5 bg-white dark:bg-zinc-950">
      <h2 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-3 flex items-center gap-2">
        <span className="inline-flex w-6 h-6 items-center justify-center rounded-full bg-zinc-900 text-white text-xs dark:bg-zinc-100 dark:text-zinc-900">
          {number}
        </span>
        {title}
      </h2>
      {children}
    </section>
  );
}
