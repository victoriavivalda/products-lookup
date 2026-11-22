import { Text, View } from "@react-pdf/renderer";
import { AIProviderResponse } from "@/core/domain/lookup.types";
import { pdfStyles } from "./pdf.styles";

interface ProviderBreakdownSectionProps {
  responses: AIProviderResponse[];
}

export function ProviderBreakdownSection({
  responses,
}: ProviderBreakdownSectionProps) {
  return (
    <>
      {responses.map((engine) => (
        <View key={engine.modelId} style={pdfStyles.section} wrap={false}>
          <Text style={pdfStyles.sectionTitle}>
            {`${engine.modelName} (${engine.latencyMs}ms)`}
          </Text>
          {engine.citations.map((citation, idx) => {
            const isLast = idx === engine.citations.length - 1;
            const hasDrift = citation.citedPrice !== citation.realPrice;

            return (
              <View
                key={citation.id}
                style={
                  isLast ? [pdfStyles.row, pdfStyles.rowLast] : pdfStyles.row
                }
              >
                <Text style={pdfStyles.productName}>
                  {`#${citation.rank} · ${citation.name}`}
                </Text>
                <Text
                  style={
                    hasDrift
                      ? pdfStyles.priceBadgeMismatch
                      : pdfStyles.priceBadgeVerified
                  }
                >
                  {hasDrift
                    ? `Cited $${citation.citedPrice} (Real $${citation.realPrice})`
                    : `$${citation.citedPrice} Verified`}
                </Text>
              </View>
            );
          })}
        </View>
      ))}
    </>
  );
}
