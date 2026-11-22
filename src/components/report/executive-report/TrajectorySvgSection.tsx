import { Circle, G, Line, Path, Svg, Text, View } from "@react-pdf/renderer";
import { AI_MODEL_LABELS } from "@/core/constants/lookup.constants";
import {
  buildSmoothBezierPath,
  getEngineColumnX,
  getRankRowY,
  MATRIX_CONFIG,
  ProductSeries,
} from "@/core/facades/presenters/visibility-matrix.presenters";
import { PDF_COLORS, pdfStyles } from "./pdf.styles";

interface TrajectorySvgSectionProps {
  visibilitySeries: ProductSeries[];
  totalEngines: number;
}

export function TrajectorySvgSection({
  visibilitySeries,
  totalEngines,
}: TrajectorySvgSectionProps) {
  if (visibilitySeries.length === 0) return null;

  const {
    SVG_WIDTH,
    SVG_HEIGHT,
    PADDING_X,
    PADDING_TOP,
    ROW_HEIGHT,
    RANKS,
    ORDERED_ENGINES,
  } = MATRIX_CONFIG;

  return (
    <View style={pdfStyles.section} wrap={false}>
      <Text style={pdfStyles.sectionTitle}>
        Cross-Engine Ranking Trajectory (Green: Verified · Amber: Price Drift)
      </Text>

      <Svg
        viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
        style={pdfStyles.svgContainer}
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
                stroke={PDF_COLORS.border}
                strokeDasharray="3 3"
              />
              <Text x={PADDING_X - 36} y={y + 3} style={pdfStyles.svgAxisLabel}>
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
                stroke={PDF_COLORS.border}
              />
              <Text
                x={x - 35}
                y={SVG_HEIGHT - 14}
                style={pdfStyles.svgEngineLabel}
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
                  stroke={PDF_COLORS.accent}
                  strokeWidth={1.75}
                />
              )}
              {activePoints.map((pt) => (
                <Circle
                  key={`${series.sku}-${pt.modelId}`}
                  cx={pt.x}
                  cy={pt.y}
                  r={5}
                  fill={
                    pt.hasPriceMismatch ? PDF_COLORS.drift : PDF_COLORS.verified
                  }
                  stroke={PDF_COLORS.surface}
                  strokeWidth={1.5}
                />
              ))}
            </G>
          );
        })}
      </Svg>

      <View style={pdfStyles.legendRow}>
        {visibilitySeries.map((series) => (
          <Text key={series.sku} style={pdfStyles.legendPill}>
            {`${series.name} (${series.appearancesCount}/${totalEngines} engines)`}
          </Text>
        ))}
      </View>
    </View>
  );
}
