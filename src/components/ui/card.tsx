import type { ComponentProps } from "react";
import { cn } from "@/lib/cn";

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("rounded-[12px] border border-line bg-white p-4 sm:p-5", className)} {...props} />;
}
