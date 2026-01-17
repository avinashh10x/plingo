import { Lock, Shield, Eye, Check } from "lucide-react";

const TRUST_ITEMS = [
  { label: "OAuth-based security", icon: Lock },
  { label: "No password storage", icon: Check },
  { label: "No auto-posting", icon: Shield },
  { label: "No data reselling", icon: Shield },
  { label: "Full user control", icon: Eye },
  { label: "Industry-standard encryption", icon: Lock },
];

export const SafetyTrust = () => {
  return (
    <section className="border-y border-border/40 bg-muted/20 px-6 py-8 md:my-20">
      <div className="max-w-7xl mx-auto">
        <ul className="flex flex-wrap items-center justify-between gap-6 md:gap-8">
          {TRUST_ITEMS.map(({ label, icon: Icon }) => (
            <li
              key={label}
              className="flex items-center gap-2"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm font-medium whitespace-nowrap">
                {label}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
