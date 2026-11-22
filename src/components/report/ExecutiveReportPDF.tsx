import {
  Circle,
  Document,
  G,
  Line,
  Page,
  Path,
  StyleSheet,
  Svg,
  Text,
  View,
} from "@react-pdf/renderer";
import { AI_MODEL_LABELS } from "@/core/constants/lookup.constants";
import { AIProviderResponse, ExecutiveConclusion } from "@/core/domain/lookup.types";
import { buildAuditTelemetryViewModel } from "@/core/facades/telemetry.presenter";
import {
  buildSmoothBezierPath,
  getEngineColumnX,
  getRankRowY,
  MATRIX_CONFIG,
} from "@/features/lookup/components/visibility-matrix/visibility-matrix.utils";

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingHorizontal: 36,
    paddingBottom: 46,
    fontFamily: "Helvetica",
    fontSize: 10,
    color: "#111827",
  },
  eyebrow: { fontSize: 8, color: "#6B7280", textTransform: "uppercase", marginBottom: 4 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  meta: { fontSize: 8.5, color: "#6B7280", marginBottom: 16 },
  section: {
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 6,
  },
  sectionTitle: {
    fontSize: 9.5,
    fontWeight: "bold",
    textTransform: "uppercase",
    color: "#374151",
    marginBottom: 8,
  },
  bullet: { marginBottom: 4, lineHeight: 1.4 },
  barRow: { marginBottom: 8 },
  barHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
    fontSize: 8.5,
  },
  barTrack: {
    height: 6,
    backgroundColor: "#F3F4F6",
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: 6,
    backgroundColor: "#2563EB",
    borderRadius: 3,
  },
  legendRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 6,
  },
  legendPill: {
    fontSize: 7.5,
    paddingVertical: 2,
    paddingHorizontal: 6,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  productName: {
    flex: 1,
    paddingRight: 12,
  },
  priceBadgeMismatch: {
    color: "#B45309",
    fontWeight: "bold",
    fontSize: 8.5,
  },
  priceBadgeVerified: {
    color: "#047857",
    fontSize: 8.5,
  },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 36,
    right: 36,
    flexDirection: "row",
    justifyContent: "space-between",
    fontSize: 8,
    color: "#9CA3AF",
  },
});

