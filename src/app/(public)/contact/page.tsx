import type { Metadata } from "next";
import { Suspense } from "react";
import { getPublicHeroSectionImages } from "@/server/website-content/queries/getPublicWebsiteContentSection";
import { ContactInfoCards } from "./_components/ContactCards";
import { ContactFAQ } from "./_components/ContactFAQ";
import { ContactForm } from "./_components/ContactForm";
import { ContactHero } from "./_components/ContactHero";
import { ContactMap } from "./_components/ContactMap";
import Loading from "./loading";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with IBC for inquiries and support.",
};

export default async function ContactPage() {
  const contactHeroImages = await getPublicHeroSectionImages("contact");

  return (
    <main className="min-h-screen bg-background">
      <Suspense fallback={<Loading />}>
        <ContactHero backgroundImages={contactHeroImages} />
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
