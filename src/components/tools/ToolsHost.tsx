"use client";

import * as Dialog from "@radix-ui/react-dialog";
import dynamic from "next/dynamic";
import { useEffect, useRef } from "react";
import { BerkeleyMark } from "@/components/brand/logos";
import { gsap, prefersReducedMotion, setupGsap } from "@/lib/motion/gsap";
import { type ToolId, useUi } from "@/lib/store";

const OwnershipHorizon = dynamic(() => import("./OwnershipHorizon").then((m) => m.OwnershipHorizon));
const SpaceDna = dynamic(() => import("./SpaceDna").then((m) => m.SpaceDna));

export const toolMeta: Record<ToolId, { n: string; name: string; line: string }> = {
  spacedna: { n: "01", name: "SpaceDNA", line: "Match your team to the right Berkeley office." },
  horizon: { n: "02", name: "Ownership Horizon", line: "Own versus rent, payments and yield, year by year." },
};

/** Full-screen stage for the Berkeley Intelligence tools; opens like a curtain. */
export function ToolsHost() {
  const tool = useUi((s) => s.tool);
  const openTool = useUi((s) => s.openTool);
  const closeTool = useUi((s) => s.closeTool);
  const lenis = useUi((s) => s.lenis);
  const panel = useRef<HTMLDivElement>(null);
  const previous = useRef<ToolId | null>(null);

  useEffect(() => {
    if (tool) lenis?.stop();
    else lenis?.start();
  }, [tool, lenis]);

  useEffect(() => {
    const opening = !previous.current && !!tool;
    previous.current = tool;
    if (!tool) return;
    const id = requestAnimationFrame(() => {
      const el = panel.current;
      if (!el || prefersReducedMotion()) return;
      setupGsap();
      if (opening) {
        gsap.fromTo(
          el,
          { clipPath: "inset(100% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.9, ease: "expo.inOut" },
        );
      } else {
        el.scrollTo({ top: 0 });
      }
      gsap.fromTo(
        el.querySelectorAll("[data-tool-in]"),
        { autoAlpha: 0, y: 24 },
        { autoAlpha: 1, y: 0, duration: 1, ease: "expo.out", stagger: 0.06, delay: opening ? 0.45 : 0.05 },
      );
    });
    return () => cancelAnimationFrame(id);
  }, [tool]);

  const meta = tool ? toolMeta[tool] : null;

  return (
    <Dialog.Root open={!!tool} onOpenChange={(o) => !o && closeTool()}>
      <Dialog.Portal>
        <Dialog.Content
          ref={panel}
          data-lenis-prevent=""
          className="fixed inset-0 z-[75] overflow-y-auto overscroll-contain bg-mist text-ink"
        >
          <header className="sticky top-0 z-10 border-b border-line bg-paper/90 backdrop-blur-md">
            <div className="shell flex h-16 items-center justify-between gap-4 md:h-20">
              <div className="flex min-w-0 items-center gap-3">
                <BerkeleyMark className="h-5 w-auto shrink-0 text-ink" />
                <p className="eyebrow hidden text-[0.6rem] text-stone md:block">Berkeley Intelligence</p>
                <Dialog.Title className="sr-only">{meta?.name}</Dialog.Title>
              </div>
              <nav aria-label="Tools" className="flex rounded-full bg-mist p-1">
                {(Object.keys(toolMeta) as ToolId[]).map((id) => (
                  <button
                    key={id}
                    type="button"
                    aria-current={tool === id ? "page" : undefined}
                    onClick={() => openTool(id)}
                    className={`eyebrow cursor-pointer whitespace-nowrap rounded-full px-3 py-2.5 text-[0.54rem] transition-colors duration-300 sm:px-5 ${
                      tool === id ? "bg-ink text-paper" : "text-stone hover:text-ink"
                    }`}
                  >
                    <span className="mr-1.5 hidden opacity-60 sm:inline">{toolMeta[id].n}</span>
                    {toolMeta[id].name}
                  </button>
                ))}
              </nav>
              <Dialog.Close
                aria-label="Close the tool"
                className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full border border-line bg-paper transition-transform duration-500 hover:rotate-90"
              >
                <svg aria-hidden="true" viewBox="0 0 14 14" className="size-3" stroke="currentColor" strokeWidth={1.4}>
                  <path d="M1 1l12 12M13 1L1 13" />
                </svg>
              </Dialog.Close>
            </div>
          </header>
          <Dialog.Description className="sr-only">{meta?.line}</Dialog.Description>
          <div className="shell pb-28 pt-4 md:pb-20 md:pt-6">
            {tool === "horizon" && <OwnershipHorizon />}
            {tool === "spacedna" && <SpaceDna />}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
