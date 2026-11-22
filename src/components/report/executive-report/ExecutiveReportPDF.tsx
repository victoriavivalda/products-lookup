import { Document, Page, Text, View } from "@react-pdf/renderer";
import {
  AIProviderResponse,
  ExecutiveConclusion,
} from "@/core/domain/lookup.types";
import { buildAuditTelemetryViewModel } from "@/core/facades/presenters/telemetry.presenter";
import { pdfStyles } from "./pdf.styles";
import { TrajectorySvgSection } from "./TrajectorySvgSection";
import { ProviderBreakdownSection } from "./ProviderBreakdownSection";

interface ExecutiveReportPDFProps {
  conclusion: ExecutiveConclusion;
  responses: AIProviderResponse[];
  narrative?: string;
}

export function ExecutiveReportPDF({
  conclusion,
  responses,
  narrative,
}: ExecutiveReportPDFProps) {
  const { engineMetrics, visibilitySeries, totalEngines } =
    buildAuditTelemetryViewModel(responses);

  const trimmedNarrative = narrative?.trim();

  return (
    <Document>
      <Page size="A4" style={pdfStyles.page}>
        <Text style={pdfStyles.eyebrow}>
          Products Lookup · AI Search Visibility Audit
        </Text>
        <Text style={pdfStyles.title}>Executive Telemetry Report</Text>
        <Text style={pdfStyles.meta}>
          {`Prompt: "${conclusion.query}" · Generated: ${conclusion.generatedAt}`}
        </Text>

        <View style={pdfStyles.section} wrap={false}>
          <Text style={pdfStyles.sectionTitle}>Key Findings</Text>
          {conclusion.insights.map((item) => (
            <Text key={item} style={pdfStyles.bullet}>
              {`• ${item}`}
            </Text>
          ))}

          <View style={pdfStyles.synthesisCallout}>
            <Text style={pdfStyles.synthesisLabel}>
              {trimmedNarrative
                ? "AI Executive Synthesis"
                : "Recommended Action"}
            </Text>
            <Text style={pdfStyles.synthesisBody}>
              {trimmedNarrative || conclusion.recommendedAction}
            </Text>
          </View>
        </View>

        {engineMetrics.length > 0 && (
          <View style={pdfStyles.section} wrap={false}>
            <Text style={pdfStyles.sectionTitle}>
              Engine Latency &amp; Price Accuracy
            </Text>
            {engineMetrics.map((metric) => (
              <View key={metric.modelId} style={pdfStyles.barRow}>
                <View style={pdfStyles.barHeader}>
                  <Text style={pdfStyles.barModelName}>{metric.modelName}</Text>
                  <Text style={pdfStyles.barMetricsText}>
                    {`${metric.priceAccuracyPercent}% price match · ${metric.latencyMs}ms`}
                  </Text>
                </View>
                <View style={pdfStyles.barTrack}>
                  <View
                    style={[
                      pdfStyles.barFill,
                      { width: `${metric.latencyBarPercent}%` },
                    ]}
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        <TrajectorySvgSection
          visibilitySeries={visibilitySeries}
          totalEngines={totalEngines}
        />

        <ProviderBreakdownSection responses={responses} />

        <View style={pdfStyles.footer} fixed>
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
