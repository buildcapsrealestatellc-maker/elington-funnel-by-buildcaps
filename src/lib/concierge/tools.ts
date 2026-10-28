// Tools the Concierge can call. Data tools return figures from the engine;
// UI tools return an instruction the chat panel turns into a card or action.
// Every tool runs on the server, so one request answers a question.

import { type InferUITools, tool, type UIMessage } from "ai";
import { z } from "zod";
import { broker, whatsappLink } from "@/lib/data/broker";
import {
  amenitiesOn,
  brochureInfo,
  driveTimesTo,
  findOffices,
  type OfflineCall,
  type PlannerKey,
  paymentPlanFor,
  planners,
  type SectionKey,
  sectionKeys,
  sections,
} from "./engine";

const plannerKeys = Object.keys(planners) as [PlannerKey, ...PlannerKey[]];

/** The sales team's direct lines, with a WhatsApp chat that names the topic. */
function callbackFor(topic?: string) {
  const about = topic ? ` I'd like to talk about ${topic}.` : "";
  return {
    topic,
    phone: broker.phone,
    email: broker.email,
    whatsapp: whatsappLink(`Hi, I'm interested in Berkeley Tower by Ellington in Business Bay.${about}`),
  };
}

export const conciergeTools = {
  findOffices: tool({
    description:
      "Find Berkeley Tower office types by team size or area. Shows a card with matching office types, floors and sizes. Use whenever the visitor talks about their team, headcount or space needs.",
    inputSchema: z.object({
      teamSize: z.number().int().min(1).max(2000).optional().describe("Number of people who will use the office"),
      minSqft: z.number().min(100).max(50000).optional().describe("Smallest acceptable area in sq ft"),
      maxSqft: z.number().min(100).max(50000).optional().describe("Largest acceptable area in sq ft"),
    }),
    execute: async (input) => findOffices(input),
  }),
  paymentPlan: tool({
    description:
      "Show the official 70/30 payment plan as a card. If the visitor gives a purchase price in AED, include it to show amounts. Never guess a price.",
    inputSchema: z.object({
      price: z.number().min(100000).max(500000000).optional().describe("Purchase price in AED given by the visitor"),
    }),
    execute: async (input) => paymentPlanFor(input),
  }),
  driveTimes: tool({
    description: "Show drive times from Berkeley Tower, optionally filtered to a place the visitor mentions.",
    inputSchema: z.object({ place: z.string().max(80).optional() }),
    execute: async (input) => driveTimesTo(input),
  }),
  amenities: tool({
    description: "Show the amenity levels (32 to 35) and what is on each one.",
    inputSchema: z.object({ level: z.number().int().min(32).max(35).optional() }),
    execute: async (input) => amenitiesOn(input),
  }),
  showSection: tool({
    description:
      "Take the visitor to a section of this page. Use when they ask to see something, such as the floor plans or the payment plan.",
    inputSchema: z.object({ section: z.enum(sectionKeys) }),
    execute: async ({ section }) => ({ section, ...sections[section] }),
  }),
  openPlanner: tool({
    description:
      "Offer one of the interactive planners: spacedna (sizes a team's office and ranks office types) or horizon (own versus rent, payments and yield).",
    inputSchema: z.object({ planner: z.enum(plannerKeys) }),
    execute: async ({ planner }) => ({ planner, ...planners[planner] }),
  }),
  requestCallback: tool({
    description:
      "Offer a call back from a Berkeley consultant. Use for prices, availability, viewings, eligibility, legal, visa or finance questions, or when the visitor wants a person. Never collect personal details in the chat; this opens a secure form.",
    inputSchema: z.object({ topic: z.string().max(60).optional().describe("What the visitor wants to discuss") }),
    execute: async ({ topic }) => callbackFor(topic),
  }),
  sendBrochure: tool({
    description:
      "Offer the official Berkeley Tower brochure (floor plans for every office type, amenities, payment plan). Shows a card that unlocks the PDF through the secure form. Use whenever the visitor asks for the brochure, plans to keep, or something to share with partners.",
    inputSchema: z.object({}),
    execute: async () => brochureInfo(),
  }),
};

export type ConciergeTools = InferUITools<typeof conciergeTools>;
export type ConciergeMessage = UIMessage<never, never, ConciergeTools>;

/** Runs an offline call through the same executors the model would use. */
export async function runOfflineCall(call: OfflineCall): Promise<unknown> {
  switch (call.tool) {
    case "findOffices":
      return findOffices(call.input);
    case "paymentPlan":
      return paymentPlanFor(call.input);
    case "driveTimes":
      return driveTimesTo(call.input);
    case "amenities":
      return amenitiesOn(call.input);
    case "showSection":
      return { section: call.input.section, ...sections[call.input.section as SectionKey] };
    case "openPlanner":
      return { planner: call.input.planner, ...planners[call.input.planner] };
    case "requestCallback":
      return callbackFor(call.input.topic);
    case "sendBrochure":
      return brochureInfo();
  }
}
