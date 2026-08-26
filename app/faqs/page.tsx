import { PageShell } from "@/components/PageShell";
import { MIN_BID } from "@/lib/data";
import { formatUsd } from "@/lib/format";

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How is rank decided?",
    answer:
      "Rank is determined entirely by bid amount. The store with the highest active bid in a category holds the #1 spot, the next highest holds #2, and so on.",
  },
  {
    question: "What happens when I get outbid?",
    answer:
      "Your store moves down the leaderboard to reflect the new order. You keep your listing and can increase your bid at any time to move back up.",
  },
  {
    question: "Is my bid refunded if someone outbids me?",
    answer:
      "No. Your payment is not refunded when another store outbids you. It does not guarantee that you'll remain in your current position.",
  },
  {
    question: `What's the minimum bid?`,
    answer: `${formatUsd(
      MIN_BID
    )} for a new listing. There's no maximum. To outbid an existing listing, your new bid must be at least $1 higher than the current bid.`,
  },
  {
    question: "Can I list my store in more than one category?",
    answer:
      "Each store gets one listing. If your store genuinely fits multiple categories, use the contact page and we'll help determine the best fit.",
  },
  {
    question: "How do I remove my store from the board?",
    answer:
      "Contact us through the contact page and we'll help you remove your listing.",
  },
  {
    question: "Is Outbid.store affiliated with other pay-to-rank leaderboards?",
    answer:
      "No. Outbid.store is an independent project built around the pay-to-rank mechanic, specifically for online stores.",
  },
];

const FAQS2: { question: string; answer: string }[] = [
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
    <PageShell
      title="faqs"
      intro="Everything you need to know about how Outbid.store works."
    >
      {FAQS.map((faq) => (
        <div key={faq.question}>
          <h2>{faq.question}</h2>
          <p>{faq.answer}</p>
        </div>
      ))}
    </PageShell>
  );
}
