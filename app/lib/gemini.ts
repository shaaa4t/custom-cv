import type { Cv } from "./types";

const GEMINI_ENDPOINT =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";

const CV_SCHEMA = {
  type: "OBJECT",
  properties: {
    name: { type: "STRING" },
    title: { type: "STRING" },
    contact: {
      type: "OBJECT",
      properties: {
        email: { type: "STRING" },
        phone: { type: "STRING" },
        location: { type: "STRING" },
        linkedin: { type: "STRING" },
        github: { type: "STRING" },
        website: { type: "STRING" },
      },
    },
    summary: { type: "STRING" },
    experience: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING" },
          company: { type: "STRING" },
          location: { type: "STRING" },
          startDate: { type: "STRING" },
          endDate: { type: "STRING" },
          bullets: { type: "ARRAY", items: { type: "STRING" } },
        },
        required: ["title", "company", "bullets"],
      },
    },
    education: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          degree: { type: "STRING" },
          institution: { type: "STRING" },
          location: { type: "STRING" },
          startDate: { type: "STRING" },
          endDate: { type: "STRING" },
          details: { type: "ARRAY", items: { type: "STRING" } },
        },
        required: ["degree", "institution"],
      },
    },
    skills: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          category: { type: "STRING" },
          items: { type: "ARRAY", items: { type: "STRING" } },
        },
        required: ["category", "items"],
      },
    },
    projects: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          description: { type: "STRING" },
          technologies: { type: "ARRAY", items: { type: "STRING" } },
          link: { type: "STRING" },
        },
        required: ["name", "description"],
      },
    },
    certifications: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          name: { type: "STRING" },
          issuer: { type: "STRING" },
          date: { type: "STRING" },
        },
        required: ["name"],
      },
    },
  },
  required: ["name", "contact", "summary", "experience", "education", "skills"],
};

const SYSTEM_INSTRUCTION = `You are an expert resume writer. You will be given:
1. The candidate's original CV (raw text extracted from a Word document).
2. A target job description.

Your task: produce a tailored CV as structured JSON that maximizes the candidate's relevance to the job, while staying TRUTHFUL to the original CV.

Rules:
- Never invent experience, employers, dates, degrees, or skills the candidate doesn't have.
- You MAY rephrase, reorder, and emphasize the candidate's real experience to better match the job.
- You MAY surface skills already present in the original CV that match keywords in the job description.
- The summary should be 2-4 sentences, sharply targeted at the role.
- Experience bullets should start with strong action verbs and quantify impact where the original CV provides numbers. Do not fabricate metrics.
- Group skills into 2-5 logical categories (e.g., "Languages", "Frameworks", "Tools", "Soft Skills").
- Use ATS-friendly language. Mirror exact keywords from the job description when the candidate has the underlying skill.
- Keep dates in the format "MMM YYYY" (e.g., "Jan 2023" or "Present").
- Output English only.`;

export type GeminiError = {
  status: number;
  message: string;
};

export async function tailorCv({
  apiKey,
  originalCvText,
  jobDescription,
}: {
  apiKey: string;
  originalCvText: string;
  jobDescription: string;
}): Promise<Cv> {
  const userPrompt = `=== ORIGINAL CV ===
${originalCvText}

=== TARGET JOB DESCRIPTION ===
${jobDescription}

Produce the tailored CV JSON now.`;

  const res = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: 0.3,
        responseMimeType: "application/json",
        responseSchema: CV_SCHEMA,
      },
    }),
  });

  if (!res.ok) {
    let message = `Gemini request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error?.message) message = body.error.message;
    } catch {}
    throw { status: res.status, message } satisfies GeminiError;
  }

  const data = await res.json();
  const text: string | undefined = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw {
      status: 500,
      message: "Gemini returned an empty response.",
    } satisfies GeminiError;
  }

  try {
    return JSON.parse(text) as Cv;
  } catch {
    throw {
      status: 500,
      message: "Gemini returned invalid JSON.",
    } satisfies GeminiError;
  }
}
