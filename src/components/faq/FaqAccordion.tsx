"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Faq } from "@/lib/types/database.types";

// Custom button/panel accordion (rather than native <details>) so the panel
// height can animate smoothly and opening one question reliably closes any
// other — see the `.faq-panel` grid-rows technique in globals.css.
export function FaqAccordion({ faqs }: { faqs: Faq[] }) {
  const [openId, setOpenId] = useState<string | null>(null);

  if (faqs.length === 0) {
    return <p className="text-center text-ink-soft">De veelgestelde vragen worden binnenkort toegevoegd.</p>;
  }

  return (
    <div className="divide-y divide-line border-t border-b border-line">
      {faqs.map((faq) => {
        const isOpen = openId === faq.id;
        const buttonId = `faq-button-${faq.id}`;
        const panelId = `faq-panel-${faq.id}`;

        return (
          <div key={faq.id} className="py-2">
            <h3>
              <button
                type="button"
                id={buttonId}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpenId(isOpen ? null : faq.id)}
                className="flex w-full cursor-pointer list-none items-center justify-between gap-4 py-4 text-left font-serif text-lg text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brown sm:text-xl"
              >
                {faq.question}
                <Plus
                  size={20}
                  className={cn(
                    "shrink-0 text-brown transition-transform duration-300",
                    isOpen && "rotate-45"
                  )}
                  aria-hidden="true"
                />
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={cn("faq-panel", isOpen && "is-open")}
            >
              <div className="overflow-hidden">
                <p className="max-w-2xl pb-6 text-base leading-relaxed text-ink-soft">{faq.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
