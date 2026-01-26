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
        <section className="bg-card py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid gap-12 lg:grid-cols-2">
              <ContactForm />
              <ContactMap />
            </div>
          </div>
        </section>
        <ContactFAQ />
      </Suspense>
    </main>
  );
}
