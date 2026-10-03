"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintButton() {
  return (
    <Button type="button" variant="secondary" onClick={() => window.print()}>
      <Printer size={20} strokeWidth={1.75} aria-hidden />
      Imprimer
    </Button>
  );
}
