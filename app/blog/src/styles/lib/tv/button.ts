import { tv } from "tailwind-variants";
export const tvButton = tv({
  base: "text-content rounded-lg transition-colors select-none",
  variants: {
    color: {
      primary: "hover:bg-primary/20 active:bg-primary/30 bg-transparent",
    },
  },
  defaultVariants: {
    color: "primary",
  },
});
