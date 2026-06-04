import { cn } from "@/lib/utils";

interface LogoProps {
  tone?: "dark" | "light";
  withByline?: boolean;
  className?: string;
}

/**
 * MEDfacials wordmark rendered in the brand serif so it stays crisp and
 * themeable across cream and dark surfaces.
 */
export function Logo({ tone = "dark", withByline = false, className }: LogoProps) {
  const main = tone === "light" ? "text-white" : "text-heading";
  const sub = tone === "light" ? "text-white/70" : "text-body/70";
  return (
    <span className={cn("inline-flex flex-col leading-none", className)}>
      <span className={cn("font-serif text-2xl tracking-tight", main)}>
        <span className="font-semibold">MED</span>
        <span className="italic">facials</span>
      </span>
      {withByline && (
        <span
          className={cn(
            "mt-1 text-[10px] font-medium uppercase tracking-[0.32em]",
            sub,
          )}
        >
          by Dr Stolte
        </span>
      )}
    </span>
  );
}
