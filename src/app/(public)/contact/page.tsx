import { Suspense } from "react";
import { ContactInfoCards } from "./_components/ContactCards";
import { ContactFAQ } from "./_components/ContactFAQ";
import { ContactForm } from "./_components/ContactForm";
import { ContactHero } from "./_components/ContactHero";
import { ContactMap } from "./_components/ContactMap";
import Loading from "./loading";

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<Loading />}>
        <ContactHero />
        <ContactInfoCards />
        <section className="bg-card py-16 md:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 items-start gap-12 md:grid-cols-2 md:gap-16">
              <div className="mx-auto w-full max-w-xl md:mx-0">
                <ContactForm />
              </div>
              <div className="mx-auto w-full max-w-xl md:mx-0">
                <ContactMap />
              </div>
            </div>
          </div>
        </section>
        <ContactFAQ />
      </Suspense>
    </main>
  );
}
