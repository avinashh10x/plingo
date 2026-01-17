import { ReactNode } from "react";

interface SectionTitleProps {
  badge?: string;
  badgeIcon?: ReactNode;
  title: string;
  highlightedText?: string;
  description?: string;
  align?: "left" | "center";
}

export const SectionTitle = ({
  badge,
  badgeIcon,
  title,
  highlightedText,
  description,
  align = "center",
}: SectionTitleProps) => {
  const alignClass = align === "center" ? "text-center" : "text-left";

  return (
    <div className={alignClass}>
      {badge && (
        <div
          className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 mb-6 ${
            align === "center" ? "" : ""
          }`}
        >
          {badgeIcon}
          <span className="text-sm font-medium text-primary">{badge}</span>
        </div>
      )}
      <h2 className="text-4xl md:text-5xl font-bold mb-4">
        {title}
        {highlightedText && (
          <>
            {" "}
            <span className="text-primary">{highlightedText}</span>
          </>
        )}
      </h2>
      {description && (
        <p className="text-lg text-muted-foreground/50 max-w-2xl mx-auto">
          {description}
        </p>
      )}
    </div>
  );
};
