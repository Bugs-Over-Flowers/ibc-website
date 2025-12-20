"use client";

import { motion } from "motion/react";

export function ContactMap() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      viewport={{ once: true }}
      whileInView={{ opacity: 1, x: 0 }}
    >
      <h2 className="mb-2 font-bold text-2xl text-foreground sm:text-3xl">
        Find Us
      </h2>
      <p className="mb-8 text-muted-foreground">
        Visit our office at Marymart Center III. We're located in the heart of
        Iloilo City, ready to assist you with your inquiries.
      </p>

      <div className="overflow-hidden rounded-xl border border-border">
        <div className="relative aspect-4/3 bg-muted">
          <iframe
            height="450"
            loading="lazy"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3920.481233753715!2d122.56452187451627!3d10.697316060649088!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x33aee56f650e1e15%3A0xc466ff94ff952298!2sIloilo%20Business%20Club%2C%20Inc.!5e0!3m2!1sen!2sph!4v1765919232271!5m2!1sen!2sph"
            title="Iloilo Business Club Office Location Map"
            width="600"
          ></iframe>
        </div>
        <div className="bg-background p-6">
          <h3 className="mb-2 font-semibold text-foreground">
            Iloilo Business Club, Inc. Office
          </h3>
          <p className="text-muted-foreground text-sm">
            Iloilo Business Club, Inc.
            <br />
            GF Rm. 105-B Maryville Bldg., Marymart Mall, Delgado St., Iloilo
            City 5000{" "}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
