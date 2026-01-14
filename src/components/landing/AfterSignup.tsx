import { motion } from "framer-motion";

const steps = [
  {
    num: "01",
    title: "Connect accounts",
    desc: "Link your X or LinkedIn accounts securely.",
  },
  {
    num: "02",
    title: "Create content",
    desc: "Write your post manually or let AI draft it for you.",
  },
  {
    num: "03",
    title: "Schedule or Post",
    desc: "Publish instantly or pick the perfect time later.",
  },
  {
    num: "04",
    title: "Track Growth",
    desc: "See everything from one unified calendar.",
  },
];

export const AfterSignup = () => {
  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What happens after you sign up?
          </h2>
          <p className="text-muted-foreground">
            Get started in less than 2 minutes.
          </p>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-6 p-6 rounded-2xl bg-muted/40 hover:bg-muted/60 transition-colors border border-transparent hover:border-border/50"
            >
              <span className="text-4xl font-bold text-muted-foreground/20">
                {step.num}
              </span>
              <div>
                <h3 className="text-xl font-semibold mb-1">{step.title}</h3>
                <p className="text-muted-foreground">{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="w-full  flex items-center justify-center">
          <svg
            viewBox="0 0 1024 660"
            className="block mx-auto max-w-full h-auto"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="metal_finish" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stop-color="#C0C0C0" />
                <stop offset="20%" stop-color="#E0E0E0" />
                <stop offset="50%" stop-color="#F5F5F5" />
                <stop offset="80%" stop-color="#E0E0E0" />
                <stop offset="100%" stop-color="#C0C0C0" />
              </linearGradient>

              <clipPath id="screen_area">
                <rect x="50" y="50" width="924" height="560" rx="14" />
              </clipPath>

              <filter
                id="housing_shadow"
                x="-10%"
                y="-10%"
                width="120%"
                height="120%"
              >
                <feDropShadow
                  dx="0"
                  dy="10"
                  stdDeviation="15"
                  flood-color="#000"
                  flood-opacity="0.25"
                />
              </filter>
            </defs>

            <g filter="url(#housing_shadow)">
              <rect
                x="30"
                y="30"
                width="964"
                height="600"
                rx="24"
                fill="url(#metal_finish)"
                stroke="#A0A0A0"
                stroke-width="1"
              />

              <rect
                x="34"
                y="34"
                width="956"
                height="592"
                rx="20"
                fill="#050505"
              />

              <g clip-path="url(#screen_area)">
                <foreignObject x="50" y="50" width="924" height="560">
                  <video
                    src="https://pixabay.com/videos/download/video-56376_medium.mp4"
                    autoPlay
                    loop
                    muted
                    controls
                    playsInline
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                    }}
                  />
                </foreignObject>
              </g>

              <g transform="translate(432, 34)">
                <path
                  d="M0 0 H160 V32 C160 40.8 152.8 48 144 48 H16 C7.2 48 0 40.8 0 32 V0 Z"
                  fill="#050505"
                />
                <circle
                  cx="80"
                  cy="24"
                  r="6"
                  fill="#151515"
                  stroke="#222"
                  stroke-width="1"
                />{" "}
                <circle cx="80" cy="24" r="3" fill="#080808" />{" "}
                <circle cx="81" cy="23" r="1" fill="#444" opacity="0.5" />{" "}
                <rect x="100" y="20" width="8" height="8" rx="2" fill="#111" />
                <circle cx="56" cy="24" r="2" fill="#00FF00" opacity="0.9">
                  <animate
                    attributeName="opacity"
                    values="0.9;0.4;0.9"
                    dur="4s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
};
