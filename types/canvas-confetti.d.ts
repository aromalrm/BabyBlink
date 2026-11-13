declare module "canvas-confetti" {
  interface Options {
    particleCount?: number;
    spread?: number;
    origin?: { x?: number; y?: number };
    colors?: string[];
    scalar?: number;
    disableForReducedMotion?: boolean;
  }
  export default function confetti(options?: Options): Promise<null> | null;
}
