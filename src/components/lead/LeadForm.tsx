"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import type { CountryCode } from "libphonenumber-js/min";
import { AnimatePresence, motion } from "motion/react";
import { useRouter } from "next/navigation";
import { useId, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { ArrowCircle, buttonClass, DownloadCircle } from "@/components/ui/Buttons";
import { broker } from "@/lib/data/broker";
import { getAttribution } from "@/lib/lead/attribution";
import { downloadBrochure } from "@/lib/lead/brochure";
import { contactPrefs, type LeadInput, leadSchema, type Offer, purposes, sizes, timelines } from "@/lib/lead/schema";
import { useUi } from "@/lib/store";
import { PhoneField, toE164 } from "./PhoneField";

type Variant = "full" | "quick";

/** Progress = the three cantilevered bars of the Berkeley mark filling in. */
function StepBars({ step, total }: { step: number; total: number }) {
  const widths = ["w-10", "w-16", "w-12"];
  return (
    <div className="flex flex-col gap-1.5" aria-hidden="true">
      {Array.from({ length: total }, (_, i) => (
        <span
          // biome-ignore lint/suspicious/noArrayIndexKey: fixed step count
          key={i}
          className={`h-[3px] rounded-full transition-colors duration-500 ${widths[i % 3]} ${
            i <= step ? "bg-accent" : "bg-ink/10"
          } ${i === 1 ? "" : "ml-3"}`}
        />
      ))}
    </div>
  );
}

const slide = {
  initial: { opacity: 0, x: 24, filter: "blur(4px)" },
  animate: { opacity: 1, x: 0, filter: "blur(0px)" },
  exit: { opacity: 0, x: -24, filter: "blur(4px)" },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
};

export function LeadForm({
  variant = "full",
  offer = "access",
  source,
  unit,
  defaultPurpose,
  defaultSize,
  tone = "light",
  onSuccess,
}: {
  variant?: Variant;
  /** "brochure" unlocks the PDF on submit; every lead can download it after. */
  offer?: Offer;
  source: string;
  unit?: string;
  defaultPurpose?: LeadInput["purpose"];
  defaultSize?: LeadInput["size"];
  tone?: "light" | "glass";
  onSuccess?: () => void;
}) {
  const uid = useId();
  const router = useRouter();
  const markLeadSubmitted = useUi((s) => s.markLeadSubmitted);
  const steps = variant === "full" ? 3 : 1;
  const [step, setStep] = useState(variant === "full" && defaultPurpose ? 1 : 0);
  const [phone, setPhone] = useState<{ country: CountryCode; national: string }>({ country: "AE", national: "" });
  const [serverError, setServerError] = useState("");
  const [stepError, setStepError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LeadInput>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      source,
      offer,
      unit,
      purpose: defaultPurpose,
      size: defaultSize,
      contactPref: "whatsapp",
      email: "",
      marketing: false,
      company: "",
    },
  });

  const purpose = watch("purpose");
  const size = watch("size");
  const timeline = watch("timeline");
  const contactStep = variant === "quick" ? 0 : 2;
  const wantsBrochure = offer === "brochure";

  // Every question is required: the size and timeline step won't advance blank.
  const continueFromSize = () => {
    if (!size || !timeline) {
      setStepError(!size && !timeline ? "Choose a size and a timeline" : !size ? "Choose a size" : "Choose a timeline");
      return;
    }
    setStepError("");
    setStep(2);
  };

  const onSubmit = handleSubmit(async (data) => {
    setServerError("");
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...data, attribution: getAttribution() }),
      });
      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        id?: string;
        emailed?: boolean;
        error?: string;
      };
      if (!res.ok || !json.ok) throw new Error(json.error ?? "Something went wrong");
      try {
        sessionStorage.setItem(
          "bt-lead",
          JSON.stringify({
            firstName: data.fullName.split(" ")[0],
            id: json.id,
            at: Date.now(),
            offer,
            email: json.emailed ? data.email : undefined,
          }),
        );
      } catch {}
      // Desktop gets the file at once; phones get a download button on the
      // thank-you page, where opening a PDF doesn't replace the page.
      if (wantsBrochure && window.matchMedia("(pointer: fine)").matches) downloadBrochure(source);
      markLeadSubmitted();
      onSuccess?.();
      router.push("/thank-you");
    } catch (e) {
      setServerError(
        e instanceof Error && e.message !== "Failed to fetch"
          ? e.message
          : `We couldn't send that. Please try again, or call or WhatsApp ${broker.phone}.`,
      );
    }
  });

  const field = "flex flex-col gap-2";
  const labelCls = "eyebrow text-[0.64rem] text-stone";
  const input =
    "h-14 rounded-xl border border-ink/12 bg-paper px-4 text-[1rem] text-ink outline-none transition placeholder:text-stone/50 focus:border-accent/60";
  const err = "text-[0.8rem] text-[#d0342c]";
  const chip = (active: boolean) =>
    `cursor-pointer rounded-full border px-4 py-2.5 text-[0.9rem] transition duration-300 ${
      active ? "border-accent bg-accent text-paper" : "border-ink/12 bg-paper text-ink hover:border-ink/35"
    }`;

  return (
    <form noValidate onSubmit={onSubmit} className={tone === "glass" ? "text-ink" : "text-ink"}>
      <input type="hidden" {...register("source")} />
      <input type="hidden" {...register("offer")} />
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={`${uid}-company`}>Company</label>
        <input id={`${uid}-company`} tabIndex={-1} autoComplete="off" {...register("company")} />
      </div>

      {variant === "full" && (
        <div className="mb-8 flex items-center justify-between">
          <StepBars step={step} total={steps} />
          <span className="numerals text-[0.75rem] tracking-[0.2em] text-stone">
            {String(step + 1).padStart(2, "0")} / {String(steps).padStart(2, "0")}
          </span>
        </div>
      )}

      <div className={`relative ${variant === "full" ? "min-h-[22rem]" : ""}`}>
        <AnimatePresence mode="wait" initial={false}>
          {variant === "full" && step === 0 && (
            <motion.fieldset key="s0" {...slide} className="flex min-w-0 flex-col gap-6">
              <legend className="display mb-6 text-[2rem] leading-tight sm:text-[2.4rem]">
                What brings you to <em>Berkeley</em>?
              </legend>
              <div className="grid gap-3">
                {purposes.map((p) => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => {
                      setValue("purpose", p.value);
                      setStep(1);
                    }}
                    className={`group corner-sm flex cursor-pointer items-center justify-between border py-3 pl-5 pr-3 text-left transition duration-300 ${
                      purpose === p.value ? "border-accent bg-accent/5" : "border-ink/12 bg-paper hover:border-ink/35"
                    }`}
                  >
                    <span className="text-[1.05rem]">{p.label}</span>
                    <ArrowCircle className="text-accent" />
                  </button>
                ))}
              </div>
            </motion.fieldset>
          )}

          {variant === "full" && step === 1 && (
            <motion.fieldset key="s1" {...slide} className="flex min-w-0 flex-col gap-7">
              <legend className="display mb-6 text-[2rem] leading-tight sm:text-[2.4rem]">
                What size are you <em>considering</em>?
              </legend>
              <div className="flex flex-wrap gap-2">
                {sizes.map((s) => (
                  <button
                    key={s}
                    type="button"
                    aria-pressed={size === s}
                    className={chip(size === s)}
                    onClick={() => {
                      setValue("size", s);
                      setStepError("");
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-3">
                <span className={labelCls}>Timeline</span>
                <div className="flex flex-wrap gap-2">
                  {timelines.map((t) => (
                    <button
                      key={t}
                      type="button"
                      aria-pressed={timeline === t}
                      className={chip(timeline === t)}
                      onClick={() => {
                        setValue("timeline", t);
                        setStepError("");
                      }}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              {stepError && (
                <p role="alert" className={`${err} -mt-2`}>
                  {stepError}
                </p>
              )}
              <div className="mt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="eyebrow cursor-pointer text-stone hover:text-ink"
                >
                  Back
                </button>
                <button type="button" onClick={continueFromSize} className={buttonClass("primary", "", true)}>
                  <span className="relative z-[2]">Continue</span>
                  <ArrowCircle tone="solid" className="relative z-[2]" />
                </button>
              </div>
            </motion.fieldset>
          )}

          {step === contactStep && (
            <motion.fieldset
              key="s2"
              {...slide}
              className={`flex min-w-0 flex-col ${variant === "quick" ? "gap-4" : "gap-5"}`}
            >
              {variant === "full" && (
                <legend className="display mb-4 text-[2rem] leading-tight sm:text-[2.4rem]">
                  Where should we send your <em>{wantsBrochure ? "brochure" : "launch access"}</em>?
                </legend>
              )}
              <div className={field}>
                <label className={labelCls} htmlFor={`${uid}-name`}>
                  Full name
                </label>
                <input
                  id={`${uid}-name`}
                  autoComplete="name"
                  className={input}
                  aria-invalid={!!errors.fullName || undefined}
                  aria-describedby={errors.fullName ? `${uid}-name-err` : undefined}
                  {...register("fullName")}
                />
                {errors.fullName && (
                  <p id={`${uid}-name-err`} className={err}>
                    {errors.fullName.message}
                  </p>
                )}
              </div>

              <div className={field}>
                <label className={labelCls} htmlFor={`${uid}-phone`}>
                  Mobile (WhatsApp)
                </label>
                <Controller
                  control={control}
                  name="phone"
                  render={({ field: f }) => (
                    <PhoneField
                      id={`${uid}-phone`}
                      value={phone}
                      invalid={!!errors.phone}
                      describedBy={errors.phone ? `${uid}-phone-err` : undefined}
                      onChange={(v) => {
                        setPhone(v);
                        f.onChange(toE164(v));
                      }}
                    />
                  )}
                />
                {errors.phone && (
                  <p id={`${uid}-phone-err`} className={err}>
                    {errors.phone.message}
                  </p>
                )}
              </div>

              <div className={field}>
                <label className={labelCls} htmlFor={`${uid}-email`}>
                  Email
                </label>
                <input
                  id={`${uid}-email`}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  className={input}
                  aria-invalid={!!errors.email || undefined}
                  aria-describedby={errors.email ? `${uid}-email-err` : undefined}
                  {...register("email")}
                />
                {errors.email && (
                  <p id={`${uid}-email-err`} className={err}>
                    {errors.email.message}
                  </p>
                )}
              </div>

              {variant === "full" && (
                <div className="flex flex-col gap-3">
                  <span className={labelCls}>Preferred contact</span>
                  <div className="flex flex-wrap gap-2">
                    {contactPrefs.map((c) => (
                      <label key={c.value} className={chip(watch("contactPref") === c.value)}>
                        <input type="radio" value={c.value} className="sr-only" {...register("contactPref")} />
                        {c.label}
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <label className="mt-1 flex cursor-pointer items-start gap-3 text-[0.85rem] leading-relaxed text-stone">
                <input
                  type="checkbox"
                  className="mt-1 size-4 shrink-0 accent-[var(--color-accent)]"
                  {...register("consent")}
                />
                <span>
                  I agree to be contacted about Berkeley Tower and accept the{" "}
                  <a href="#privacy" className="underline decoration-ink/30 underline-offset-2 hover:text-ink">
                    privacy notice
                  </a>
                  .
                </span>
              </label>
              {errors.consent && <p className={err}>{errors.consent.message}</p>}
              {variant === "full" && (
                <label className="-mt-2 flex cursor-pointer items-start gap-3 text-[0.85rem] leading-relaxed text-stone">
                  <input
                    type="checkbox"
                    className="mt-1 size-4 shrink-0 accent-[var(--color-accent)]"
                    {...register("marketing")}
                  />
                  <span>Send me future Ellington launches and updates (optional).</span>
                </label>
              )}

              {serverError && (
                <p role="alert" className={err}>
                  {serverError}
                </p>
              )}

              <div className="mt-2 flex items-center justify-between gap-4">
                {variant === "full" ? (
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="eyebrow cursor-pointer text-stone hover:text-ink"
                  >
                    Back
                  </button>
                ) : (
                  <span />
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={buttonClass("primary", "flex-1 justify-between! sm:flex-none", true)}
                >
                  <span className="relative z-[2]">
                    {isSubmitting ? (
                      "Sending…"
                    ) : wantsBrochure ? (
                      <>
                        <span className="sm:hidden">Get the brochure</span>
                        <span className="max-sm:hidden">Download the brochure</span>
                      </>
                    ) : (
                      "Request launch access"
                    )}
                  </span>
                  {wantsBrochure && !isSubmitting ? (
                    <DownloadCircle tone="solid" className="relative z-[2]" />
                  ) : (
                    <ArrowCircle tone="solid" className={`relative z-[2] ${isSubmitting ? "animate-spin" : ""}`} />
                  )}
                </button>
              </div>
            </motion.fieldset>
          )}
        </AnimatePresence>
      </div>
    </form>
  );
}
