import { PageShell } from "@/components/PageShell";
import { MIN_BID } from "@/lib/data";
import { formatUsd } from "@/lib/format";

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How is rank decided?",
    answer:
      "Purely by bid amount. The store with the highest active bid in a category holds the top spot.",
  },
  {
    question: "What happens when I get outbid?",
    answer:
      "You move down to reflect the new order. You keep your listing and can bid again anytime to reclaim a higher spot.",
  },
  {
    question: "Is my bid refunded if someone outbids me?",
    answer:
      "No. Your payment covers the time you held the position, not a guaranteed slot.",
  },
  {
    question: `What's the minimum bid?`,
    answer: `${formatUsd(
      MIN_BID
    )} for a new listing. There's no maximum, and outbidding an existing listing just needs to be at least a dollar higher.`,
  },
  {
    question: "Can I list in more than one category?",
    answer:
      "Each store gets one listing. If your store genuinely spans categories, use the contact page and we'll figure out the best fit.",
  },
  {
    question: "How do I remove my store from the board?",
    answer: "Reach out through the contact page and we'll take it down.",
  },
  {
    question: "Is this affiliated with other pay-to-rank leaderboards?",
    answer:
      "No. outbid.store is an independent project built around the same mechanic, applied to stores.",
  },
];

export default function FaqsPage() {
  return (
    <PageShell title="faqs">
      {FAQS.map((faq) => (
        <div key={faq.question}>
          <h2>{faq.question}</h2>
          <p>{faq.answer}</p>
        </div>
      ))}
    </PageShell>
  );
}