export function ExecutiveReportPDF({
  conclusion,
  responses,
}: {
  conclusion: ExecutiveConclusion;
  responses: AIProviderResponse[];
}) {
  const { engineMetrics, visibilitySeries, totalEngines } =
    buildAuditTelemetryViewModel(responses);

  const { SVG_WIDTH, SVG_HEIGHT, PADDING_X, PADDING_TOP, ROW_HEIGHT, RANKS, ORDERED_ENGINES } =
    MATRIX_CONFIG;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.eyebrow}>Products Lookup · AI Search Visibility Audit</Text>
        <Text style={styles.title}>Executive Telemetry Report</Text>
        <Text style={styles.meta}>
          {`Prompt: "${conclusion.query}" · Generated: ${conclusion.generatedAt}`}
        </Text>

        {/* 1. Executive Conclusions */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Key Findings & Recommended Action</Text>
          {conclusion.insights.map((item, idx) => (
            <Text key={idx} style={styles.bullet}>
              {`• ${item}`}
            </Text>
          ))}
          <Text style={{ marginTop: 6, fontWeight: "bold" }}>
            {`Action: ${conclusion.recommendedAction}`}
          </Text>
        </View>

        {/* 2. Latency & Price Accuracy Chart */}
        {engineMetrics.length > 0 && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>Engine Latency & Price Accuracy</Text>
            {engineMetrics.map((metric) => (
              <View key={metric.modelId} style={styles.barRow}>
                <View style={styles.barHeader}>
                  <Text style={{ fontWeight: "bold" }}>{metric.modelName}</Text>
                  <Text style={{ color: "#4B5563" }}>
                    {`${metric.priceAccuracyPercent}% price match · ${metric.latencyMs}ms`}
                  </Text>
                </View>
                <View style={styles.barTrack}>
                  <View
                    style={[styles.barFill, { width: `${metric.latencyBarPercent}%` }]}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* 3. Vector SVG Bump Chart */}
        {visibilitySeries.length > 0 && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>
              Cross-Engine Ranking Trajectory (Green: Verified · Amber: Price Drift)
            </Text>
            <Svg
              viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
              style={{ width: "100%", height: 140 }}
            >
              {RANKS.map((rank) => {
                const y = getRankRowY(rank);
                return (
                  <G key={rank}>
                    <Line
                      x1={PADDING_X - 24}
                      y1={y}
                      x2={SVG_WIDTH - PADDING_X + 24}
                      y2={y}
                      stroke="#E5E7EB"
                      strokeDasharray="3 3"
                    />
                    <Text
                      x={PADDING_X - 36}
                      y={y + 3}
                      style={{ fontSize: 9, fill: "#6B7280" }}
                    >
                      {`#${rank}`}
                    </Text>
                  </G>
                );
              })}

              {ORDERED_ENGINES.map((modelId, idx) => {
                const x = getEngineColumnX(idx);
                return (
                  <G key={modelId}>
                    <Line
                      x1={x}
                      y1={PADDING_TOP - 14}
                      x2={x}
                      y2={PADDING_TOP + ROW_HEIGHT * 2 + 14}
                      stroke="#E5E7EB"
                    />
                    <Text
                      x={x - 35}
                      y={SVG_HEIGHT - 14}
                      style={{ fontSize: 8.5, fill: "#374151" }}
                    >
                      {AI_MODEL_LABELS[modelId]}
                    </Text>
                  </G>
                );
              })}

              {visibilitySeries.map((series) => {
                const activePoints = series.points.filter(
                  (p): p is typeof p & { y: number } => p.y !== null
                );

                return (
                  <G key={series.sku}>
                    {activePoints.length > 1 && (
                      <Path
                        d={buildSmoothBezierPath(activePoints)}
                        fill="none"
                        stroke="#2563EB"
                        strokeWidth={1.75}
                      />
                    )}
                    {activePoints.map((pt) => (
                      <Circle
                        key={`${series.sku}-${pt.modelId}`}
                        cx={pt.x}
                        cy={pt.y}
                        r={5}
                        fill={pt.hasPriceMismatch ? "#F59E0B" : "#10B981"}
                        stroke="#FFFFFF"
                        strokeWidth={1.5}
                      />
                    ))}
                  </G>
                );
              })}
            </Svg>

            <View style={styles.legendRow}>
              {visibilitySeries.map((s) => (
                <Text key={s.sku} style={styles.legendPill}>
                  {`${s.name} (${s.appearancesCount}/${totalEngines} engines)`}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* 4. Detailed Provider Breakdown */}
        {responses.map((engine) => (
          <View key={engine.modelId} style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>
              {`${engine.modelName} (${engine.latencyMs}ms)`}
            </Text>
            {engine.citations.map((c, idx) => {
              const isLast = idx === engine.citations.length - 1;
              const hasDrift = c.citedPrice !== c.realPrice;

              return (
                <View
                  key={c.id}
                  style={[styles.row, isLast ? { borderBottomWidth: 0 } : {}]}
                >
                  <Text style={styles.productName}>{`#${c.rank} · ${c.name}`}</Text>
                  <Text
                    style={
                      hasDrift ? styles.priceBadgeMismatch : styles.priceBadgeVerified
                    }
                  >
                    {hasDrift
                      ? `Cited $${c.citedPrice} (Real $${c.realPrice})`
                      : `$${c.citedPrice} Verified`}
                  </Text>
                </View>
              );
            })}
          </View>
        ))}

        {/* Fixed Running Footer */}
        <View style={styles.footer} fixed>
          <Text>Products Lookup · Automated AI Shelf Telemetry</Text>
          <Text
            render={({ pageNumber, totalPages }) =>
              `Page ${pageNumber} of ${totalPages}`
            }
          />
        </View>
      </Page>
    </Document>
  );
}
