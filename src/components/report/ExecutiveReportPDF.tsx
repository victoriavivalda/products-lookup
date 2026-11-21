"use client";

import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";
import { AIProviderResponse, ExecutiveConclusion } from "@/core/domain/lookup.types";

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: "Helvetica", backgroundColor: "#FFFFFF", color: "#0A0A0A" },
  header: { borderBottomWidth: 1, borderBottomColor: "#E5E7EB", paddingBottom: 14, marginBottom: 20 },
  kicker: { fontSize: 9, color: "#6B7280", textTransform: "uppercase", letterSpacing: 1 },
  title: { fontSize: 20, fontWeight: "bold", marginTop: 4 },
  meta: { fontSize: 9, color: "#6B7280", marginTop: 6 },
  section: { marginBottom: 18 },
  sectionTitle: { fontSize: 11, fontWeight: "bold", marginBottom: 8, color: "#111827" },
  card: { backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 6, padding: 12 },
  bullet: { fontSize: 10, lineHeight: 1.5, marginBottom: 4, color: "#1F2937" },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    paddingVertical: 6,
    fontSize: 9,
  },
  badgeAlert: { color: "#B45309", fontWeight: "bold" },
  badgeOk: { color: "#047857", fontWeight: "bold" },
});

export function ExecutiveReportPDF({
  conclusion,
  responses,
}: {
  conclusion: ExecutiveConclusion;
  responses: AIProviderResponse[];
}) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.kicker}>Products Lookup · AI Shelf Telemetry</Text>
          <Text style={styles.title}>Executive Visibility Report</Text>
          <Text style={styles.meta}>
            Prompt: "{conclusion.query}" · Generated: {conclusion.generatedAt}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Conclusions</Text>
          <View style={styles.card}>
            {conclusion.insights.map((line, i) => (
              <Text key={i} style={styles.bullet}>
                • {line}
              </Text>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommended Action</Text>
          <View style={styles.card}>
            <Text style={styles.bullet}>{conclusion.recommendedAction}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Engine-by-Engine Citation Breakdown</Text>
          {responses.map((res) => (
            <View key={res.modelId} style={{ marginBottom: 10 }}>
              <Text style={{ fontSize: 10, fontWeight: "bold", marginBottom: 4 }}>
                {res.modelName} ({res.latencyMs}ms)
              </Text>
              {res.citations.map((item) => {
                const mismatch = item.citedPrice !== item.realPrice;
                return (
                  <View key={item.id} style={styles.row}>
                    <Text>
                      #{item.rank} · {item.name}
                    </Text>
                    <Text style={mismatch ? styles.badgeAlert : styles.badgeOk}>
                      {mismatch
                        ? `Cited $${item.citedPrice} (Real $${item.realPrice})`
                        : `$${item.citedPrice} Verified`}
                    </Text>
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
