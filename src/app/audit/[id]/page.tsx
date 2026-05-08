import { Metadata } from "next";
import AuditResultClient from "./AuditResultClient";

export const metadata: Metadata = {
  title: "My AI Spend Audit — AI Spend Audit",
  description: "See how much I could save on AI tools every month.",
  openGraph: {
    title: "My AI Spend Audit",
    description: "See how much I could save on AI tools every month.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "My AI Spend Audit",
    description: "See how much I could save on AI tools every month.",
  },
};

export default function AuditResultPage() {
  return <AuditResultClient />;
}