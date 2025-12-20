"use client";

import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { motion } from "motion/react";

const contactInfo = [
  {
    icon: MapPin,
    title: "Our Location",
    details: [
      "Rm 105-B, G/F Maryville Bldg., Marymart Mall, Delgado Street, Iloilo City, Philippines",
    ],
  },
  {
    icon: Phone,
    title: "Phone Number",
    details: ["(033) 337 8341"],
  },
  {
    icon: Mail,
    title: "Email Address",
    details: ["iloilobusinessclub1990@gmail.com"],
  },
  {
    icon: Clock,
    title: "Office Hours",
    details: [
      "Monday - Friday: 8:00 AM - 5:00 PM",
      "Saturday: 9:00 AM - 12:00 PM",
    ],
  },
];

export function ContactInfoCards() {
  return (
    <section className="py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {contactInfo.map((info, index) => (
            <motion.div
              className="rounded-xl border border-border bg-card p-6 text-center transition-all duration-300 hover:border-primary/30 hover:shadow-lg"
              initial={{ opacity: 0, y: 20 }}
              key={info.title}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileInView={{ opacity: 1, y: 0 }}
            >
              <div className="mx-auto mb-4 inline-flex rounded-xl bg-primary/10 p-3">
                <info.icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-3 font-semibold text-foreground">
                {info.title}
              </h3>
              <div className="space-y-1">
                {info.details.map((detail) => (
                  <p className="text-muted-foreground text-sm" key={detail}>
                    {detail}
                  </p>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
