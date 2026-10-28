"use client";

import { useId, useState } from "react";
import { faq } from "@/lib/data/faq";

/** One answer open at a time; rows open by animating grid rows, no measuring. */
export function FaqList() {
  const [open, setOpen] = useState<number | null>(0);
  const id = useId();

  return (
    <div className="border-t border-line">
      {faq.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.q} className="border-b border-line">
            <h3>
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={`${id}-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="group flex w-full cursor-pointer items-center justify-between gap-6 py-6 text-left md:py-7"
              >
                <span className="flex items-baseline gap-5">
                  <span className="numerals text-[0.75rem] text-stone">{String(i + 1).padStart(2, "0")}</span>
                  <span
                    className={`text-[1.02rem] leading-snug transition-colors duration-300 md:text-[1.15rem] ${
                      isOpen ? "text-accent" : "text-ink group-hover:text-accent"
                    }`}
                  >
                    {item.q}
                  </span>
                </span>
                <span
                  aria-hidden="true"
                  className={`grid size-9 shrink-0 place-items-center rounded-full border transition-all duration-500 ease-[var(--ease-out)] ${
                    isOpen
                      ? "rotate-45 border-accent bg-accent text-paper"
                      : "border-line text-ink group-hover:border-ink/40"
                  }`}
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 12 12"
                    className="size-2.5"
                    stroke="currentColor"
                    strokeWidth={1.4}
                  >
                    <path d="M6 1v10M1 6h10" />
                  </svg>
                </span>
              </button>
            </h3>
            <div
              id={`${id}-${i}`}
              className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[var(--ease-out)] ${
                isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
              }`}
            >
              <div className="overflow-hidden">
                <p className="max-w-2xl pb-7 pl-10 text-[0.98rem] leading-[1.8] text-stone">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
