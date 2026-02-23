import { Badge } from "@/components/ui/badge";
import { FRIENDLY_CHIP_LABELS, type DisabilityType } from "@/lib/mock-data";
import {
  Eye,
  EyeOff,
  Ear,
  EarOff,
  MicOff,
  Brain,
  BookOpen,
  Hand,
  Sparkles,
  HelpCircle,
} from "lucide-react";

const DISABILITY_ICONS: Record<DisabilityType, typeof Eye> = {
  blind: EyeOff,
  low_vision: Eye,
  deaf: EarOff,
  hard_of_hearing: Ear,
  mute: MicOff,
  speech_impaired: MicOff,
  adhd: Brain,
  dyslexia: BookOpen,
  autism: Sparkles,
  cognitive: Brain,
  motor: Hand,
  other: HelpCircle,
};

export function DisabilityChips({
  disabilities,
  size = "default",
}: {
  disabilities: DisabilityType[];
  size?: "default" | "small";
}) {
  const unique = [...new Set(disabilities.map((d) => FRIENDLY_CHIP_LABELS[d]))];

  return (
    <div className="flex flex-wrap gap-1">
      {unique.map((label) => {
        const disability = disabilities.find(
          (d) => FRIENDLY_CHIP_LABELS[d] === label
        )!;
        const Icon = DISABILITY_ICONS[disability];
        return (
          <Badge
            key={label}
            variant="secondary"
            className={`no-default-active-elevate font-normal ${
              size === "small" ? "text-[11px] px-1.5 py-0" : "text-xs"
            }`}
            data-testid={`chip-disability-${disability}`}
          >
            <Icon className={size === "small" ? "h-2.5 w-2.5 mr-1" : "h-3 w-3 mr-1"} />
            {label}
          </Badge>
        );
      })}
    </div>
  );
}

export function FormatChips({ formats, size = "default" }: { formats: string[]; size?: "default" | "small" }) {
  const allFormats = [
    { key: "audio", label: "Audio", short: "Audio" },
    { key: "captions", label: "Captions", short: "CC" },
    { key: "transcript", label: "Transcript", short: "Trans" },
    { key: "simplified", label: "Simplified", short: "Simp" },
    { key: "braille", label: "Braille", short: "Braille" },
    { key: "high_contrast", label: "High Contrast", short: "HC" },
  ];

  return (
    <div className="flex flex-wrap gap-1">
      {allFormats.map((f) => {
        const available = formats.includes(f.key);
        return (
          <Badge
            key={f.key}
            variant="outline"
            className={`no-default-active-elevate font-normal ${
              size === "small" ? "text-[10px] px-1 py-0" : "text-[11px] px-1.5 py-0"
            } ${!available ? "opacity-40 line-through" : ""}`}
            data-testid={`chip-format-${f.key}`}
          >
            {size === "small" ? f.short : f.label}
          </Badge>
        );
      })}
    </div>
  );
}

export function StatusChip({ status }: { status: string }) {
  const configs: Record<string, { label: string; className: string }> = {
    published: { label: "Published", className: "bg-[#E8F5E9] text-[#2E8B6E] border-[#2E8B6E]/20" },
    draft: { label: "Draft", className: "bg-muted text-muted-foreground" },
    converting: { label: "Converting", className: "bg-[#FFF3E0] text-[#C07B1A] border-[#C07B1A]/20" },
    review_required: { label: "Review Required", className: "bg-[#EBF4FB] text-[#355872] border-[#355872]/20" },
    soft_deleted: { label: "Deleted", className: "bg-destructive/10 text-destructive" },
    upcoming: { label: "Upcoming", className: "bg-[#EBF4FB] text-[#355872]" },
    in_progress: { label: "In Progress", className: "bg-[#FFF3E0] text-[#C07B1A]" },
    completed: { label: "Completed", className: "bg-[#E8F5E9] text-[#2E8B6E]" },
    graded: { label: "Graded", className: "bg-[#E8F5E9] text-[#2E8B6E]" },
    failed: { label: "Failed", className: "bg-destructive/10 text-destructive" },
    ready_for_review: { label: "Ready for Review", className: "bg-[#EBF4FB] text-[#355872]" },
    active: { label: "Active", className: "bg-[#E8F5E9] text-[#2E8B6E]" },
    inactive: { label: "Inactive", className: "bg-muted text-muted-foreground" },
  };

  const config = configs[status] || { label: status, className: "bg-muted text-muted-foreground" };

  return (
    <Badge
      variant="outline"
      className={`no-default-active-elevate font-normal text-[11px] ${config.className}`}
      data-testid={`chip-status-${status}`}
    >
      {config.label}
    </Badge>
  );
}
