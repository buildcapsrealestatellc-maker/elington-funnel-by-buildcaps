import type { Metadata } from "next";
import { ThankYouSequence } from "@/components/lead/ThankYouSequence";

export const metadata: Metadata = {
  title: "Welcome to the top | Berkeley Tower by Ellington",
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  return <ThankYouSequence />;
}
