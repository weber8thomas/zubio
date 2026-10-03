import Image from "next/image";
import { brand } from "@/config/brand";

export function Logo({ height = 28, variant = "full" }: { height?: number; variant?: "full" | "symbol" }) {
  const src = variant === "full" ? brand.logo.full : brand.logo.symbol;
  const ratio = variant === "full" ? 148 / 48 : 1;
  return (
    <Image src={src} alt={brand.name} width={Math.round(height * ratio)} height={height} priority unoptimized />
  );
}
