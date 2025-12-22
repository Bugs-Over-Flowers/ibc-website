"use client";

import { motion } from "motion/react";

const faqs = [
  {
    question: "How do I become a member?",
    answer:
      "You can apply for membership by filling out our contact form with 'Membership Application' as the inquiry type, or by visiting our office during business hours. Our team will guide you through the application process.",
  },
  {
    question: "What are the membership requirements?",
    answer:
      "Membership is open to legitimate businesses operating in Iloilo and the Western Visayas region. Applicants must be endorsed by an existing member and approved by our membership committee.",
  },
  {
    question: "What benefits do members receive?",
    answer:
      "Members enjoy access to exclusive networking events, business forums, training programs, advocacy support, and opportunities to connect with fellow business leaders and potential partners.",
  },
  {
    question: "How can my organization partner with IBC?",
    answer:
      "We welcome partnerships with organizations that share our vision for business excellence. Please reach out through our contact form or email us directly to discuss potential collaboration opportunities.",
  },
];

export function ContactFAQ() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          whileInView={{ opacity: 1, y: 0 }}
        >
          <span className="mb-4 inline-block rounded-lg bg-primary/10 px-4 py-1.5 font-medium text-primary text-sm">
            FAQ
          </span>
          <h2 className="mb-4 text-balance font-bold text-2xl text-foreground sm:text-3xl">
            Frequently Asked Questions
          </h2>
        </motion.div>

        <div className="mx-auto max-w-3xl">
          {faqs.map((faq, index) => (
            <motion.div
              className="border-border border-b py-6"
              initial={{ opacity: 0, y: 20 }}
              key={faq.question}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <h3 className="mb-2 font-semibold text-foreground text-lg">
                {faq.question}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
