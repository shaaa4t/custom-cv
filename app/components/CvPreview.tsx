"use client";

import type { Cv } from "../lib/types";

export function CvPreview({ cv }: { cv: Cv }) {
  const c = cv.contact ?? {};
  return (
    <div className="bg-white text-zinc-800 rounded-lg shadow-sm border border-zinc-200 p-8 text-sm leading-relaxed">
      <header className="mb-4">
        <h1 className="text-2xl font-bold text-zinc-900">{cv.name}</h1>
        {cv.title && <p className="font-semibold text-zinc-700">{cv.title}</p>}
        <p className="text-xs text-zinc-600 mt-1 flex flex-wrap gap-x-3 gap-y-1">
          {c.email && <span>{c.email}</span>}
          {c.phone && <span>{c.phone}</span>}
          {c.location && <span>{c.location}</span>}
          {c.linkedin && <span className="text-blue-700">{c.linkedin}</span>}
          {c.github && <span className="text-blue-700">{c.github}</span>}
          {c.website && <span className="text-blue-700">{c.website}</span>}
        </p>
      </header>

      {cv.summary && (
        <Section title="Summary">
          <p>{cv.summary}</p>
        </Section>
      )}

      {cv.experience?.length > 0 && (
        <Section title="Experience">
          {cv.experience.map((e, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between items-baseline">
                <div className="font-semibold">
                  {e.title}
                  {e.company && <span> · {e.company}</span>}
                </div>
                <div className="text-xs text-zinc-500">
                  {[e.startDate, e.endDate].filter(Boolean).join(" — ")}
                  {e.location && ` · ${e.location}`}
                </div>
              </div>
              <ul className="list-disc ml-4 mt-1">
                {e.bullets.map((b, j) => (
                  <li key={j}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </Section>
      )}

      {cv.skills?.length > 0 && (
        <Section title="Skills">
          {cv.skills.map((g, i) => (
            <p key={i}>
              <span className="font-semibold">{g.category}:</span>{" "}
              {g.items.join(", ")}
            </p>
          ))}
        </Section>
      )}

      {cv.projects && cv.projects.length > 0 && (
        <Section title="Projects">
          {cv.projects.map((p, i) => (
            <div key={i} className="mb-2">
              <div className="font-semibold">
                {p.name}
                {p.link && (
                  <span className="font-normal text-blue-700 text-xs ml-2">
                    {p.link}
                  </span>
                )}
              </div>
              <p>{p.description}</p>
              {p.technologies && p.technologies.length > 0 && (
                <p className="text-xs text-zinc-500">
                  Tech: {p.technologies.join(", ")}
                </p>
              )}
            </div>
          ))}
        </Section>
      )}

      {cv.education?.length > 0 && (
        <Section title="Education">
          {cv.education.map((e, i) => (
            <div key={i} className="mb-2">
              <div className="flex justify-between items-baseline">
                <div className="font-semibold">
                  {e.degree}
                  {e.institution && <span> · {e.institution}</span>}
                </div>
                <div className="text-xs text-zinc-500">
                  {[e.startDate, e.endDate].filter(Boolean).join(" — ")}
                  {e.location && ` · ${e.location}`}
                </div>
              </div>
              {e.details && (
                <ul className="list-disc ml-4 mt-1">
                  {e.details.map((d, j) => (
                    <li key={j}>{d}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </Section>
      )}

      {cv.certifications && cv.certifications.length > 0 && (
        <Section title="Certifications">
          <ul className="list-disc ml-4">
            {cv.certifications.map((c, i) => (
              <li key={i}>
                <span className="font-semibold">{c.name}</span>
                {c.issuer && ` — ${c.issuer}`}
                {c.date && ` (${c.date})`}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-4">
      <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-900 border-b border-zinc-300 pb-1 mb-2">
        {title}
      </h2>
      {children}
    </section>
  );
}
