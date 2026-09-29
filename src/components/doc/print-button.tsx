"use client";

import { beacon } from "@/lib/beacon";

/** Print the page — the /cv print stylesheet makes this the PDF résumé. */
export function PrintButton() {
  return (
    <button
      type="button"
      onClick={() => {
        beacon("cv_print");
        window.print();
      }}
      className="border border-accent px-3 py-1.5 font-mono text-[11px] tracking-wider text-accent uppercase transition-colors hover:bg-accent hover:text-paper"
    >
      print / save as pdf
    </button>
  );
}
