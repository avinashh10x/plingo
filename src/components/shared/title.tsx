"use client";

import { motion } from "framer-motion";

type TitleProps = {
  title: string;
  className?: string;
  preTitle?: string;
  subTitle?: string;
};

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.12,
    },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.0, 0.0, 0.2, 1.0] },
  },
};

function Title({ title, className = "", preTitle, subTitle }: TitleProps) {
  return (
    <motion.div
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className={`max-w-2xl mx-auto text-center flex flex-col items-center ${className}`}
    >
      {preTitle && (
        <motion.span
          variants={item}
          className="mb-3 text-xs uppercase tracking-widest text-muted-foreground/30 font-medium font-sentient"
        >
          {preTitle}
        </motion.span>
      )}

      <motion.h2
        variants={item}
        className="text-2xl md:text-4xl font-bold leading-tight tracking-tight"
      >
        {title}
      </motion.h2>

      {subTitle && (
        <motion.p
          variants={item}
          className="mt-4 text-xs md:text-xl text-muted-foreground/30 max-w-2xl font-sentient"
        >
          {subTitle}
        </motion.p>
      )}
    </motion.div>
  );
}

export default Title;
