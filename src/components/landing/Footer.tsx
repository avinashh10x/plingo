import { Twitter, Linkedin, Github, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const SOCIAL_LINKS = [
  { label: "Twitter", href: "https://twitter.com/plingoapp", icon: Twitter },
  { label: "LinkedIn", href: "https://linkedin.com", icon: Linkedin },
  { label: "Instagram", href: "https://instagram.com", icon: Instagram },
  { label: "GitHub", href: "https://github.com", icon: Github },
];

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [time, setTime] = useState(() => new Date().toLocaleTimeString());

  // Live time updater
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="border-t border-border/40 bg-background overflow-hidden">
      {/* Big Brand Text - Full Width Edge to Edge */}
      <div className="w-full pt-10 pb-6">
        <h2 
          className="w-full text-[33vw] md:text-[31.5vw] leading-[0.85] font-oswald text-foreground/10 select-none text-center font-black tracking-[-0.05em] "
          style={{ fontStretch: 'ultra-condensed' }}
        >
          PLINGO
        </h2>
      </div>

      {/* All Content Below */}
      <div className="px-6 pb-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Empty separator */}
          <div className="pb-4 border-b border-border/40"></div>

          {/* Bottom Row: Legal, Credit, Social */}
          <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-6 text-sm">
            {/* Legal Links + Time */}
            <div className="flex items-center gap-6 text-muted-foreground order-2 md:order-1">
              <span className="hover:text-foreground transition-colors font-mono text-xs">
                {time}
              </span>
              <Link
                to="/privacy"
                className="hover:text-foreground transition-colors"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="hover:text-foreground transition-colors"
              >
                Terms
              </Link>
            </div>

            {/* Center: Tagline + Copyright */}
            <div className="flex flex-col items-center gap-1 order-1 md:order-2">
              <p className="text-sm text-muted-foreground text-center">
                Made for smart creators who move fast.
              </p>
              <span className="text-xs text-muted-foreground text-center block">
                © {currentYear} Plingo | Built by{" "}
                <a
                  href="https://twitter.com/avinash10x"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-foreground hover:underline"
                >
                  Avinash
                </a>
              </span>
            </div>

            {/* Social Icons */}
            <div className="flex items-center gap-4 order-3">
              {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
