"use client";

import { brochure } from "@/lib/data/tower";
import { track } from "./track";

/** Starts the brochure download; call it from a click or a submitted form. */
export function downloadBrochure(source: string) {
  const a = document.createElement("a");
  a.href = brochure.url;
  a.download = brochure.fileName;
  a.target = "_blank";
  a.rel = "noopener";
  document.body.append(a);
  a.click();
  a.remove();
  track("brochure_download", { source });
}
