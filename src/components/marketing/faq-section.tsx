import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { demoFaqs } from "@/config/demo-data";

export function FaqSection({ showHeading = true }: { showHeading?: boolean }) {
  return (
    <section className="border-b border-border bg-muted/30">
      <div className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
        {showHeading && (
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-muted-foreground">
              Answers to common questions about courses, webinars, payments, and more.
            </p>
          </div>
        )}

        <Accordion className="rounded-2xl border border-border bg-card px-6">
          {demoFaqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger>{faq.question}</AccordionTrigger>
              <AccordionContent>{faq.answer}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
