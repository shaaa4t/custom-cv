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

Your task: AGGRESSIVELY TAILOR the candidate's CV to this specific job, producing structured JSON. The output must read like it was written FOR THIS JOB — never a generic copy of the original CV. Stay truthful to the facts in the original CV, but transform how they are presented.

You MUST make these visible changes (this is the whole point — do not skip them):
- SUMMARY: Rewrite it completely from scratch as a 2-4 sentence pitch aimed directly at this role. Name the target role/field and lead with the candidate's most job-relevant strengths and the exact keywords from the job description that the candidate genuinely has. Do not reuse the original summary verbatim.
- EXPERIENCE: Rewrite EVERY bullet to foreground the responsibilities, technologies, and outcomes that this job cares about. Reorder bullets so the most job-relevant ones come first. Mirror the job description's exact terminology (tools, methodologies, domain words) wherever the candidate's real experience supports it. Demote or compress experience that is irrelevant to this job, but do not delete real roles.
- SKILLS: Reorder and regroup so the skills the job asks for appear first and most prominently. Use the job description's exact skill names when they match what the candidate actually knows.
- TITLE: Set it to match or align with the target job title when the candidate's background reasonably supports it.

Hard rules (truthfulness):
- Never invent experience, employers, dates, degrees, certifications, or skills the candidate doesn't have.
- Do not fabricate metrics. Only quantify impact when the original CV provides the number.
- Every claim must trace back to something real in the original CV.

Formatting rules:
- Experience bullets start with strong action verbs.
- Group skills into 2-5 logical categories (e.g., "Languages", "Frameworks", "Tools", "Soft Skills").
- Use ATS-friendly language.
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

Now tailor this CV specifically to the job above. Rewrite the summary and experience bullets to match — do not just reformat the original. Produce the tailored CV JSON now.`;

  const res = await fetch(`${GEMINI_ENDPOINT}?key=${encodeURIComponent(apiKey)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      contents: [{ role: "user", parts: [{ text: userPrompt }] }],
      generationConfig: {
        temperature: 0.6,
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
