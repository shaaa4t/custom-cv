"use client";

import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
  Font,
} from "@react-pdf/renderer";
import type { Cv } from "../lib/types";

Font.register({
  family: "Inter",
  fonts: [
    {
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMa1ZL7.ttf",
      fontWeight: 400,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMa2JL7SUc.ttf",
      fontWeight: 600,
    },
    {
      src: "https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMa1pL7SUc.ttf",
      fontWeight: 700,
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 44,
    fontFamily: "Inter",
    fontSize: 10.5,
    lineHeight: 1.4,
    color: "#1f2937",
  },
  header: { marginBottom: 14 },
  name: { fontSize: 22, fontWeight: 700, color: "#111827", letterSpacing: 0.2 },
  jobTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: "#374151",
    marginTop: 2,
  },
  contactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
    fontSize: 9.5,
    color: "#4b5563",
  },
  contactItem: { marginRight: 12, marginBottom: 2 },
  contactLink: { color: "#1d4ed8", textDecoration: "none" },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    color: "#111827",
    borderBottomWidth: 1,
    borderBottomColor: "#d1d5db",
    paddingBottom: 3,
    marginBottom: 6,
    marginTop: 12,
  },
  summaryText: { color: "#374151" },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  itemTitle: { fontWeight: 700, color: "#111827" },
  itemSub: { fontWeight: 600, color: "#1f2937" },
  itemMeta: { color: "#6b7280", fontSize: 9.5 },
  itemBlock: { marginBottom: 8 },
  bulletRow: { flexDirection: "row", marginTop: 2 },
  bulletDot: { width: 10, color: "#374151" },
  bulletText: { flex: 1, color: "#374151" },
  skillsGroup: { marginBottom: 4 },
  skillsRow: { flexDirection: "row" },
  skillsLabel: { fontWeight: 700, color: "#111827", marginRight: 4 },
  skillsItems: { flex: 1, color: "#374151" },
});

function formatDates(start?: string, end?: string): string {
  if (start && end) return `${start} — ${end}`;
  if (start) return start;
  if (end) return end;
  return "";
}

function ContactItem({
  label,
  value,
  href,
}: {
  label?: string;
  value: string;
  href?: string;
}) {
  return (
    <Text style={styles.contactItem}>
      {label ? `${label}: ` : ""}
      {href ? (
        <Link src={href} style={styles.contactLink}>
          {value}
        </Link>
      ) : (
        value
      )}
    </Text>
  );
}

export function CvPdf({ cv }: { cv: Cv }) {
  const c = cv.contact ?? {};
  return (
    <Document title={`${cv.name} - CV`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{cv.name}</Text>
          {cv.title ? <Text style={styles.jobTitle}>{cv.title}</Text> : null}
          <View style={styles.contactRow}>
            {c.email ? (
              <ContactItem value={c.email} href={`mailto:${c.email}`} />
            ) : null}
            {c.phone ? <ContactItem value={c.phone} /> : null}
            {c.location ? <ContactItem value={c.location} /> : null}
            {c.linkedin ? (
              <ContactItem
                value={c.linkedin}
                href={
                  c.linkedin.startsWith("http") ? c.linkedin : `https://${c.linkedin}`
                }
              />
            ) : null}
            {c.github ? (
              <ContactItem
                value={c.github}
                href={c.github.startsWith("http") ? c.github : `https://${c.github}`}
              />
            ) : null}
            {c.website ? (
              <ContactItem
                value={c.website}
                href={c.website.startsWith("http") ? c.website : `https://${c.website}`}
              />
            ) : null}
          </View>
        </View>

        {cv.summary ? (
          <View>
            <Text style={styles.sectionTitle}>Summary</Text>
            <Text style={styles.summaryText}>{cv.summary}</Text>
          </View>
        ) : null}

        {cv.experience?.length ? (
          <View>
            <Text style={styles.sectionTitle}>Experience</Text>
            {cv.experience.map((exp, i) => (
              <View key={i} style={styles.itemBlock} wrap={false}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>
                    {exp.title}
                    {exp.company ? (
                      <Text style={styles.itemSub}> · {exp.company}</Text>
                    ) : null}
                  </Text>
                  <Text style={styles.itemMeta}>
                    {formatDates(exp.startDate, exp.endDate)}
                    {exp.location ? ` · ${exp.location}` : ""}
                  </Text>
                </View>
                {exp.bullets?.map((b, j) => (
                  <View key={j} style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{b}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {cv.skills?.length ? (
          <View>
            <Text style={styles.sectionTitle}>Skills</Text>
            {cv.skills.map((g, i) => (
              <View key={i} style={styles.skillsGroup}>
                <View style={styles.skillsRow}>
                  <Text style={styles.skillsLabel}>{g.category}:</Text>
                  <Text style={styles.skillsItems}>{g.items.join(", ")}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : null}

        {cv.projects?.length ? (
          <View>
            <Text style={styles.sectionTitle}>Projects</Text>
            {cv.projects.map((p, i) => (
              <View key={i} style={styles.itemBlock} wrap={false}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>
                    {p.name}
                    {p.link ? (
                      <Text style={styles.itemMeta}>
                        {"  "}
                        <Link
                          src={p.link.startsWith("http") ? p.link : `https://${p.link}`}
                          style={styles.contactLink}
                        >
                          {p.link}
                        </Link>
                      </Text>
                    ) : null}
                  </Text>
                </View>
                <Text style={styles.bulletText}>{p.description}</Text>
                {p.technologies?.length ? (
                  <Text style={styles.itemMeta}>
                    Tech: {p.technologies.join(", ")}
                  </Text>
                ) : null}
              </View>
            ))}
          </View>
        ) : null}

        {cv.education?.length ? (
          <View>
            <Text style={styles.sectionTitle}>Education</Text>
            {cv.education.map((edu, i) => (
              <View key={i} style={styles.itemBlock} wrap={false}>
                <View style={styles.itemHeader}>
                  <Text style={styles.itemTitle}>
                    {edu.degree}
                    {edu.institution ? (
                      <Text style={styles.itemSub}> · {edu.institution}</Text>
                    ) : null}
                  </Text>
                  <Text style={styles.itemMeta}>
                    {formatDates(edu.startDate, edu.endDate)}
                    {edu.location ? ` · ${edu.location}` : ""}
                  </Text>
                </View>
                {edu.details?.map((d, j) => (
                  <View key={j} style={styles.bulletRow}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{d}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        ) : null}

        {cv.certifications?.length ? (
          <View>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {cv.certifications.map((c, i) => (
              <View key={i} style={styles.bulletRow}>
                <Text style={styles.bulletDot}>•</Text>
                <Text style={styles.bulletText}>
                  <Text style={styles.itemTitle}>{c.name}</Text>
                  {c.issuer ? ` — ${c.issuer}` : ""}
                  {c.date ? ` (${c.date})` : ""}
                </Text>
              </View>
            ))}
          </View>
        ) : null}
      </Page>
    </Document>
  );
}
