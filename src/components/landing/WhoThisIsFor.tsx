import { motion } from "framer-motion";
import { useRef } from "react";

const PERSONAS = [
  {
    title: "Creators growing on X & LinkedIn",
    desc: "Build your personal brand with consistent cross-posting.",
    align: "left" as const,
    pos: "top-16 left-0",
    arrowStart: { x: 260, y: 60 },
    arrowFinish: { x: 420, y: 220 },
  },
  {
    title: "Founders building in public",
    desc: "Share your journey without spending hours on content.",
    align: "right" as const,
    pos: "top-16 right-0",
    arrowStart: { x: -40, y: 60 },
    arrowFinish: { x: -200, y: 220 },
  },
  {
    title: "Indie hackers & solopreneurs",
    desc: "Market your product while you build it.",
    align: "left" as const,
    pos: "bottom-16 left-0",
    arrowStart: { x: 260, y: -20 },
    arrowFinish: { x: 420, y: -240 },
  },
  {
    title: "Small teams",
    desc: "Manage multiple accounts from a single dashboard.",
    align: "right" as const,
    pos: "bottom-16 right-0",
    arrowStart: { x: -40, y: -20 },
    arrowFinish: { x: -200, y: -240 },
  },
];

export const WhoThisIsFor = () => {
  const centerRef = useRef<HTMLDivElement>(null);
  return (
    <section className="py-24 px-6 bg-background overflow-hidden relative">
      {/* Background texture simulation */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/concrete-wall.png')]" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16 md:mb-4">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Built for people who publish daily
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            If you're serious about growth, Plingo is for you.
          </p>
        </div>

        {/* Desktop Sketch View */}
        <div className="hidden md:block relative h-[600px] w-full max-w-5xl mx-auto">
          {/* Central Crowd (Organic Cluster) */}
          <div
            ref={centerRef}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            {/* <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"> */}
            <div className="relative w-[50vw] h-[55vh] ">
              <div className="absolute top-0 left-0   h-1/4 w-full flex justify-center">
                <Avatar color="white" className="" />
                <Avatar color="primary" className="" />
                <Avatar color="primary" className="" />
                <div>
                  <div className="z-1  rotate-90 w-20 h-[50px] border-[2px] border-white [box-shadow:0px_0px_60px_5px_hsl(var(--primary)),inset_0px_0px_0px_0px_hsl(var(--primary))]  absolute translate-y-1/2 translate-x-1/2 rounded-[40%] -top-[5%] md:-top-[20%] lg:-top-[25%] right-1/2 bg-background" />
                  <div className="z-5 aspect-square w-10 border-[2px] border-white [box-shadow:0px_0px_60px_5px_hsl(var(--primary)),inset_0px_0px_0px_0px_hsl(var(--primary))]  absolute translate-y-1/2 translate-x-1/2 rounded-full -top-[5%] md:-top-[20%] lg:-top-[65%] right-1/2 bg-background" />
                </div>
                <Avatar color="white" className="" />
              </div>

              <div className="absolute top-1/4 left-0  h-1/4 w-full flex justify-center">
                <Avatar color="white" className=" " />
                <Avatar color="primary" className="" />
                <Avatar color="white" className="" hasTarget />
                <Avatar color="primary" className="" />
                <Avatar color="white" className="" />
              </div>

              <div className="absolute top-1/2 left-0  h-1/4 w-full flex justify-center">
                <Avatar color="white" className="" />
                <Avatar color="primary" className="" />
                <Avatar color="primary" className="" />
                <Avatar color="white" className="" />
              </div>
            </div>
          </div>

          {/* Connected Personas with Dynamic Arrows */}
          {PERSONAS.map((persona, index) => (
            <div key={index} className={`absolute ${persona.pos} w-64`}>
              <Persona
                title={persona.title}
                desc={persona.desc}
                align={persona.align}
              />
              {/* <Arrow
                start={persona.arrowStart}
                finish={persona.arrowFinish}
                className="text-foreground/20"
              /> */}
            </div>
          ))}

          {/* Additional "Sketched" Labels like in the image */}
          {/* <div className="absolute top-1/3 left-1/4 -translate-x-full font-handwriting text-sm text-foreground/30 uppercase tracking-widest rotate-[-5deg]">
            Writes good reviews
          </div>
          <div className="absolute top-1/4 right-1/4 translate-x-full font-handwriting text-sm text-foreground/30 uppercase tracking-widest rotate-[5deg]">
            Shares with friends
          </div>
          <div className="absolute bottom-1/3 right-1/4 translate-x-full font-handwriting text-sm text-foreground/30 uppercase tracking-widest rotate-[-2deg]">
            Loyal to the brand
          </div> */}
        </div>

        {/* Mobile View */}
        <div className="md:hidden flex flex-col items-center gap-12">
          <div className="relative w-full h-48">
            <Avatar
              className="absolute top-0 left-[20%] scale-75"
              color="white"
            />
            <Avatar
              className="absolute top-0 left-[50%] scale-75"
              color="white"
            />
            <Avatar
              className="absolute top-10 left-[35%] scale-75"
              color="blue"
              hasTarget
            />
            <Avatar
              className="absolute top-10 left-[65%] scale-75"
              color="blue"
            />
          </div>
          <div className="grid gap-8 text-center">
            {PERSONAS.map((item, i) => (
              <div key={i}>
                <h3 className="text-xl font-bold mb-1 uppercase tracking-wider">
                  {item.title}
                </h3>
                <p className="text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const Avatar = ({
  className,
  color,
  hasTarget,
}: {
  className?: string;
  color: "white" | "primary" | "blue";
  hasTarget?: boolean;
}) => (
  <div
    className={`w-40 h-52 ${className} transition-all duration-300 ease-in-out hover:scale-110 cursor-default select-none -mx-4`}
  >
    <svg viewBox="0 0 80 100" className="w-full h-full drop-shadow-md">
      {/* Body */}
      <path
        d="M 10 90 Q 10 40, 40 40 Q 70 40, 70 90"
        fill={
          color === "blue"
            ? "#3B82F6"
            : color === "primary"
            ? "hsl(var(--primary))"
            : "#F3F4F6"
        }
        stroke={color === "white" ? "#111" : "#111"}
        strokeWidth="1"
      />
      {/* Head */}
      <circle
        cx="40"
        cy="25"
        r="18"
        fill={
          color === "blue"
            ? "#3B82F6"
            : color === "primary"
            ? "hsl(var(--primary))"
            : "#F3F4F6"
        }
        stroke={color === "white" ? "#111" : "#111"}
        strokeWidth="1"
      />
      {/* Target Marker */}
      {hasTarget && (
        <g transform="translate(40, 65)">
          <circle r="12" fill="white" stroke="black" strokeWidth="1.5" />
          <circle r="8" fill="none" stroke="black" strokeWidth="1.5" />
          <circle r="4" fill="black" />
        </g>
      )}
    </svg>
  </div>
);

const Persona = ({
  title,
  desc,
  align,
}: {
  title: string;
  desc: string;
  align: "left" | "right";
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className={align === "right" ? "text-right" : "text-left"}
  >
    <h3 className="text-lg font-bold mb-1 uppercase tracking-tight leading-tight">
      {title}
    </h3>
    <p className="text-xs text-muted-foreground leading-relaxed">{desc}</p>
  </motion.div>
);

const Arrow = ({
  start,
  finish,
  className,
}: {
  start: { x: number; y: number };
  finish: { x: number; y: number };
  className?: string;
}) => {
  const dx = finish.x - start.x;
  const dy = finish.y - start.y;
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);
  const length = Math.sqrt(dx * dx + dy * dy);

  return (
    <div
      className={`absolute pointer-events-none ${className}`}
      style={{
        left: start.x,
        top: start.y,
        width: length,
        height: 60,
        transform: `rotate(${angle}deg)`,
        transformOrigin: "0 50%",
      }}
    >
      <svg
        viewBox={`0 0 ${length} 60`}
        preserveAspectRatio="none"
        className="w-full h-full"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      >
        <path
          d={`M 0 30 Q ${length / 3} 10, ${length - 10} 25`}
          strokeDasharray="200"
          strokeDashoffset="0"
        />
        <path
          d={`M ${length - 20} 15 L ${length - 5} 30 L ${length - 20} 45`}
          fill="none"
        />
      </svg>
    </div>
  );
};
