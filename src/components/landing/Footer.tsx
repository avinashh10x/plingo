import { Twitter, Linkedin, Github, Instagram } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

const SOCIAL_LINKS = [
  { label: "Twitter", href: "https://twitter.com/avinash10x ", icon: Twitter },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/avinash-kumar-%F0%9F%8C%9F-519616249/",
    icon: Linkedin,
  },
  { label: "GitHub", href: "https://github.com/avinashh10x", icon: Github },
];

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [time, setTime] = useState(() => new Date().toLocaleTimeString());
  const textRef = useRef(null);
  const isInView = useInView(textRef, { once: false, amount: 0.5 });

  // Live time updater
  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const letters = "PLINGO".split("");

  return (
    <footer className="border-t border-border/40 bg-background overflow-hidden">
      {/* Big Brand Text - Full Width Edge to Edge */}
      <div className="w-full pt-10 pb-6">
        <div
          ref={textRef}
          className="w-full text-[33vw] md:text-[31.5vw] leading-[0.85] font-oswald text-foreground/10 select-none text-center font-black tracking-[-0.05em]"
          style={{ fontStretch: "ultra-condensed" }}
          aria-hidden="true"
        >
          {letters.map((letter, index) => (
            <motion.span
              key={index}
              initial={{ y: 20, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              viewport={{ once: false, amount: 0.5 }}
              transition={{
                duration: 0.8,
                delay: index * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={{ display: "inline-block" }}
            >
              {letter}
            </motion.span>
          ))}
        </div>
      </div>

      {/* All Content Below */}
      <div className="px-6 pb-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Empty separator */}
          <div className="pb-4 border-b border-border/40"></div>

          {/* Bottom Row: Legal, Credit, Social */}
          <div className="flex flex-col md:flex-row items-center md:items-center justify-between gap-6 text-sm">
            {/* Legal Links + Time */}
            <div className="flex-1 flex items-center gap-6 text-muted-foreground order-2 md:order-1">
              <span className="hover:text-foreground transition-colors font-mono ">
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
            <div className="flex-1 flex flex-col items-center gap-1 order-1 md:order-2">
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
            <div className="flex-1 flex items-center justify-end gap-4 order-3">
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
