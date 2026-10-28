import { describe, expect, it } from "vitest";
import { chapterFacts, cleanQuip, describeMoment, offlineQuip, quipKinds, quipPrompt, quipRequest } from "./quips";

const req = (over: Partial<Parameters<typeof quipRequest.parse>[0]> = {}) =>
  quipRequest.parse({ kind: "fast-scroll", chapter: "Technology", ...over });

describe("offlineQuip", () => {
  it("never repeats a line within a visit", () => {
    const said: string[] = [];
    for (let i = 0; i < 40; i++) {
      const line = offlineQuip(req({ recent: said.slice(-40) }));
      expect(said).not.toContain(line);
      said.push(line);
    }
  });

  it("has something to say for every moment", () => {
    for (const kind of quipKinds) {
      const line = offlineQuip(req({ kind, target: "Launch access" }));
      expect(line.length).toBeGreaterThan(10);
      expect(line).not.toMatch(/\{|\}/);
    }
  });

  it("speaks to the section the visitor is in", () => {
    expect(offlineQuip(req({ kind: "chapter", chapter: "Location" }))).toMatch(/DIFC/);
    expect(offlineQuip(req({ kind: "chapter", chapter: "Golden Visa" }))).toMatch(/ten-year|ten years/i);
  });

  it("names the button being hovered", () => {
    const line = offlineQuip(req({ kind: "cta-hover", target: "Get prices" }), () => 0);
    expect(line).toContain('"Get prices"');
  });
});

describe("prompting the model", () => {
  it("describes the moment and lists what was already said", () => {
    const p = quipPrompt(req({ kind: "linger", seconds: 52, recent: ["Old line one."] }));
    expect(p).toContain("52 seconds");
    expect(p).toContain(chapterFacts.Technology);
    expect(p).toContain("- Old line one.");
  });

  it("covers every moment", () => {
    for (const kind of quipKinds) expect(describeMoment(req({ kind }))).toBeTruthy();
  });

  it("cleans model output to one plain line", () => {
    expect(cleanQuip('  "Ellis: Twelve lifts,\n and you chose the stairs."  ')).toBe(
      "Twelve lifts, and you chose the stairs.",
    );
  });

  it("rejects malformed requests", () => {
    expect(quipRequest.safeParse({ kind: "dance" }).success).toBe(false);
    expect(quipRequest.safeParse({ kind: "idle", recent: Array(41).fill("x") }).success).toBe(false);
  });
});
