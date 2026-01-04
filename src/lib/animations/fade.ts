export const createFadeInUp = (
  y: number = 30,
  duration: number = 0.6,
  delay: number = 0,
) => ({
  hidden: { opacity: 0, y },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration,
      delay,
      ease: ["easeIn", "easeOut"] as [string, string],
    },
  },
});

export const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" } as const,
  },
};
