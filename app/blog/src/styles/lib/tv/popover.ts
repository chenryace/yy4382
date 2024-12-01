import { tv } from "tailwind-variants";
export const popover = tv({
  slots: {
    base: `group bg-popover hover:ease-spring absolute flex size-8 items-end justify-end rounded-2xl p-1 outline outline-gray-200 transition-[width,height] delay-[var(--fade-content-duration)] duration-[var(--shrink-bg-duration)] ease-in-out [--extend-bg-duration:500ms] [--fade-content-duration:100ms] [--show-content-delay:200ms] [--show-content-duration:200ms] [--shrink-bg-duration:300ms] hover:delay-0 hover:duration-[var(--extend-bg-duration)] dark:outline-gray-600`,
    contentWrapper: `absolute right-0 bottom-0 size-0 transition-[width,height] duration-[var(--fade-content-duration)] ease-[steps(1,end)] group-hover:transition-none`,
    content: `pointer-events-none invisible opacity-0 transition-[visibility,opacity] duration-[var(--fade-content-duration)] group-hover:pointer-events-auto group-hover:visible group-hover:opacity-100 group-hover:delay-[var(--show-content-delay)] group-hover:duration-[var(--show-content-duration)]`,
    icon: "text-primary size-6",
  },
});
