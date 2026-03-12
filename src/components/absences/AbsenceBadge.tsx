import { ABSENCE_CONFIG, type AbsenceType } from "@/lib/types";
import Badge from "@/components/ui/Badge";

interface AbsenceBadgeProps {
  type: AbsenceType;
  compact?: boolean;
}

export default function AbsenceBadge({ type, compact = false }: AbsenceBadgeProps) {
  const config = ABSENCE_CONFIG[type];

  if (compact) {
    return (
      <span
        className="block w-full h-full rounded-sm min-h-[24px]"
        style={{ backgroundColor: config.bgColor, borderLeft: `3px solid ${config.color}` }}
        title={config.label}
      />
    );
  }

  return (
    <Badge color={config.color} bgColor={config.bgColor}>
      {config.label}
    </Badge>
  );
}
